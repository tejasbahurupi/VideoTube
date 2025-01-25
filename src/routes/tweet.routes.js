import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createTweet); //done
router.route("/user/:userId").get(getUserTweets); //done
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet); //done
router.route("/delete/:tweetId").delete(deleteTweet); //done

export default router;
