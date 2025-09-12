# NDK-RPC-Cluster

## Supported

1. Client: RPC client with request handling
2. Server: RPC server with replica support
3. Load Balancer: Round-robin load balancing across replicas
4. Registry: Service discovery and key management
5. Middleware Server: Middleman for request routing
6. Utils: Error handling and response utilities
7. Fault Tolerance: Retry mechanisms and failover

## Sample Code

1. Create A Load Balancer

`Load Balancer Server 1`

```js
import ndk_load_balancer from "ndk-rpc-cluster/loadBalancer";

const add = ({ a, b }) => a + b;

const register_functions = [
  {
    function_name: "add",
    function_block: add,
  },
];

let config = {
  port: 3000, // Load Server Running on this port
  replicas: 3, // create this much replicas
  register_functions: register_functions, // this are the function that will register on all replicas
  basePort: 9000, // base port of replica ports
};

let loadServer = new ndk_load_balancer(config);
loadserver.start();
```

`Load Balancer Server 2`

```js
import ndk_load_balancer from "ndk-rpc-cluster/loadBalancer";

const sub = ({ a, b }) => a - b;

const register_functions = [
  {
    function_name: "sub",
    function_block: sub,
  },
];

let config = {
  port: 4000,
  replicas: 2,
  register_functions: register_functions,
  basePort: 8000,
};

let loadServer = new ndk_load_balancer(config);
loadserver.start();
```

2. Create a Global Registry

```js
import GlobalRegister from "ndk-rpc-cluster/registry";

let config = {
  createMiddleware: true, // by default createMiddleware will be true , if false then manuallu u need to start the middleServer ( Recommended )
};

const globalRegister = new GlobalRegister();

await globalRegister.registerKeys({
  AddService: {
    // here Enter That key , that is enter by Client (example here AddService and SubService)
    host: "localhost", // here enter Load Server's Host
    port: 3000, // here enter Load Server's Port
  },
  SubService: {
    host: "localhost",
    port: 4000,
  },
});

await globalRegister.start();
```

3. Now All Set U Just Need To Create the Client

```js
import { Client } from "ndk-rpc-cluster/client";

const client = new Client();

const response = await client.request({
  method: "add",
  params: { a: 5, b: 2 }, // pass input in objects
  key: "AddService", // key which we enter in Global Registry
});

console.log("Response from server to Client : ", response);
```

## Important Note

- Global Registry `Only Can Created Of One Instance` Do Not Try to create multiple Instance it will throw the error
- Global Registry Will Run on Port `3331`
- MiddleServer Will Run on Port `4132`
