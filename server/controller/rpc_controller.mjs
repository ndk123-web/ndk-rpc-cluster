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

const RunRpcMethod = async (req, res) => {
  try {
    // console.log("RPC GLOBAL REGISTRY: " , rpc_methods);
    const { method, params } = req.body;
    const rpc_methods = req.rpc_methods;
    // console.log("RPC METHODS IN REQ: " , rpc_methods);
    // Check for valid auth code

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
        chalk.red("   Method not found: ") + chalk.white(method)
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
      chalk.white(result)
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
