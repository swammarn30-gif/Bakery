import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export type DirectSignInResult = {
  data: { access_token: string; refresh_token: string; expires_in?: number; expires_at?: number; token_type?: string; user?: unknown } | null;
  error: { message: string } | null;
};

type AuthFetchResult = { response?: Response; transportError?: unknown };

function getAuthStorageKey() {
  if (!url) return null;
  try {
    return `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
  } catch {
    return null;
  }
}

async function fetchAuthToken(endpoint: string, email: string, password: string, timeoutMs: number, fetchImpl: typeof fetch, headers: Record<string, string>): Promise<AuthFetchResult> {
  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ email: email.trim(), password }),
      signal: controller.signal,
    });
    return { response };
  } catch (error: unknown) {
    return { transportError: error };
  } finally {
    globalThis.clearTimeout(timer);
  }
}

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function isTransportFailure(result: AuthFetchResult) {
  return !result.response && result.transportError;
}

function isRetryableProxyResponse(response: Response) {
  return response.status >= 500 && response.status <= 599;
}

async function parseAuthResponse(response: Response): Promise<DirectSignInResult> {
  let body: Record<string, unknown>;
  try {
    body = await response.json() as Record<string, unknown>;
  } catch {
    return { data: null, error: { message: "Sign in service returned an invalid response. Please try again." } };
  }
  if (!response.ok || typeof body.access_token !== "string" || typeof body.refresh_token !== "string") {
    return { data: null, error: { message: typeof body.error_description === "string" ? body.error_description : typeof body.msg === "string" ? body.msg : "Sign in failed. Check your email and password." } };
  }
  return {
    data: {
      access_token: body.access_token,
      refresh_token: body.refresh_token,
      expires_in: typeof body.expires_in === "number" ? body.expires_in : undefined,
      expires_at: typeof body.expires_at === "number" ? body.expires_at : undefined,
      token_type: typeof body.token_type === "string" ? body.token_type : "bearer",
      user: body.user,
    },
    error: null,
  };
}

export async function signInWithPasswordRest(email: string, password: string, timeoutMs = 15000, fetchImpl: typeof fetch = globalThis.fetch): Promise<DirectSignInResult> {
  if (typeof window !== "undefined" && !url) return { data: null, error: { message: "Supabase Auth is not configured." } };
  if (!url || !anonKey) return { data: null, error: { message: "Supabase Auth is not configured." } };

  const authEndpoint = `${url}/auth/v1/token?grant_type=password`;
  let result: DirectSignInResult;

  if (typeof window !== "undefined") {
    // Prefer same-origin Vercel proxy on mobile. Direct Supabase requests can
    // stall until the browser's network state is toggled, while the proxy
    // reaches Supabase from the server and avoids that connection issue.
    const proxyTimeout = Math.min(10000, Math.max(4000, timeoutMs - 5000));
    const proxy = await fetchAuthToken("/api/auth/sign-in", email, password, proxyTimeout, fetchImpl, { "x-supabase-url": url, apikey: anonKey });
    if (proxy.response && !isRetryableProxyResponse(proxy.response)) {
      result = await parseAuthResponse(proxy.response);
    } else {
      const direct = await fetchAuthToken(authEndpoint, email, password, Math.max(1000, timeoutMs - proxyTimeout), fetchImpl, { apikey: anonKey });
      if (direct.response) result = await parseAuthResponse(direct.response);
      else result = { data: null, error: { message: isAbort(proxy.transportError) || isAbort(direct.transportError) ? "Sign in timed out. Check your connection and try again." : "Unable to reach sign-in service. Check your connection and try again." } };
    }
  } else {
    const direct = await fetchAuthToken(authEndpoint, email, password, timeoutMs, fetchImpl, { apikey: anonKey });
    if (direct.response) result = await parseAuthResponse(direct.response);
    else result = { data: null, error: { message: isAbort(direct.transportError) ? "Sign in timed out. Check your connection and try again." : "Unable to reach sign-in service. Check your connection and try again." } };
  }

  if (result.data) {
    const storageKey = getAuthStorageKey();
    if (typeof window !== "undefined" && storageKey) window.localStorage.setItem(storageKey, JSON.stringify(result.data));
  }
  return result;
}

export function getPersistedSupabaseAccessToken(storage: Storage | undefined = typeof window === "undefined" ? undefined : window.localStorage) {
  const storageKey = getAuthStorageKey();
  if (!storage || !storageKey) return null;
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { access_token?: unknown; expires_at?: unknown };
    if (typeof parsed.access_token !== "string" || !parsed.access_token) return null;
    if (typeof parsed.expires_at === "number" && parsed.expires_at <= Math.floor(Date.now() / 1000) + 30) return null;
    return parsed.access_token;
  } catch {
    return null;
  }
}

export const __authTesting = { fetchAuthToken, parseAuthResponse, isRetryableProxyResponse };
