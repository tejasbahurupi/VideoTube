import { Router } from "express";
import {
  deleteVideo,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//unsecured routes

//secured routes

router
  .route("/publish-video")
  .post(verifyJWT, upload.single("videoFile"), publishAVideo); //done
router.route("/getVideoById").get(verifyJWT, getVideoById); //done

router
  .route("/update-video")
  .patch(verifyJWT, upload.single("videoFile"), updateVideo); //done

router.route("/delete-video").delete(verifyJWT, deleteVideo); //done
router.route("/toggle-isPublished").patch(verifyJWT, togglePublishStatus); //done

export default router;
