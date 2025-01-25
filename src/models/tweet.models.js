/* id string pk
  owner ObjectId users
  content string
  createdAt Date
  updatedAt Date  */

import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    //schema definations id is already created by mongoose
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
