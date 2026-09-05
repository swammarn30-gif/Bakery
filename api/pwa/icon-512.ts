const ICON_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663502655784/HWoTzaPseshKFZgg.png";

type VercelRequest = { method?: string };
type VercelResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  send(body: Buffer): void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).send(Buffer.from("Method Not Allowed"));
    return;
  }

  const upstream = await fetch(ICON_URL);
  if (!upstream.ok) {
    res.status(502).send(Buffer.from("PWA icon unavailable"));
    return;
  }

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.status(200).send(Buffer.from(await upstream.arrayBuffer()));
}
