import ndk_rpc_server from '../server/index.mjs'
import ApiResponse from '../utils/ApiResponse.js'
import figlet from 'figlet'
import chalk from 'chalk'
import express from 'express'
import cors from 'cors'
import loadBalancerRouter from './routes/loadBalancerRoute.mjs'
import os from 'os'

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

    port = 3000
    replicas = 1
    register_functions = []
    basePort = 9000
    app = ''
    count = 1
    replicaPorts = []

    constructor({ port, replicas, register_functions, basePort }) {
        this.port = port;
        this.replicas = replicas;
        this.register_functions = register_functions;

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
            return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
        });

        // at least one server will run and we need to call internalyy by default for replicas 
        // this.createReplicas({ replicas: replicaCount, basePort: 9000 })

        this.app.use("/api/v1/ndk-load-balancer", (req, _, next) => {
            req.register_functions = this.register_functions
            req.replicas = this.replicas
            // console.log("Replicas Port: ", this.replicaPorts)
            req.replicaPorts = this.replicaPorts
            next();
        }, loadBalancerRouter);

        this.app.get("/", (req, res) => {
            res.send("NDK-Load-Balancer is running on port " + this.port);
        });
    }

    async start() {
        try {
            // first start the load balancer server
            this.app.listen(this.port, () => {
                console.log(
                    chalk.magenta(figlet.textSync("NDK-Load-Balancer", { horizontalLayout: "full" }))
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
                console.log(chalk.cyanBright("📡 Ready to accept Load Balancer requests..."));
                console.log() // new line
            })

            for (let i = 0; i < this.replicas; i++) {
                let server = new ndk_rpc_server({ count: this.count, port: this.basePort + i })
                await server.register_functions(this.register_functions)
                await server.start()
                this.count++
                this.replicaPorts.push(this.basePort + i)
            }

            console.log() // for new line
            // console.log(chalk.greenBright("📦 Load Balancer Server is running at: ") + chalk.yellowBright.bold(`http://localhost:${this.port}`))

        }
        catch (err) {
            console.log(chalk.red("Error: ") + err.message)
            return false;
        }
        return true;
    }

}

export default ndk_load_balancer