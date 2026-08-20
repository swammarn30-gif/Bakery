import { createServer } from "node:http";
// @ts-expect-error Cloudflare provides this module at Worker runtime.
import { httpServerHandler } from "cloudflare:node";
import { createExpressApp } from "./server/_core/app";

const server = createServer(createExpressApp());
server.listen(8080);

export default httpServerHandler({ port: 8080 });
