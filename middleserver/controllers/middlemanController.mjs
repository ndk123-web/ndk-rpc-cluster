import chalk from "chalk";
import ApiResponse from "../../utils/ApiResponse.js";

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

const MiddlemanController = async (req, res) => {
    const { method: serverMethod, params: serverParams, key } = req.body;

    if (!serverMethod || !serverParams || !key) {
        logError("Missing required fields in request body", { serverMethod, serverParams, key });
        return res.status(400).json(new ApiResponse(400, "All Method/params/key is required"));
    }

    const { registryHost, registryPort, showLog } = req.registryData;

    if (showLog) {
        logInfo("Sending request to Registry", { key, serverMethod, serverParams });
    }

    let jsonresponse;
    try {
        const registryResponse = await fetch(`http://${registryHost}:${registryPort}/api/v1/get-registry-data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, method: serverMethod, params: serverParams }),
        });

        logSuccess("Received response from Registry", { status: registryResponse.status });
        // console.log("Registry Response: ", registryResponse)
        jsonresponse = await registryResponse.json();

    } catch (err) {
        logError("Failed to fetch registry data", { error: err.message });
        return res.status(500).json(new ApiResponse(500, "Registry request failed"));
    }

    const { host, port, method, params, protocol, portRequired  } = jsonresponse.data || {};
    if (!host || !port) {
        logError("Registry returned invalid server info", jsonresponse);
        return res.status(500).json(new ApiResponse(500, "Invalid server info from registry"));
    }

    if (showLog) {
        logInfo("Sending request to Server", { host, port, method, params });
    }

    let jsonresponsee;
    try {
        // here host and port of load balancer is used
        let serverResponse
        // console.log("portRequired: ", portRequired)
        // console.log("Host: ", host)
        // console.log("Port: ", port)
        // console.log("Protocol: ", protocol)
        // console.log("Method: ", method)
        // console.log("Params: ", params)
        if (portRequired) {
            serverResponse = await fetch(`${protocol}://${host}:${port}/api/v1/ndk-load-balancer/forward-requests`, {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ method, params }),
            });
            jsonresponsee = await serverResponse.json();

        } else {
            serverResponse = await fetch(`${protocol}://${host}/api/v1/${method}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ method, params }),
            });
            jsonresponsee = await serverResponse.json();
        }

        if (showLog) {
            logSuccess("Received response from Server", { status: serverResponse.status, host, port, method });
        }
    } catch (err) {
        if (showLog) {
            logError("Failed to fetch server response", { error: err.message });
        }
        return res.status(500).json(new ApiResponse(500, "Server request failed"));
    }

    if (jsonresponsee.statusCode !== 200) {
        if (showLog) {
            logError("Server returned an error", jsonresponsee);
        }
        return res.status(jsonresponsee.statusCode).json(
            new ApiResponse(jsonresponsee.statusCode, { message: jsonresponsee.message, statusCode: jsonresponsee.statusCode })
        );
    }

    if (showLog) {
        logSuccess("Method executed successfully", { message: jsonresponsee.message });
    }

    return res.status(200).json(
        new ApiResponse(200, "Method executed successfully", { message: jsonresponsee.message, data: jsonresponsee.data })
    );
};

export { MiddlemanController };
