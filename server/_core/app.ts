import express, { type Request, type Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { signInWithSupabaseCredentials } from "../passwordAuthCore";

export function createExpressApp() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  app.post("/api/auth/sign-in", async (req: Request, res: Response) => {
    const result = await signInWithSupabaseCredentials(req.body, {
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      anonKey: process.env.VITE_SUPABASE_ANON_KEY,
    });
    res
      .status(result.status)
      .set("Content-Type", result.contentType)
      .set("Cache-Control", "no-store")
      .send(result.body);
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );
  return app;
}
