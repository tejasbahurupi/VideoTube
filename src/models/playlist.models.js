/*
id string pk
  owner ObjectId users
  videos ObjectId[] videos
  name string
  description string
  createdAt Date
  updatedAt Date
*/

import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    //schema definations id is already created by mongoose
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
