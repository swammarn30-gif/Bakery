import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./server/routers";
import { configureDatabase } from "./server/db";
import { createWorkerContext } from "./server/_core/context";
import { handleStorageProxyRequest } from "./server/_core/storageProxy";
import { isServerRoute, shouldServeSpaFallback } from "./worker-routing";
import { handlePasswordAuthRequest } from "./server/passwordAuthRoute";

export interface WorkerEnv {
  HYPERDRIVE?: { connectionString: string };
  ASSETS?: { fetch(request: Request): Promise<Response> };
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  OWNER_OPEN_ID?: string;
}

export function createWorkerFetch() {
  return async function fetch(request: Request, env: WorkerEnv): Promise<Response> {
    configureDatabase(env.HYPERDRIVE?.connectionString);
    const pathname = new URL(request.url).pathname;

    if (isServerRoute(pathname)) {
      if (pathname === "/api/auth/sign-in") return handlePasswordAuthRequest(request, { supabaseUrl: env.VITE_SUPABASE_URL, anonKey: env.VITE_SUPABASE_ANON_KEY });
      if (pathname.startsWith("/api/trpc")) {
        return fetchRequestHandler({
          endpoint: "/api/trpc",
          req: request,
          router: appRouter,
          createContext: ({ req }) => createWorkerContext(req, {
            supabaseUrl: env.VITE_SUPABASE_URL,
            anonKey: env.VITE_SUPABASE_ANON_KEY,
            serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
            ownerOpenId: env.OWNER_OPEN_ID,
          }),
        });
      }
      if (pathname.startsWith("/manus-storage/")) return handleStorageProxyRequest(request);
      return new Response("Not found", { status: 404 });
    }

    if (!env.ASSETS) return new Response("Asset binding is not configured", { status: 503 });
    const assetResponse = await env.ASSETS.fetch(request);
    if (!shouldServeSpaFallback(assetResponse.status, request.method, request.headers.get("Accept"))) return assetResponse;
    return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
  };
}
