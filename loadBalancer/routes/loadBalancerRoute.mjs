import { Router } from "express";
import { loadBalancerController } from "../controller/LoadBalancerController.mjs";

const loadBalancerRouter = Router();

loadBalancerRouter.post("/forward-requests", loadBalancerController )

export default loadBalancerRouter;