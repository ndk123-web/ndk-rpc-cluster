import ndk_rpc_server from "../server/index.mjs";
import ApiResponse from "../utils/ApiResponse.js";
import figlet from "figlet";
import chalk from "chalk";
import express from "express";
import cors from "cors";
import loadBalancerRouter from "./routes/loadBalancerRoute.mjs";
import os from "os";

function getAllIPv4() {
  const nets = os.networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Sirf IPv4 chahiye, aur internal (127.0.0.1) ko ignore karo
      if (net.family === "IPv4" && !net.internal) {
        results.push({ interface: name, address: net.address });
      }
    }
  }

  return results;
}

class ndk_load_balancer {
  port = 3000;
  replicas = 1;
  register_functions = [];
  basePort = 9000;
  app = "";
  count = 1;
  replicaPorts = [];
  replicaDetails = [];
  requestCounts = 0;
  static availablePort = [];

  static THREASHOLD = 2000;
  static MINREPLICAS = 2;
  static MAXREPLICAS = 10;

  static getRandomPort() {
    let min = 10000;
    let max = 49151;
    let port;

    do {
      port = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (ndk_load_balancer.availablePort.includes(port));

    return port;
  }

  constructor({ port, replicas = 2, register_functions , threashold = 2000 }) {
    this.port = port;
    this.replicas = replicas;
    this.register_functions = register_functions;
    this.threashold = threashold;

    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      cors({
        origin: "*",
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })
    );
    this.app.use((err, req, res, next) => {
      if (err instanceof ApiError) {
        return res
          .status(err.statusCode)
          .json(new ApiResponse(err.statusCode, err.message));
      }
      return res
        .status(500)
        .json(new ApiResponse(500, "Internal Server Error"));
    });

    // to count the requests for each load balancer server
    this.app.use((_, __, next) => {
      this.requestCounts++;
      next();
    })

    // at least one server will run and we need to call internalyy by default for replicas
    // this.createReplicas({ replicas: replicaCount, basePort: 9000 })

    this.app.use(
      "/api/v1/ndk-load-balancer",
      (req, _, next) => {
        req.register_functions = this.register_functions;
        req.replicas = this.replicas;
        // console.log("Replicas Port: ", this.replicaPorts)
        req.replicaPorts = this.replicaPorts;
        next();
      },
      loadBalancerRouter
    );

    this.app.get("/", (req, res) => {
      res.send("NDK-Load-Balancer is running on port " + this.port);
    });
  }

  async start() {
    try {
      // first start the load balancer server
      this.app.listen(this.port, () => {
        console.log(
          chalk.magenta(
            figlet.textSync("NDK-Load-Balancer", { horizontalLayout: "full" })
          )
        );
        console.log(
          chalk.greenBright("⚖️  Load Balancer Server is running at: ") +
          chalk.yellowBright.bold(`http://localhost:${this.port}`)
        );
        const localIps = getAllIPv4();
        for (let ipObj of localIps) {
          console.log(
            chalk.greenBright("🌐 Accessible at: ") +
            chalk.yellowBright.bold(`http://${ipObj.address}:${this.port}`)
          );
        }
        console.log(
          chalk.cyanBright("📡 Ready to accept Load Balancer requests...")
        );
        console.log(); // new line
      });

      for (let i = 0; i < this.replicas; i++) {
        let assignPort = ndk_load_balancer.getRandomPort();
        while (ndk_load_balancer.availablePort.includes(assignPort)) {
          assignPort = ndk_load_balancer.getRandomPort();
        }
        let server = new ndk_rpc_server({
          count: this.count,
          port: assignPort,
        });
        await server.register_functions(this.register_functions);
        const serverInstance = await server.start();
        this.count++;
        this.replicaPorts.push(assignPort);
        this.replicaDetails.push({ port: assignPort, server: serverInstance })
        ndk_load_balancer.availablePort.push(assignPort);
      }

      console.log(); // for new line

      // start the analyseServer
      await this.analyseRequests();

      // console.log(chalk.greenBright("📦 Load Balancer Server is running at: ") + chalk.yellowBright.bold(`http://localhost:${this.port}`))
    } catch (err) {
      console.log(chalk.red("Error: ") + err.message);
      return false;
    }
    return true;
  }

  async analyseRequests() {
    setInterval(async () => {
      const totalRequetsPerReplica = Math.round(this.requestCounts / this.replicaPorts.length)
      if (totalRequetsPerReplica > ndk_load_balancer.THREASHOLD && this.replicaPorts.length < ndk_load_balancer.MAXREPLICAS) {
        console.log(chalk.greenBright("Load Increasing adding one more replica " + `Total Req: ${this.requestCounts}`))
        await this.createReplica();
      } else if (totalRequetsPerReplica < ndk_load_balancer.THREASHOLD && this.replicaPorts.length > ndk_load_balancer.MINREPLICAS) {
        console.log(chalk.greenBright("Load Decreasing removing one replica " + `Total Req: ${this.requestCounts}`))
        await this.removeReplica();
      } else {
        this.requestCounts = 0;
      }
    }, 10000)
  }

  async createReplica() {
    try {
      let assignPort = ndk_load_balancer.getRandomPort();
      while (ndk_load_balancer.availablePort.includes(assignPort)) {
        assignPort = ndk_load_balancer.getRandomPort();
      }
      let server = new ndk_rpc_server({
        count: this.count,
        port: assignPort,
      });
      await server.register_functions(this.register_functions);
      const serverInstance = await server.start();
      this.count++;
      this.replicaPorts.push(assignPort);
      this.replicaDetails.push({ port: assignPort, server: serverInstance })
      ndk_load_balancer.availablePort.push(assignPort);
      // console.log(chalk.greenBright("New Replica Created: ") + chalk.yellowBright.bold(assignPort))

      // console.log("Total Replicas: ")
      this.replicaPorts.forEach(port => {
        console.log(chalk.yellow("Currently Running Replicas: ") + "http://localhost:" + chalk.yellowBright.bold(port))
      })
      this.requestCounts = 0;
    }
    catch (err) {
      console.log("Err: ", err.message)
    }
  }

  async removeReplica() {
    try {
      let toRemovePort = this.replicaPorts[0];

      // Find the object { port, server }
      let replicaObj = this.replicaDetails.find(obj => obj.port === toRemovePort);
      if (!replicaObj) {
        console.log(chalk.red(`Replica with port ${toRemovePort} not found`));
        return;
      }

      // Close the server safely
      await new Promise((resolve, reject) => {
        replicaObj.server.close(err => {
          if (err) return reject(err);
          resolve();
        });
      });

      // Remove from arrays
      this.replicaPorts = this.replicaPorts.filter(p => p !== toRemovePort);
      this.replicaDetails = this.replicaDetails.filter(obj => obj.port !== toRemovePort);
      ndk_load_balancer.availablePort = ndk_load_balancer.availablePort.filter(p => p !== toRemovePort);

      console.log(chalk.greenBright("Replica Removed: ") + chalk.yellowBright.bold(toRemovePort));

      this.replicaPorts.forEach(port => {
        console.log(chalk.yellow("Currently Running Replicas: ") + "http://localhost:" + chalk.yellowBright.bold(port));
      });

    } catch (err) {
      console.log(chalk.red("Error: ") + err.message);
    }
  }

}

export default ndk_load_balancer;