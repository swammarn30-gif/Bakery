import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export function getPersistedSupabaseAccessToken(storage: Storage | undefined = typeof window === "undefined" ? undefined : window.localStorage) {
  if (!storage || !url) return null;
  try {
    const projectRef = new URL(url).hostname.split(".")[0];
    const raw = storage.getItem(`sb-${projectRef}-auth-token`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { access_token?: unknown; expires_at?: unknown };
    if (typeof parsed.access_token !== "string" || !parsed.access_token) return null;
    if (typeof parsed.expires_at === "number" && parsed.expires_at <= Math.floor(Date.now() / 1000) + 30) return null;
    return parsed.access_token;
  } catch {
    return null;
  }
}
