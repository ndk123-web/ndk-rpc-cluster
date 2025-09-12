import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import chalk from "chalk";

var roundRobinCount = 0;

const RetryOtherReplicas = async (replicaPorts, method, params, failedPort) => {
    for (let i = 0; i < replicaPorts.length; i++) {
        try {
            if (replicaPorts[i] === failedPort) {
                continue;
            }
            const response = await fetch(`http://localhost:${replicaPorts[i]}/api/v1/rpc/run-rpc-method`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ method, params }),
            });
            if (response.ok) {
                return response;
            }
        }
        catch (err) {
            continue // try other replicas
        }
    }
    throw new ApiError(500, 'All Replicas Are Failed')
}

const loadBalancerController = async (req, res) => {
    var sendPort;
    var replicaPorts; // Declare outside try block to avoid scope issues
    var method; // Declare outside try block
    var params; // Declare outside try block
    
    try {
        ({ method, params } = req.body); // Destructure and assign
        replicaPorts = req.replicaPorts; // Assign here
        // console.log("Replicas Ports Inside Load Balancer Controller: ", replicaPorts);

        // Ensure we have valid replica ports and reset counter if out of bounds
        if (!replicaPorts || replicaPorts.length === 0) {
            return res.status(503).json(new ApiResponse(503, "No replica servers available"));
        }

        // Reset roundRobinCount if it's out of bounds
        if (roundRobinCount >= replicaPorts.length) {
            roundRobinCount = 0;
        }

        sendPort = replicaPorts[roundRobinCount];
        // console.log("Sending request to Port: ", sendPort);
        // console.log("Method: ", method);
        // console.log("Params: ", params);

        const response = await fetch(`http://localhost:${sendPort}/api/v1/rpc/run-rpc-method`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ method, params }),
        });

        let data;
        try {
            data = await response.json();
        } catch (err) {
            const errorText = await response.text();
            data = { message: errorText };
        }

        if (response.ok) {
            return res.status(200).json(data);
        }
        // it means server crash
        else if (response.status === 500) {
            const retryResponse = await RetryOtherReplicas(replicaPorts, method, params, sendPort);
            const retryData = await retryResponse.json();
            return res.status(200).json(retryData);
        }
        else {
            console.log(chalk.red("🚨 Error response from replica: ") + chalk.white(data.message || "Unknown error"));
            return res.status(response.status).json(
                new ApiResponse(response.status, `Replica server error: ${data.message || "Unknown error"}`)
            );
        }

    } catch (err) {
        // Check if all required variables are available before retrying
        if (replicaPorts && replicaPorts.length > 0 && method && params !== undefined) {
            try {
                const retryResponse = await RetryOtherReplicas(replicaPorts, method, params, sendPort);
                const retryData = await retryResponse.json();
                return res.status(200).json(retryData);
            } catch (retryErr) {
                console.log(chalk.red("All replicas failed: ") + chalk.white(retryErr.message));
                return res.status(500).json(new ApiResponse(500, "All replica servers failed"));
            }
        } else {
            console.log(chalk.red("Error: ") + chalk.white(err.message));
            return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
        }
    } finally {
        // Only increment if we have valid replica ports
        if (replicaPorts && replicaPorts.length > 0) {
            roundRobinCount = (roundRobinCount + 1) % replicaPorts.length;
        }
    }
};

export { loadBalancerController };