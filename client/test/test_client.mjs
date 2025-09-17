import { Client } from "../index.mjs";

const client = new Client()


for (let i = 0; i < 1000; i++) {
    const response = await client.request({
        method: "add",
        params: { a: 5, b: 2 },  // Array format as expected by server
        key: "AddService"
    })
    console.log("Response from server to Client : ", response);
}   