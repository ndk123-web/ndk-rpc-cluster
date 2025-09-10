import GlobalRegister from "../index.mjs";

const globalRegister = new GlobalRegister({
    registryPort: 3004
});

await globalRegister.registerKeys({
    AddService: {
        host: "localhost",
        port: 3000
    },
    SubService: {
        host: "localhost",
        port: 3001
    }
})

await globalRegister.start()