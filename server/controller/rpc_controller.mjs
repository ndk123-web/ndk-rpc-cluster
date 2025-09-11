import { randomBytes } from "crypto";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import chalk from "chalk";

const GiveAuthCode = async (req, res) => {
  try {
    const auth_code = randomBytes(16).toString("hex");
    // Store auth code in global registry
    rpc_methods.auth_codes.add(auth_code);
    console.log("Generated auth code: ", auth_code);
    const response = new ApiResponse(200, "Auth code generated successfully", {
      auth_code,
    });
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    throw new ApiError(500, "Something went wrong while generating auth code");
  }
};


let count = 0;

// fault tolerance
const tryReplicas = async (replicaPorts, method, params) => {
  try {
    for (let i = 0; i < replicaPorts.length; i++) {
      const response = await fetch(`http://localhost:${replicaPorts[i]}/api/v1/rpc/run-rpc-method`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, params }),
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        return data;
      }
    }
  } catch (err) {
    console.log(err);
    return { message: err.message }
  }
}

const RunRpcMethod = async (req, res) => {
  try {
    // console.log("RPC GLOBAL REGISTRY: " , rpc_methods);
    const { method, params } = req.body;
    const rpc_methods = req.rpc_methods;
    const replicaPorts = req.replicaPorts;
    const len = replicaPorts.length;
    const serverPort = req.serverPort;
    // console.log("RPC METHODS IN REQ: " , rpc_methods);
    // Check for valid auth code

    // if serverport is not in replicaports it means it is loadbalancer 
    // and it will forward the req to the available replicas
    if (!replicaPorts.includes(serverPort)) {
      count = (count + 1) % len
      const response = await fetch(`http://localhost:${replicaPorts[count]}/api/v1/rpc/run-rpc-method`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, params }),
      });
      const data = await response.json();
      if (data.statusCode !== 200) {
        return await tryReplicas(replicaPorts, method, params)
      }
      return res.status(200).json(data);
    }
    // Validate required fields
    if (!method) {
      return res
        .status(400)
        .json(new ApiResponse(400, "method is required"));
    }

    // Find the requested method
    const methodObj = rpc_methods.find(
      (m) => m.function_name === method
    );

    if (!methodObj) {
      console.log(
        chalk.red("   Method not found: ") + chalk.white(method) + " " + chalk.magenta("Response from") + chalk.white(serverPort)
      );
      // console.log("Method not found: ", method_name);
      return res
        .status(404)
        .json(new ApiResponse(404, `Method '${method}' not found`));
    }

    // Execute the method with provided parameters
    let result;
    if (params && Array.isArray(params)) {
      result = await methodObj.function_block(...params);
    } else if (params) {
      result = await methodObj.function_block(params);
    } else {
      result = await methodObj.function_block();
    }

    const response = new ApiResponse(200, "Method executed successfully", {
      method,
      result,
    });

    // Inside RunRpcMethod after execution
    console.log(
      chalk.yellowBright("⚡ Method: ") +
      chalk.white(method) +
      " " +
      chalk.greenBright("→ Result: ") +
      chalk.white(result) +
      " " +
      chalk.green("Response from Port: ") +
      chalk.white(serverPort)
    );
    res.status(200).json(response);
  } catch (err) {
    console.log(
      chalk.red("   Error executing RPC method: ") + chalk.white(err.message)
    );
    if (err instanceof ApiError) {
      const response = new ApiResponse(err.statusCode, err.message);
      return res.status(err.statusCode).json(response);
    }
    return res
      .status(500)
      .json(
        new ApiResponse(500, "Something went wrong while executing RPC method")
      );
  }
};

export { GiveAuthCode, RunRpcMethod };
