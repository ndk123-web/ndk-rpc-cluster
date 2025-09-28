import chalk from "chalk";
import ApiResponse from "../../utils/ApiResponse.js";

// Logging functions
const logInfo = (label, obj = null) => {
    const time = new Date().toISOString();
    if (obj) {
        console.log(
            chalk.blue(`[INFO ${time}]`) +
            " " + chalk.bold(label) +
            " → " + chalk.cyan(JSON.stringify(obj, null, 2))
        );
    } else {
        console.log(chalk.blue(`[INFO ${time}]`) + " " + chalk.bold(label));
    }
};

const logSuccess = (label, obj = null) => {
    const time = new Date().toISOString();
    if (obj) {
        console.log(
            chalk.green(`[SUCCESS ${time}]`) +
            " " + chalk.bold(label) +
            " → " + chalk.green(JSON.stringify(obj, null, 2))
        );
    } else {
        console.log(chalk.green(`[SUCCESS ${time}]`) + " " + chalk.bold(label));
    }
};

const logError = (label, obj = null) => {
    const time = new Date().toISOString();
    if (obj) {
        console.error(
            chalk.red(`[ERROR ${time}]`) +
            " " + chalk.bold(label) +
            " → " + chalk.red(JSON.stringify(obj, null, 2))
        );
    } else {
        console.error(chalk.red(`[ERROR ${time}]`) + " " + chalk.bold(label));
    }
};

const GlobalRegisterController = async (req, res) => {
    const globalRegistry = req.globalRegistry;
    if (!globalRegistry) {
        logError("Global Registry not found");
        return res.status(404).json(new ApiResponse(404, "Global Registry not found"));
    }

    const { key, method, params } = req.body;

    logInfo("Incoming request to Global Registry", { key, method, params });

    for (const [objkey, objvalue] of Object.entries(globalRegistry)) {
        if (objkey === key) {
            logSuccess("Key found in Global Registry", { key, server: objvalue });
            // console.log("Key found in Global Registry", { key, server: objvalue });
            return res.status(200).json(
                new ApiResponse(200, "Method executed successfully", {
                    host: objvalue.host,
                    port: objvalue.port,
                    protocol: objvalue.protocol ?? "http",
                    portRequired: objvalue.portRequired ?? true,
                    method,
                    params
                })
            );
        }
    }

    logError("Key not found in Global Registry", { key });
    return res.status(400).json(new ApiResponse(400, "Key In Global Registry Not Found"));
};

export { GlobalRegisterController };
