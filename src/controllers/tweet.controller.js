import mongoose from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { ApiErrorResponse } from "../utils/ApiErrorResponse.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiErrorResponse(400, "Tweet content is required");
  }

  const tweet = await Tweet.create({ owner: req.user._id, content });

  res.status(201).json(new ApiResponse(201, "Tweet created", tweet));
});

const getUserTweets = asyncHandler(async (req, res) => {
  console.log(req.user);
  if (!req.user || !req.user._id) {
    throw new ApiErrorResponse(401, "Unauthorized access");
  }

  const userTweets = await Tweet.find({ owner: req.user._id });

  res.status(200).json(new ApiResponse(200, "Tweets fetched", userTweets));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiErrorResponse(400, "Invalid tweet id");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiErrorResponse(404, "Tweet not found");
  }

  if (!tweet.owner.equals(req.user._id)) {
    throw new ApiErrorResponse(
      403,
      "You are not authorized to update this tweet"
    );
  }

  tweet.content = req.body.content || tweet.content;
  await tweet.save();

  res.status(200).json(new ApiResponse(200, "Tweet updated", tweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiErrorResponse(400, "Invalid tweet id");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiErrorResponse(404, "Tweet not found");
  }

  if (!tweet.owner.equals(req.user._id)) {
    throw new ApiErrorResponse(
      403,
      "You are not authorized to delete this tweet"
    );
  }

  await tweet.deleteOne();

  res.status(200).json(new ApiResponse(200, "Tweet deleted", null));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
