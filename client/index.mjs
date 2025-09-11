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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ method, params, key }),
        }
      );
      
      // console.log("Server Response in Client: ", server_response)

      if (server_response.status !== 200) {
        const errorData = await server_response.json();
        return { message: errorData.message };
      }
      const responseData = await server_response.json();
      let { data, message } = responseData;
      return { message, ...data };
    } catch (err) {
      // DEBUG
      //   console.log(err);
      return { message: "Something went wrong while making request to server" };
    }
  }
}

export { Client };
