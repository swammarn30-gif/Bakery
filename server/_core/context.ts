import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import type { User } from "../../drizzle/schema.js";
import { authenticateSupabaseBearer, type SupabaseRuntimeConfig } from "../supabaseAuth.js";

export type TrpcContext = {
  req: ExpressRequest;
  res: ExpressResponse;
  user: User | null;
};

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

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  const req = opts.req as ExpressRequest;
  const res = opts.res as ExpressResponse;
  return {
    req,
    res,
    user: await authenticateAuthorization(req.headers.authorization),
  };
}
