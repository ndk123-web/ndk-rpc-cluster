    // MiddleServer
    import MiddleServer from "../index.mjs";
    const middle = new MiddleServer({ registryHost: "localhost", registryPort: 3331, showLog: true });
    await middle.start();