/*id string pk
  owner ObjectId users
  videoFile string
  thumbnail string
  title string
  description string
  duration number
  views number
  isPublished boolean
  createdAt Date
  updatedAt Date*/

import mongoose, { plugin, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    //schema definations id is already created by mongoose
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      //required: [true, "Description is required"],
      trim: true,
    },
    thumbnail: {
      type: String, //cloudinary URl
      //required: [true, "Thumbnail is required"],
    },
    videoFile: {
      type: String, //cloudinary URl
      required: [true, "Video Url is required"],
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
