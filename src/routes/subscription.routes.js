import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.route("/subscribe/:channelId").post(verifyJWT, toggleSubscription); //done
router
  .route("/subscribers/:channelId")
  .get(verifyJWT, getUserChannelSubscribers);
router
  .route("/subscribedChannels/:channelId")
  .get(verifyJWT, getSubscribedChannels);

export default router;
