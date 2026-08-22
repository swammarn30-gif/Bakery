import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { handlePasswordAuthRequest } from "../passwordAuthRoute";

export function createExpressApp() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  app.post("/api/auth/sign-in", async (req, res) => {
    const response = await handlePasswordAuthRequest(new Request("http://localhost/api/auth/sign-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req.body) }));
    res.status(response.status).set("Content-Type", response.headers.get("Content-Type") ?? "application/json").send(await response.text());
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  return app;
}
