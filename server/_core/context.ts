import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { authenticateSupabaseBearer, type SupabaseRuntimeConfig } from "../supabaseAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

async function authenticateAuthorization(authorization: string | undefined, config?: SupabaseRuntimeConfig) {
  try {
    return await authenticateSupabaseBearer(authorization, config);
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  return {
    req: opts.req,
    res: opts.res,
    user: await authenticateAuthorization(opts.req.headers.authorization),
  };
}

export async function createWorkerContext(req: Request, config?: SupabaseRuntimeConfig): Promise<TrpcContext> {
  return {
    req: req as unknown as CreateExpressContextOptions["req"],
    res: null as unknown as CreateExpressContextOptions["res"],
    user: await authenticateAuthorization(req.headers.get("authorization") ?? undefined, config),
  };
}
