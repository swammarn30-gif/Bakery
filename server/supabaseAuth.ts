import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getUserByOpenId, upsertUser } from "./db";

type SupabaseRuntimeConfig = {
  supabaseUrl?: string;
  serviceRoleKey?: string;
  anonKey?: string;
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
  const anonKey = config?.anonKey || process.env.VITE_SUPABASE_ANON_KEY || "";
  const key = serviceRoleKey || anonKey;
  if (!supabaseUrl || !key) return buildTimeClient;
  const clientKey = `${supabaseUrl}|${key}`;
  if (!runtimeClient || runtimeClientKey !== clientKey) {
    runtimeClient = createClient(supabaseUrl, key, { auth: { autoRefreshToken: false, persistSession: false } });
    runtimeClientKey = clientKey;
  }
  return runtimeClient;
}

export async function authenticateSupabaseBearer(authorization: string | undefined, config?: SupabaseRuntimeConfig) {
  const adminClient = getAdminClient(config);
  if (!adminClient || !authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;
  const authClient = adminClient as unknown as {
    auth: {
      getUser: (accessToken: string) => Promise<{
        data: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null };
        error: { status?: number; code?: string; message?: string } | null;
      }>;
    };
  };
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    console.error("[Auth] Supabase token rejected", {
      status: error?.status ?? null,
      code: error?.code ?? null,
      message: error?.message ?? "No user returned",
    });
    return null;
  }
  const authUser = data.user;
  const metadata = authUser.user_metadata ?? {};
  const displayName =
    (typeof metadata.name === "string" && metadata.name) ||
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    authUser.email ||
    null;
  const isOwner = Boolean(config?.ownerOpenId && authUser.id === config.ownerOpenId);
  await upsertUser({
    openId: authUser.id,
    name: displayName,
    email: authUser.email ?? null,
    loginMethod: "supabase-password",
    lastSignedIn: new Date(),
    ...(isOwner ? { role: "admin" as const } : {}),
  });
  return (await getUserByOpenId(authUser.id)) ?? null;
}

export { buildTimeClient as adminClient };
export type { SupabaseRuntimeConfig };
