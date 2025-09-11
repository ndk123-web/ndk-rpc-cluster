import ApiResponse from '../../utils/ApiResponse.js'
import chalk from 'chalk';

const GlobalRegisterController = async (req, res) => {
    const globalRegistry = req.globalRegistry;
    if (!globalRegistry) {
        return res.status(404).json(new ApiResponse(404, "Global Registry not found"));
    }

    // console.log("Registry Data: ", req.registryData)
    const { key, method, params } = req.body;
    // console.log("Request came with: ", { key, method, params })
    console.log(
        chalk.yellow("Request ") +
        chalk.green(key) +
        chalk.yellow(" with method ") +
        chalk.green(method) +
        chalk.yellow(" and params ") +
        chalk.green(JSON.stringify(params))
    );

    for (const [objkey, objvalue] of Object.entries(globalRegistry)) {
        if (objkey === key) {
            console.log(chalk.yellow("Key Found and Object: ") + chalk.green(JSON.stringify(objvalue)))
            return res.status(200).json(new ApiResponse(200, "Method executed successfully", {
                host: objvalue.host,
                port: objvalue.port,
                method,
                params
            }))
        }
    }

    console.log(chalk.red("Key not Found on Global Registry"))
    return res.status(400).json(new ApiResponse(400, "Key In Global Registry Not Found"))

}

export { GlobalRegisterController }