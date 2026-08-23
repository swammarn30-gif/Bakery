export type PasswordAuthConfig = {
  supabaseUrl?: string;
  anonKey?: string;
};

export type PasswordAuthResult = {
  status: number;
  body: string;
  contentType: string;
};

function errorResult(status: number, message: string): PasswordAuthResult {
  return {
    status,
    body: JSON.stringify({ error: message }),
    contentType: "application/json",
  };
}

export async function signInWithSupabaseCredentials(
  input: unknown,
  config: PasswordAuthConfig = {},
): Promise<PasswordAuthResult> {
  const supabaseUrl = config.supabaseUrl || process.env.VITE_SUPABASE_URL || undefined;
  const anonKey = config.anonKey || process.env.VITE_SUPABASE_ANON_KEY || undefined;
  if (!supabaseUrl || !anonKey) return errorResult(503, "Supabase Auth is not configured.");

  const credentials = input as { email?: unknown; password?: unknown } | null;
  if (
    !credentials ||
    typeof credentials.email !== "string" ||
    typeof credentials.password !== "string" ||
    !credentials.email.trim() ||
    !credentials.password
  ) {
    return errorResult(400, "Email and password are required.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await globalThis.fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: credentials.email.trim(), password: credentials.password }),
      signal: controller.signal,
    });
    return {
      status: response.status,
      body: await response.text(),
      contentType: response.headers.get("Content-Type") || "application/json",
    };
  } catch (error: unknown) {
    return errorResult(
      504,
      error instanceof Error && error.name === "AbortError"
        ? "Sign in timed out. Check the production connection and try again."
        : "Unable to reach sign-in service. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timer);
  }
}
