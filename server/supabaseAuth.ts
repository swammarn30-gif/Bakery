import { createClient } from "@supabase/supabase-js";
import { getUserByOpenId, upsertUser } from "./db";

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const adminClient = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

export async function authenticateSupabaseBearer(authorization: string | undefined) {
  if (!adminClient || !authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;
  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data.user) return null;
  const authUser = data.user;
  await upsertUser({
    openId: authUser.id,
    name: authUser.user_metadata?.name ?? authUser.user_metadata?.full_name ?? authUser.email ?? null,
    email: authUser.email ?? null,
    loginMethod: "supabase-password",
    lastSignedIn: new Date(),
  });
  return (await getUserByOpenId(authUser.id)) ?? null;
}

export { adminClient };
