import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrorResponse } from "../utils/ApiErrorResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params; // Assuming channelId comes from route params

  if (!isValidObjectId(channelId)) {
    throw new ApiErrorResponse(400, "Invalid Channel ID format");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiErrorResponse(404, "Channel not found");
  }

  const isSubscribed = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  if (!isSubscribed) {
    try {
      await Subscription.create({
        channel: channelId,
        subscriber: req.user._id,
      });

      res
        .status(200)
        .json(new ApiResponse(200, "Channel subscribed successfully"));
    } catch (error) {
      throw new ApiErrorResponse(
        400,
        "Something went wrong while subscribing to the channel"
      );
    }
  } else {
    try {
      const unsubscribed = await Subscription.deleteOne({
        channel: channelId,
        subscriber: req.user._id, // Corrected here
      });

      if (unsubscribed.deletedCount === 0) {
        throw new ApiErrorResponse(400, "Subscribed User not found");
      }

      res
        .status(200)
        .json(new ApiResponse(200, "Channel unsubscribed successfully"));
    } catch (error) {
      throw new ApiErrorResponse(
        400,
        "Something went wrong while unsubscribing from the channel"
      );
    }
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params || req.query;

  const channelSubscribers = await Subscription.find({ channel: channelId });

  if (!channelSubscribers) {
    throw new ApiErrorResponse(400, "Channel not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Channel Subscribers fetched successfully",
        channelSubscribers[0]
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.query || req.params;

  const subscribedChannels = await Subscription.find({
    subscriber: req.user._id,
  });

  console.log(subscribedChannels);
  if (!subscribedChannels) {
    throw new ApiErrorResponse("400", "Subscribed channels not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Channels fetched successfully", subscribedChannels)
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
