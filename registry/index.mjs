import ApiError from "../server/utils/ApiError.js";
import ApiResponse from "../server/utils/ApiResponse.js";
import app from "./app/index.mjs";
import chalk from "chalk";
import os from 'os'
import figlet from "figlet";

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

class Register {
    globalRegistry = {};
    registryPort = undefined;
    registryHost = "localhost"

    constructor({ registryPort = 3000 }) {
        this.registryPort = registryPort;
    }

    // Register multiple services
    async registerKeys(services) {

        if (typeof services !== "object" || Array.isArray(services)) {
            return new ApiResponse(400, "Input should be an object");
        }

        for (const [key, value] of Object.entries(services)) {
            if (key === "" || key === undefined || key === null) {
                return new ApiResponse(2000, "Key should not be empty");
            }

            let { host, port } = value;
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

            this.globalRegistry[key] = { host, port };
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

export default Register;
