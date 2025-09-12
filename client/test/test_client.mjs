import { Client } from "../index.mjs";

const client = new Client()

const response = await client.request({
    method: "adddd",
    params: { a: 5 , b: 2 },  // Array format as expected by server
    key: "adda"
})

console.log("Response from server to Client : ", response);