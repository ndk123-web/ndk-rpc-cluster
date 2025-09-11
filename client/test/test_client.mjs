import { Client } from "../index.mjs";

const client = new Client()

const response = await client.request({
    method: "sub",
    params: { a: 5, b: 4 },  // Array format as expected by server
    key: "SubService"
})

console.log("Response from server to Client : ", response);