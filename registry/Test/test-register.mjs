import GlobalRegister from "../index.mjs";

const globalRegister = new GlobalRegister({
    registryPort: 3331
});

await globalRegister.registerKeys({
    AddService: {
        host: "localhost",
        port: 4000
    },
    SubService: {
        host: "localhost",
        port: 5000
    }
})

await globalRegister.start()