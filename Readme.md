# NDK-RPC-Advance

1. Create Multiple Server With Functions

`Server 1`

```js
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
```

`Server 2`

```js
import ndk_rpc_server from "../server/index.mjs";

let server = new ndk_rpc_server({ port: 4000 });

const add = ({ a, b }) => a + b;

const isRegistered = await server.register_functions([
  {
    function_name: "add",
    function_block: add,
  },
]);

await server.start();
```

2. Create Global Registry and Add Keys and values as

```json
{
  "key1": {
    "host": "localhost",
    "port": 3000
  },
  "key2": {
    "host": "localhost",
    "port": 4000
  }
}
```

`Gives The Feature That Automatically Run the Middleware Server`

`By Default Global Registry Server is Running on port`: `3331`

```js
import GlobalRegister from "../index.mjs";

const globalRegister = new GlobalRegister({
  createMiddleware: false, // by default true , if false then separately u must need to create the Middleware Server
});

await globalRegister.registerKeys({
  AddService: {
    host: "localhost",
    port: 4000,
  },
  SubService: {
    host: "localhost",
    port: 5000,
  },
});

await globalRegister.start(); // start the global Register
```

3. Create a Middle Server

 `By Default Middle Server Running On Port`: `4132`

- If Not Created the `MiddleServer` in `GlobalRegistry` then u must need to create `MiddleServer`

```js
// MiddleServer
import MiddleServer from "../index.mjs";
const middle = new MiddleServer({
  showLog: true, // this is for showing or not showing the log in Console
});
await middle.start(); // Start the Middle Server
```

4. Create Client And Send Request With Key

```js
import { Client } from "../index.mjs";

const client = new Client();

const response = await client.request({
  method: "sub",
  params: { a: 5, b: 2 }, // Array format as expected by server
  key: "SubService",
});

console.log("Response from server to Client : ", response);
```
