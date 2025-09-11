import ApiResponse from "../../utils/ApiResponse.js";

const MiddlemanController = async (req, res) => {
    const { method: serverMethod, params: serverParams, key } = req.body
    if (!serverMethod || !serverParams || !key) {
        res.status(400).json(new ApiResponse(400, "All Method/params/key is required"))
    }

    const { registryHost, registryPort } = req.registryData;

    console.log("Sending Request to Registry")

    const registryResponse = await fetch(`http://${registryHost}:${registryPort}/api/v1/get-registry-data`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, method: serverMethod, params: serverParams }),
    })

    console.log("Registry Response: ", registryResponse)

    const jsonresponse = await registryResponse.json();
    if (jsonresponse.statusCode !== 200) {
        return res.status(jsonresponse.statusCode).json(new ApiResponse(jsonresponse.statusCode, jsonresponse.message))
    }
    const { host, port, method, params } = jsonresponse.data;

    console.log("Sending Request to Server with: ", { host, port, method, params })
    const serverResponse = await fetch(`http://${host}:${port}/api/v1/rpc/run-rpc-method`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ method, params }),
    })

    console.log("Registry Response in Middleserver: ", serverResponse)
    const jsonresponsee = await serverResponse.json()
    console.log("JSON Response in Middleserver: ", jsonresponsee)
    if (jsonresponsee.statusCode !== 200) {
        const sendResponse = { message: jsonresponsee.message }
        return res.status(400).json(new ApiResponse(400, sendResponse))
    }

    const sendResponse = {
        message: jsonresponsee.message,
        data: jsonresponsee.data
    }

    return res.status(200).json(new ApiResponse(200, "Method executed successfully", sendResponse));
}

export { MiddlemanController }