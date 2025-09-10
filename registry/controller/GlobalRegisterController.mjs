import ApiResponse from '../../utils/ApiResponse.js'

const GlobalRegisterController = async (req, res) => {
    const globalRegistry = req.globalRegistry;
    if (!globalRegistry) {
        return res.status(404).json(new ApiResponse(404, "Global Registry not found"));
    }

    console.log("Registry Data: ", req.registryData)
    const { key, method, params } = req.body;
    console.log("Request came with: ", { key, method, params })

    for (const [objkey, objvalue] of Object.entries(globalRegistry)) {
        if (objkey === key) {
            console.log("Key Found and Object: ", objvalue)
            return res.status(200).json(new ApiResponse(200, "Method executed successfully", {
                host: objvalue.host,
                port: objvalue.port,
                method,
                params
            }))
        }
    }

    return res.status(400).json(new ApiResponse(400, "Key In Global Registry Not Found"))

}

export { GlobalRegisterController }