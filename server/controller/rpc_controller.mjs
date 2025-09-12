import { randomBytes } from "crypto";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import chalk from "chalk";

// Issue auth code; relies on req.rpc_methods.auth_codes
const GiveAuthCode = async (req, res) => {
  try {
    const rpc_methods = req.rpc_methods;
    if (!rpc_methods || !rpc_methods.auth_codes || typeof rpc_methods.auth_codes.add !== "function") {
      return res.status(500).json(new ApiResponse(500, "RPC registry not initialized"));
    }

    const auth_code = randomBytes(16).toString("hex");
    rpc_methods.auth_codes.add(auth_code);
    console.log("Generated auth code: ", auth_code);
    const response = new ApiResponse(200, "Auth code generated successfully", { auth_code });
    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    throw new ApiError(500, "Something went wrong while generating auth code");
  }
};

// Execute RPC method locally; load balancer handles distribution/failover
const RunRpcMethod = async (req, res) => {
  try {
    const { method, params } = req.body || {};
    const rpc_methods = req.rpc_methods; // Array of { function_name, function_block }
    const serverPort = req.serverPort || "unknown"; // For logging only

    // Validate input
    if (!method) {
      return res.status(400).json(new ApiResponse(400, "method is required"));
    }
    if (!Array.isArray(rpc_methods)) {
      return res.status(500).json(new ApiResponse(500, "RPC methods registry not available"));
    }

    // Resolve method
    const methodObj = rpc_methods.find((m) => m.function_name === method);
    if (!methodObj || typeof methodObj.function_block !== "function") {
      console.log(
        chalk.red("🚨 Method not found: ") +
          chalk.white(`'${method}'`) +
          " " +
          chalk.magenta("Response from") + " " + 
          chalk.white(serverPort)
      );
      return res.status(404).json(new ApiResponse(404, `Method '${method}' not found`));
    }

    // Execute method
    let result;
    if (Array.isArray(params)) {
      result = await methodObj.function_block(...params);
    } else if (params !== undefined) {
      result = await methodObj.function_block(params);
    } else {
      result = await methodObj.function_block();
    }

    const response = new ApiResponse(200, "Method executed successfully", { method, result });

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
    return res.status(200).json(response);
  } catch (err) {
    console.log(chalk.red("   Error executing RPC method: ") + chalk.white(err.message));
    if (err instanceof ApiError) {
      const response = new ApiResponse(err.statusCode, err.message);
      return res.status(err.statusCode).json(response);
    }
    return res.status(500).json(new ApiResponse(500, "May Be Server Crash"));
  }
};

export { GiveAuthCode, RunRpcMethod };
