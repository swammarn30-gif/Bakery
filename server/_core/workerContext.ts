import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { TrpcContext } from "./context";
import { authenticateSupabaseBearer, type SupabaseRuntimeConfig } from "../supabaseAuth";

export async function createWorkerContext(req: Request, config?: SupabaseRuntimeConfig): Promise<TrpcContext> {
  return {
    req: req as unknown as CreateExpressContextOptions["req"],
    res: null as unknown as CreateExpressContextOptions["res"],
    user: await authenticateAuthorization(req.headers.get("authorization") ?? undefined, config),
  };
}

async function authenticateAuthorization(authorization: string | undefined, config?: SupabaseRuntimeConfig) {
  if (!authorization?.startsWith("Bearer ")) return null;
  try {
    return await authenticateSupabaseBearer(authorization, config);
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[Auth] Supabase bearer context failed", {
      detail,
      hasSupabaseUrl: Boolean(config?.supabaseUrl),
      hasServiceRoleKey: Boolean(config?.serviceRoleKey),
      hasOwnerOpenId: Boolean(config?.ownerOpenId),
    });
    return null;
  }
}
