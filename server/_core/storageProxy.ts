import type { Express, Request, Response } from "express";
import { ENV } from "./env";

async function getSignedStorageUrl(key: string): Promise<string | null> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) return null;
  const forgeUrl = new URL("v1/storage/presign/get", ENV.forgeApiUrl.replace(/\/+$/, "") + "/");
  forgeUrl.searchParams.set("path", key);
  const forgeResp = await fetch(forgeUrl, {
    headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
  });
  if (!forgeResp.ok) {
    const body = await forgeResp.text().catch(() => "");
    console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
    return null;
  }
  const body = (await forgeResp.json()) as { url?: unknown };
  return typeof body.url === "string" && body.url ? body.url : null;
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req: Request, res: Response) => {
    const key = req.path.replace(/^\/manus-storage\//, "");
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const signedUrl = await getSignedStorageUrl(key);
      if (!signedUrl) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.redirect(307, signedUrl);
    } catch (error) {
      console.error("[StorageProxy] failed:", error);
      res.status(502).send("Storage proxy error");
    }
  });
}
