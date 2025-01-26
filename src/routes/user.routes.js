import { Router } from "express";
import {
  registerUser,
  logOutUser,
  loginUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

//unsecured routes
router.route("/login").post(loginUser); //done
router.route("/refresh-token").post(refreshAccessToken); //done

//secured routes
router.route("/logout").post(verifyJWT, logOutUser); //done
router.route("/change-password").post(verifyJWT, changeCurrentPassword); //done
router.route("/current-user").get(verifyJWT, getCurrentUser); //done
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile); //not done
router.route("/update-account").patch(verifyJWT, updateAccountDetails); //done
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar); //done
router
  .route("/coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage); //done
router.route("/history").get(verifyJWT, getWatchHistory); //done
router
  .route("/getUserChannelProfile/:username")
  .get(verifyJWT, getUserChannelProfile);
export default router;
