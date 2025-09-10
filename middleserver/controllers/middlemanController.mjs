import ApiResponse from "../../utils/ApiResponse.js";

const MiddlemanController = async (req, res) => {
    const { method, params, key } = req.body
    if (!method || !params || !key) {
        res.status(400).json(new ApiResponse(400, "All Method/params/key is required"))
    }

    const { registryHost, registryPort } = req.registryData;

    const registryResponse = await fetch(`http://${registryHost}:${registryPort}/api/v1/get-registry`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, method, params }),
    })

    const responseData = await registryResponse.json();
    let { data, message } = responseData;
    return res.status(200).json(new ApiResponse(200, "Method executed successfully", { method_name, result }));
}

export { MiddlemanController }