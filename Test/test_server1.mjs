import ndk_rpc_server from "../server/index.mjs";

let server1 = new ndk_rpc_server({ port: 4000 });

const add = ({ a, b }) => a + b;

await server1.register_functions([
  {
    function_name: "add",
    function_block: add,
  },
]);

await server1.start();