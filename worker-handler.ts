import { configureDatabase } from "./server/db";
import { isServerRoute, shouldServeSpaFallback } from "./worker-routing";

export interface WorkerEnv {
  HYPERDRIVE?: { connectionString: string };
  ASSETS?: { fetch(request: Request): Promise<Response> };
}

export function createWorkerFetch(handleNodeRequest: (port: number, request: Request) => Promise<Response>) {
  return async function fetch(request: Request, env: WorkerEnv): Promise<Response> {
    configureDatabase(env.HYPERDRIVE?.connectionString);
    const pathname = new URL(request.url).pathname;
    if (isServerRoute(pathname)) return handleNodeRequest(8080, request);
    if (!env.ASSETS) return new Response("Asset binding is not configured", { status: 503 });
    const assetResponse = await env.ASSETS.fetch(request);
    if (!shouldServeSpaFallback(assetResponse.status, request.method, request.headers.get("Accept"))) return assetResponse;
    return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
  };
}
