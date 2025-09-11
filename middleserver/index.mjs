import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import express from 'express'
import chalk from 'chalk'
import figlet from 'figlet'
import os from 'os'
import cors from 'cors'
import { middlemanRouter } from './routes/middlemanRoutes.mjs'

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

class MiddleServer {
    port = "";
    registryPort = 3331;
    registryHost = "localhost";
    showLog = true;

    constructor({ port, registryPort = 3331, registryHost = "localhost", showLog = true }) {
        this.port = port || 4132;  // middleserever port
        this.registryHost = registryHost; // registry ka host
        this.registryPort = registryPort;        // registry ka port
        this.showLog = showLog;                          // properly respect karega
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

        // Error handler
        this.app.use((err, req, res, next) => {
            if (err instanceof ApiError) {
                return res
                    .status(err.statusCode)
                    .json(new ApiResponse(err.statusCode, err.message));
            }
            return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
        });

        // Inject registry info
        this.app.use("/api/v1/middleman", (req, _, next) => {
            req.registryData = {
                registryHost: this.registryHost,
                registryPort: this.registryPort,
                showLog: this.showLog
            };
            next();
        }, middlemanRouter);

        this.app.get("/", (req, res) => {
            res.send("NDK-RPC-Engine is running on port " + this.port);
        });
    }

    async start() {
        if (!this.showLog) {
            this.app.listen(this.port, () => { console.log(chalk.green(`NDK-RPC-MiddleServer is running on http://localhost:${this.port}`) + "\n    ") });
            return;
        }

        this.app.listen(this.port, () => {
            console.log(chalk.green(figlet.textSync("NDK-RPC-MiddleServer")));
            console.log(chalk.green(`Server is running on http://localhost:${this.port}`));
        });

        const localIps = getAllIPv4();
        for (let ipObj of localIps) {
            console.log(
                chalk.greenBright("   Accessible at: ") +
                chalk.yellowBright.bold(`http://${ipObj.address}:${this.port}`)
            );
        }

        console.log(chalk.cyanBright("📡 Ready to accept MiddleServer requests..."));
    }
}

export default MiddleServer