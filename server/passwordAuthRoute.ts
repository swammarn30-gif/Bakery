import { signInWithSupabaseCredentials, type PasswordAuthConfig } from "./passwordAuthCore";

export type { PasswordAuthConfig };

export async function handlePasswordAuthRequest(
  request: Request,
  config: PasswordAuthConfig = {},
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid sign-in request." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await signInWithSupabaseCredentials(input, {
    supabaseUrl: config.supabaseUrl || request.headers.get("x-supabase-url") || undefined,
    anonKey: config.anonKey || request.headers.get("apikey") || undefined,
  });
  return new Response(result.body, {
    status: result.status,
    headers: { "Content-Type": result.contentType, "Cache-Control": "no-store" },
  });
}
