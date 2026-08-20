import { createWorkerFetch } from "./worker-handler";

const fetch = createWorkerFetch();

export default { fetch };
