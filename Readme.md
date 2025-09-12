# NDK-RPC-Cluster

[![npm version](https://badge.fury.io/js/ndk-rpc-cluster.svg)](https://badge.fury.io/js/ndk-rpc-cluster)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

> **Enterprise-grade RPC cluster system with load balancing, fault tolerance, service discovery and automatic failover support**

## 🚀 Features

- **🔄 Load Balancing** - Round-robin distribution across replicas
- **⚡ Fault Tolerance** - Automatic retry mechanisms and failover
- **🔍 Service Discovery** - Global registry for service management
- **📡 RPC Support** - Remote procedure calls with full cluster support
- **🛡️ Error Handling** - Comprehensive error management
- **🔧 Easy Setup** - Simple configuration and deployment

## 📦 Installation

```bash
npm install ndk-rpc-cluster
```

## 🏗️ Architecture

![NDK-RPC-Cluster Architecture](./public/Architecture.png)

```
Client → Registry → Middleware → Load Balancer → Replicas (Servers)
```

## 🚀 Quick Start

### 1. Create Load Balancer with Replicas

```javascript
import LoadBalancer from "ndk-rpc-cluster/loadBalancer";

// Define your functions
const add = ({ a, b }) => a + b;
const multiply = ({ a, b }) => a * b;

// Register functions that will be available on all replicas
const functions = [
  { function_name: "add", function_block: add },
  { function_name: "multiply", function_block: multiply },
];

// Load balancer configuration
const config = {
  port: 3000, // Load balancer port
  replicas: 3, // Number of replica servers
  register_functions: functions,
  basePort: 9000, // Starting port for replicas (9000, 9001, 9002)
};

const loadBalancer = new LoadBalancer(config);
loadBalancer.start();
```

### 2. Setup Global Registry

```javascript
import GlobalRegistry from "ndk-rpc-cluster/registry";

const registry = new GlobalRegistry({
  createMiddleware: true, // Auto-create middleware server
});

// Register your services
await registry.registerKeys({
  MathService: {
    host: "localhost",
    port: 3000, // Load balancer port
  },
  // Add more services as needed
});

await registry.start();
// Registry runs on port 3331, Middleware on port 4132
```

### 3. Create Client

```javascript
import { Client } from "ndk-rpc-cluster/client";

const client = new Client();

// Make RPC calls
const response = await client.request({
  method: "add",
  params: { a: 10, b: 5 },
  key: "MathService", // Service key from registry
});

console.log("Result:", response.result); // Output: 15
```

## 📋 Complete Example

Here's a full working example:

```javascript
// server.js - Load Balancer Setup
import LoadBalancer from "ndk-rpc-cluster/loadBalancer";

const mathFunctions = [
  {
    function_name: "add",
    function_block: ({ a, b }) => a + b,
  },
  {
    function_name: "subtract",
    function_block: ({ a, b }) => a - b,
  },
  {
    function_name: "multiply",
    function_block: ({ a, b }) => a * b,
  },
];

const mathService = new LoadBalancer({
  port: 3000,
  replicas: 3,
  register_functions: mathFunctions,
  basePort: 9000,
});

mathService.start();
```

```javascript
// registry.js - Service Registry
import GlobalRegistry from "ndk-rpc-cluster/registry";

const registry = new GlobalRegistry();

await registry.registerKeys({
  MathService: {
    host: "localhost",
    port: 3000,
  },
});

await registry.start();
```

```javascript
// client.js - Client Usage
import { Client } from "ndk-rpc-cluster/client";

const client = new Client();

async function performCalculations() {
  try {
    // Addition
    const sum = await client.request({
      method: "add",
      params: { a: 15, b: 25 },
      key: "MathService",
    });
    console.log("Sum:", sum.data.result); // 40

    // Multiplication
    const product = await client.request({
      method: "multiply",
      params: { a: 6, b: 7 },
      key: "MathService",
    });
    console.log("Product:", product.data.result); // 42
  } catch (error) {
    console.error("Error:", error.message);
  }
}

performCalculations();
```

## 🛠️ Configuration

### Load Balancer Options

| Option               | Type   | Default | Description                       |
| -------------------- | ------ | ------- | --------------------------------- |
| `port`               | number | -       | Load balancer server port         |
| `replicas`           | number | -       | Number of replica servers         |
| `basePort`           | number | -       | Starting port for replicas        |
| `register_functions` | array  | -       | Functions to register on replicas |

### Registry Options

| Option             | Type    | Default | Description                   |
| ------------------ | ------- | ------- | ----------------------------- |
| `createMiddleware` | boolean | `true`  | Auto-create middleware server |

## 🔧 Scripts

```bash
# Start complete cluster
npm run cluster:start

# Start individual components
npm run start:registry
npm run start:load-balancer
npm run start:middleware

# Run tests
npm test
npm run test:client
npm run test:server

# Development mode
npm run dev
```

## 🌐 Default Ports

- **Global Registry**: `3331`
- **Middleware Server**: `4132`
- **Load Balancer**: `3000` (configurable)
- **Replica Servers**: `9000+` (basePort + index)

## 🔄 How It Works

1. **Registry** manages service discovery and routing
2. **Middleware** handles request forwarding
3. **Load Balancer** distributes requests across replicas
4. **Replicas** execute the actual RPC methods
5. **Client** makes requests through the registry

## ⚠️ Important Notes

- Global Registry can only have **one instance** - multiple instances will throw errors
- All components use ES modules (`import/export`)
- Requires Node.js 16+ for optimal performance
- Functions should be pure and stateless for best results

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Navnath Kadam**

- GitHub: [@ndk123-web](https://github.com/ndk123-web)
- Email: ndk123.web@gmail.com

## 🙏 Support

If you find this project helpful, please give it a ⭐ on GitHub!

---

**Built with ❤️ for the Node.js community**
