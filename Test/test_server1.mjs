import ndk_rpc_server from "../server/index.mjs";

let server1 = new ndk_rpc_server({ port: 4000 });

const add = ({ a, b }) => a + b;

await server1.register_functions([
  {
    function_name: "add",
    function_block: add,
  },
]);

// it means start the load balancer server
await server1.start();

// now create the replica
await server1.createReplicas({ replicas: 3, basePort: 8000 })