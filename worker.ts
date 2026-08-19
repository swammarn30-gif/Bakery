import { createServer } from "node:http";
// @ts-expect-error Cloudflare provides this module at Worker runtime.
import { handleAsNodeRequest } from "cloudflare:node";
import { createExpressApp } from "./server/_core/app";
import { createWorkerFetch } from "./worker-handler";

const server = createServer(createExpressApp());
server.listen(8080);

export default {
  fetch: createWorkerFetch((port, request) => handleAsNodeRequest(port, request)),
};
