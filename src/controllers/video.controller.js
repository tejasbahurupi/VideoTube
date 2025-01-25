import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiErrorResponse } from "../utils/ApiErrorResponse.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title) throw new ApiErrorResponse(400, "Title is required");
  if (!description) throw new ApiErrorResponse(400, "Description is required");

  const videoFileLocalPath = req.file?.path;
  console.log(videoFileLocalPath);

  if (!videoFileLocalPath) {
    throw new ApiErrorResponse(400, "Video file is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);

  if (!videoFile) {
    throw new ApiErrorResponse(400, "Video file upload failed");
  }

  try {
    const video = await Video.create({
      title,
      description,
      videoFile: videoFile.secure_url, // Cloudinary URL
      owner: req.user._id,
      duration: videoFile.duration,
      isPublished: true,
    });

    res.status(201).json(new ApiResponse(201, "Video created", video));
  } catch (error) {
    await deleteFromCloudinary(videoFile.public_id);
    throw new ApiErrorResponse(400, "Video creation failed");
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.query || req.params;

  console.log(req.query);
  console.log(videoId);

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiErrorResponse(400, "Invalid Video ID format");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiErrorResponse(404, "Video not found");
  }

  res.status(200).json(new ApiResponse(200, "Video fetched", video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.query || req.params;
  const { title, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiErrorResponse(400, "Invalid Video ID format");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiErrorResponse(404, "Video not found");
  }

  const oldVideoUrl = video.videoFile.url;
  const newVideoLocalPath = req.file?.path;

  if (!newVideoLocalPath) {
    throw new ApiErrorResponse(404, "New Video File not found");
  }

  let newVideoFile = "";
  try {
    newVideoFile = await uploadOnCloudinary(newVideoLocalPath);
  } catch (error) {
    throw new ApiErrorResponse(400, "New Video file not Uploaded");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        videoFile: newVideoFile.url,
        title,
        description,
      },
    },
    { new: true }
  );

  try {
    await deleteFromCloudinary(oldVideoUrl);
    console.log("Old File Deleted from cloudinary");
  } catch {
    throw new ApiErrorResponse(400, "Video deletion failed");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "New File Uploaded successfully", updatedVideo));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.query || req.params;

  console.log(videoId);

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiErrorResponse(400, "Invalid Video ID Format");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiErrorResponse(400, "Video not found");
  }

  console.log(video.owner);
  console.log(req.user._id);

  if (!video.owner.equals(req.user._id)) {
    throw new ApiErrorResponse(403, "Invalid Authorization");
  }

  await video.deleteOne();

  res.status(200).json(new ApiResponse(200, "Video deleted", null));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.query || req.params;

  if (!videoId) {
    throw new ApiErrorResponse(400, "No videoId found");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiErrorResponse(400, "Invalid Video ID Format");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiErrorResponse(404, "Video not found");
  }

  if (!video.owner.equals(req.user._id)) {
    throw new ApiErrorResponse(403, "Unauthorized Access");
  }

  video.isPublished = !video.isPublished;

  try {
    await video.save();
  } catch (error) {
    throw new ApiErrorResponse("400", "Data was not saved properly");
  }
  res.status(200).json(new ApiResponse(200, "Published is toggled", video));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
