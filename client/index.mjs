class Client {
  #middleServerPort = "";

  constructor() {
    this.#middleServerPort = 4132;
  }

  async request({ method, params, key }) {
    try {
      const server_response = await fetch(
        `http://localhost:${this.#middleServerPort}/api/v1/middleman/middleman-send-request-to-registry`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method, params, key }),
        }
      );

      const responseData = await server_response.json();
      // console.log("Response Data: ", responseData)

      if (server_response.ok) {
        // ✅ Success response
        // { message, data: { method, result } }
        return {
          message: responseData.message,
          method: responseData.data?.data?.method,
          result: responseData.data?.data?.result,
        };
      } else {
        // ❌ Error response (replica error or registry error)
        return {
          error:
            responseData.message?.message || responseData.message || "Unknown error",
        };
      }
    } catch (err) {
      return { error: "Something went wrong while making request to server" };
    }
  }
}

export { Client };
