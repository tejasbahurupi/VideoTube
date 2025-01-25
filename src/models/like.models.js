/*id string pk
  video ObjectId videos
  comment ObjectId comments
  tweet ObjectId tweets
  likedBy ObjectId users
  createdAt Date
  updatedAt Date*/

import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    //schema definations id is already created by mongoose
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      //required: true,
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
      // required: true,
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Like = mongoose.model("Like", likeSchema);
