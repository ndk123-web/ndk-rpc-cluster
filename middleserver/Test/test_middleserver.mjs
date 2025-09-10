// MiddleServer
import MiddleServer from "../index.mjs";
const middle = new MiddleServer({ port: 4000, registryHost: "localhost", registryPort: 3000, showLog: true });
await middle.start();