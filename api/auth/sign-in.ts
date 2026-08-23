import { signInWithSupabaseCredentials } from "../../server/passwordAuthCore";

type VercelRequest = { method?: string; body?: unknown };
type VercelResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  send(body: string): void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).send("Method Not Allowed");
    return;
  }

  const result = await signInWithSupabaseCredentials(req.body, {
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
  });
  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Cache-Control", "no-store");
  res.status(result.status).send(result.body);
}
