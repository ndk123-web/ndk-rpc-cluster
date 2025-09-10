    import { Router } from "express";
    import { GlobalRegisterController } from '../controller/GlobalRegisterController.mjs'

    const globalRegisterRouter = Router()

    globalRegisterRouter.post('/get-registry-data', GlobalRegisterController)

    export { globalRegisterRouter }