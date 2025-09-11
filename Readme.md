# 🚀 NDK-RPC-Engine

A lightweight yet powerful **RPC Engine with Load Balancing, Replication, and Global Service Registry**.
This library allows you to easily create distributed systems with proper logging, replicas, and centralized service discovery.

---

## ✨ Features

* **RPC Server**: Create servers that can register and expose functions as RPC methods.
* **Automatic Replicas**: Create as many replica servers as you want using `createReplicas()`.
* **Global Registry**: Maintain a centralized key → server mapping (like DNS for services). Clients request services by key (e.g., `"SubService"`) instead of remembering host/port.
* **Middleware Option**: Registry can automatically spin up a middleware (`createMiddleware: true`) to route requests transparently.
* **Proper Logging**: Colored, timestamped logs for **INFO**, **SUCCESS**, and **ERROR** events.
* **Distributed Setup**: Supports multiple services, each with its own port and replicas.

---

## 📦 Installation

```bash
npm install ndk-rpc-engine
```

---

## 🛠 Usage

### 1️⃣ Create a Server

```js
import ndk_rpc_server from "ndk-rpc-engine";

let server1 = new ndk_rpc_server({ port: 4000 });

const add = ({ a, b }) => a + b;

await server1.register_functions([
  { function_name: "add", function_block: add }
]);

await server1.start();

// create 3 replicas for load balancing
await server1.createReplicas({ replicas: 3, basePort: 8000 });
```

### 2️⃣ Another Server

```js
import ndk_rpc_server from "ndk-rpc-engine";

let server2 = new ndk_rpc_server({ port: 5000 });

const sub = ({ a, b }) => a - b;

await server2.register_functions([
  { function_name: "sub", function_block: sub }
]);

await server2.start();
await server2.createReplicas({ replicas: 2, basePort: 6000 });
```

### 3️⃣ Global Registry

```js
import GlobalRegister from "ndk-rpc-engine";

const globalRegister = new GlobalRegister({
  registryPort: 3331,
  createMiddleware: true // auto middleware for clients
});

await globalRegister.registerKeys({
  AddService: { host: "localhost", port: 4000 },
  SubService: { host: "localhost", port: 5000 }
});

await globalRegister.start();
```

### 4️⃣ Client

```js
import { Client } from "ndk-rpc-engine";

const client = new Client();

const response = await client.request({
  method: "sub",
  params: { a: 5, b: 2 },
  key: "SubService"
});

console.log("Response from server to Client : ", response);
```

---

## 📊 Example Output

### Registry Logs

```text
[INFO 2025-09-11T12:51:33.092Z] Incoming request to Global Registry → { key: "SubService", method: "sub", params: { "a": 5, "b": 2 } }
[SUCCESS 2025-09-11T12:51:33.093Z] Key found in Global Registry → { key: "SubService", server: { host: "localhost", port: 5000 } }
[SUCCESS 2025-09-11T12:51:33.093Z] Received response from Registry → { status: 200 }
```

### Client Response

```text
Response from server to Client :  
{ message: 'Method executed successfully', data: { method: 'sub', result: 3 } }
```

### Server & Replicas

```text
   Server is running at: http://localhost:4000
   Accessible at: http://192.168.0.102:4000
📡 Ready to accept Load Balancer requests...

3 replicas created
   Replica Server is running at: http://localhost:8000
📡 Ready to accept RPC requests...
   Replica Server is running at: http://localhost:8001
📡 Ready to accept RPC requests...
   Replica Server is running at: http://localhost:8002
📡 Ready to accept RPC requests...
```
