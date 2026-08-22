import type { SupabaseRuntimeConfig } from "./supabaseAuth";

type PasswordAuthConfig = Pick<SupabaseRuntimeConfig, "supabaseUrl" | "anonKey">;

export async function handlePasswordAuthRequest(request: Request, config: PasswordAuthConfig = {}): Promise<Response> {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
  const supabaseUrl = config.supabaseUrl || process.env.VITE_SUPABASE_URL;
  const anonKey = config.anonKey || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return Response.json({ error: "Supabase Auth is not configured." }, { status: 503 });

  let input: { email?: unknown; password?: unknown };
  try {
    input = await request.json() as { email?: unknown; password?: unknown };
  } catch {
    return Response.json({ error: "Invalid sign-in request." }, { status: 400 });
  }
  if (typeof input.email !== "string" || typeof input.password !== "string" || !input.email.trim() || !input.password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: input.email.trim(), password: input.password }),
      signal: controller.signal,
    });
    const body = await response.text();
    return new Response(body, { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch (error: unknown) {
    return Response.json({ error: error instanceof DOMException && error.name === "AbortError" ? "Sign in timed out. Check the production connection and try again." : "Unable to reach sign-in service. Check your connection and try again." }, { status: 504 });
  } finally {
    clearTimeout(timer);
  }
}
