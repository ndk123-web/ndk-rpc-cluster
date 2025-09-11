import GlobalRegister from "../index.mjs";

const globalRegister = new GlobalRegister({
    registryPort: 3331,

    // by default createMiddleware will be true , false means user want to manually create the middleware
    createMiddleware: true 
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