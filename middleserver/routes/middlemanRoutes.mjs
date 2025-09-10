import { Router } from "express";
import { MiddlemanController } from "../controllers/middlemanController.mjs";

const middlemanRouter = Router();

middlemanRouter.post("/middleman-send-request-to-registry", MiddlemanController)

export { middlemanRouter }