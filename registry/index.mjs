import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js"
import app from "./app/index.mjs";
import chalk from "chalk";
import os from 'os'
import figlet from "figlet";
import { globalRegisterRouter } from "./routes/globalRegisterRouter.mjs";
import MiddleServer from '../middleserver/index.mjs';

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

class GlobalRegister {
    globalRegistry = {};
    registryPort = undefined;
    registryHost = "localhost"
    createMiddleware = "";
    static count = 0

    constructor({ registryPort = 3331, createMiddleware = true }) {
        this.registryPort = registryPort;
        GlobalRegister.count = GlobalRegister.count + 1;
        this.createMiddleware = createMiddleware

        if (GlobalRegister.count > 1) {
            throw new ApiError(400, "Multiple GlobalRegister instances are not allowed");
        }

        app.use("/api/v1/", (req, _, next) => {
            req.globalRegistry = this.globalRegistry
            next();
        }, globalRegisterRouter);
    }

    // Register multiple services
    // Schema is like 
    /*
        {
            AddService: {
                host: "localhost",
                port: 3000
            },
            SubService: {
                host: "localhost",`
                port: 3001
            }
        }
     */
    async registerKeys(services) {

        if (typeof services !== "object" || Array.isArray(services)) {
            return new ApiResponse(400, "Input should be an object");
        }

        for (const [key, value] of Object.entries(services)) {
            if (key === "" || key === undefined || key === null) {
                return new ApiResponse(2000, "Key should not be empty");
            }

            let { host, port, protocol, portRequired = true } = value;
            if (host === "" || host === undefined || host === null) {
                return new ApiResponse(201, "Default Host is Provideing 'localhost'");
            }
            if (port === "" || port === undefined || port === null) {
                return new ApiResponse(202, "Port is Must");
            }

            // check duplicate keys
            if (this.globalRegistry[key]) {
                return new ApiResponse(203, "Key already exists");
            }

            this.globalRegistry[key] = { host, port, protocol, portRequired };
        }
        return new ApiResponse(200, "Services registered successfully", this.globalRegistry);
    }

    // Lookup service
    getService(key) {
        if (!this.globalRegistry[key]) {
            return new ApiResponse(404, `Service ${key} not found in registry`);
        }
        return this.globalRegistry[key];
    }

    // Start Global Service
    async start() {
        console.log(chalk.magenta(figlet.textSync("NDK-Registry", { horizontalLayout: "full" })));

        if (this.createMiddleware) {
            // Automatically starts the middleserver on 4431
            const middleserver = new MiddleServer({ showLog: false })
            await middleserver.start();
        }

        // On Start Of Registry Server
        app.listen(this.registryPort, () => {
            console.log(chalk.greenBright(`NDK-Registry is running at: http://${this.registryHost}:${this.registryPort}`));
            const localIps = getAllIPv4();

            for (let ipObj of localIps) {
                console.log(
                    chalk.greenBright("   Accessible at: ") +
                    chalk.yellowBright.bold(`http://${ipObj.address}:${this.registryPort}`)
                );
            }

            console.log(chalk.cyanBright("📡 Ready to accept Registry requests..."));

            // console.log("Current Global Registry: ", this.globalRegistry);
        });
    }
}

export default GlobalRegister;
