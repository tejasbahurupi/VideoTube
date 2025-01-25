/*
id string pk
  video ObjectId videos
  comment ObjectId comments
  tweet ObjectId tweets
  likedBy ObjectId users
  createdAt Date
  updatedAt Date*/

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; //for aggregate pipelines

const commentSchema = new Schema(
  {
    //schema definations id is already created by mongoose
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: [true, "Video is required"],
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      //required: true,
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
      //required: true,
    },
    commentedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.plugin(mongooseAggregatePaginate);
export const Comment = mongoose.model("Comment", commentSchema);
