import GlobalRegister from "../index.mjs";

const globalRegister = new GlobalRegister({
    // by default createMiddleware will be true , false means user want to manually create the middleware
    createMiddleware: true 
});

await globalRegister.registerKeys({
    AddService: {
        host: "localhost",
        port: 3000
    },
    SubService: {
        host: "localhost",
        port: 4000
    }
})

await globalRegister.start()