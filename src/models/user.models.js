/*
  id string pk
  username string
  email string
  fullName string
  avatar string
  coverImage string
  watchHistory ObjectId[] videos
  password string
  refreshToken string
  createdAt Date
  updatedAt Date
*/

import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv"; //used for environment variables.

import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    //schema definations id is already created by mongoose
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: [true, "Username already exists"],
      lowercase: true,
      trim: true,
      index: true, //easy and cheaper to find
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      //lowercase : true, //to make sure email is lowercase
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Fullname is required"],
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary link
      required: [true, "Avatar is required"], //we can pass message
    },
    coverImage: {
      type: String,
      //required: true,
    },
    watchHistory: [
      {
        type: [Schema.Types.ObjectId], //refers to video model
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    //schema options automatically creates createdAt and updatedAt
    timestamps: true,
  }
);

//sometimes some methods are more attached to models, rather than controllers, so it is more logical to put them in models

userSchema.pre("save", async function (next) {
  // use regular function as context is required

  if (!this.isModified("password")) return next(); //if password field is not modified and while saving, it is not being modified so next code will run

  this.password = await bcrypt.hash(this.password, 10); //this encrpyts the password. it runs in the algo 10 times standard practice
  next();
});

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password); //it takes time
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  console.log(this._id);
  //only requires 1 parameter
  return jwt.sign({ _id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const User = mongoose.model("User", userSchema); //mongoose automatically converts the name to plurals always first letter capital
