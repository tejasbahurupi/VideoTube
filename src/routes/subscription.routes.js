import { Router } from "express";
import { toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.route("/subscriber").post(verifyJWT, toggleSubscription);

export default router;
