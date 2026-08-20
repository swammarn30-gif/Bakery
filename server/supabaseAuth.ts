import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getUserByOpenId, upsertUser } from "./db";

type SupabaseRuntimeConfig = {
  supabaseUrl?: string;
  serviceRoleKey?: string;
  ownerOpenId?: string;
};

const buildTimeClient = (() => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null;
})();

let runtimeClient: SupabaseClient | null = null;
let runtimeClientKey = "";

function getAdminClient(config?: SupabaseRuntimeConfig) {
  const supabaseUrl = config?.supabaseUrl || process.env.VITE_SUPABASE_URL || "";
  const serviceRoleKey = config?.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceRoleKey) return buildTimeClient;
  const clientKey = `${supabaseUrl}|${serviceRoleKey}`;
  if (!runtimeClient || runtimeClientKey !== clientKey) {
    runtimeClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    runtimeClientKey = clientKey;
  }
  return runtimeClient;
}

export async function authenticateSupabaseBearer(authorization: string | undefined, config?: SupabaseRuntimeConfig) {
  const adminClient = getAdminClient(config);
  if (!adminClient || !authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;
  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data.user) return null;
  const authUser = data.user;
  const isOwner = Boolean(config?.ownerOpenId && authUser.id === config.ownerOpenId);
  await upsertUser({
    openId: authUser.id,
    name: authUser.user_metadata?.name ?? authUser.user_metadata?.full_name ?? authUser.email ?? null,
    email: authUser.email ?? null,
    loginMethod: "supabase-password",
    lastSignedIn: new Date(),
    ...(isOwner ? { role: "admin" as const } : {}),
  });
  return (await getUserByOpenId(authUser.id)) ?? null;
}

export { buildTimeClient as adminClient };
export type { SupabaseRuntimeConfig };
