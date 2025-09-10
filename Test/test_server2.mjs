import ndk_rpc_server from "../server/index.mjs";

let server = new ndk_rpc_server({ port: 5000 });

const sub = ({ a, b }) => a - b;

const isRegistered = await server.register_functions([
  {
    function_name: "sub",
    function_block: sub,
  },
]);

await server.start();
