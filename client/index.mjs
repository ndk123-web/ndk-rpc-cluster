class Client {
  registry_port = "";

  constructor() {
    this.registry_port = 3000;
  }

  async request({ method, params, key }) {
    try {
      const server_response = await fetch(
        `http://localhost:${this.registry_port}/api/v1/run-registry/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ method_name: method, params, key }),
        }
      );
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
