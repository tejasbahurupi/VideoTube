import asyncHandler from "../utils/asyncHandler.js";
import { ApiErrorResponse } from "../utils/ApiErrorResponse.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//checked
const registerUser = asyncHandler(async (req, res) => {
  if (!req.body) throw new ApiErrorResponse(400, "Body is required");
  const { fullName, email, username, password } = req.body;

  console.log(req.body);

  //validation (using zod not done here , done in next js course)
  // if (
  //   [fullName, email, username, password].some((field) => field?.trim() === "")
  // ) {
  //   throw new ApiErrorResponse(400, "Fullname is required");
  // }
  const existedUsername = await User.findOne({ username });

  if (existedUsername) {
    throw new ApiErrorResponse(400, "Username already exists");
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiErrorResponse(400, "User already exists");
  }
  //console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // console.log(avatarLocalPath);
  // console.log(coverImageLocalPath);
  if (!avatarLocalPath) {
    return res
      .status(400)
      .json(new ApiErrorResponse(400, "Avatar is required"));
  }

  let avatar = "";
  if (avatarLocalPath) {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  }

  let coverImage = "";
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

  try {
    const user = await User.create({
      fullName,
      email,
      username: username.toLowerCase(),
      password,
      avatar: avatar?.url,
      coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken" //it prevents sending password and refresh token
    );

    if (!createdUser) {
      throw new ApiErrorResponse(500, "Something went wrong");
    }

    res
      .status(201)
      .json(new ApiResponse(200, "OK", "User registered successfully", user)); //200 is the status code for success
  } catch (error) {
    console.log("User creation failed");

    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }

    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }

    throw new ApiErrorResponse(
      500,
      "Something went wrong while registering the user, try again and images were deleted"
    );
  }
});

//checked
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      throw new ApiErrorResponse(404, "User not found");
    }

    const accessToken = user.generateAccessToken(); //this method is directly connected to userSchema, so no need to import
    const refreshToken = user.generateRefreshToken(); //this method is directly connected to userSchema, so no need to import

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //this is to prevent revalidation of the whole user as mongoose does it by default and we don't want that

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrorResponse(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

//checked
const loginUser = asyncHandler(async (req, res) => {
  //get data from req
  if (!req.body) throw new ApiErrorResponse(400, "Body is required");

  const { email, username, password } = req.body;
  console.log(req.body);

  if (!email) throw new ApiErrorResponse(400, "Email is required");

  //check if user exists
  const user = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });

  if (!user) {
    throw new ApiErrorResponse(400, "User not found");
  }

  //validate password
  const isPasswordValid = await user.isValidPassword(password);

  if (!isPasswordValid) {
    throw new ApiErrorResponse(401, "Invalid credentials");
  }
  //console.log(user);

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //we have user above, but it is more secure to fire a query again and bring back only required field
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken" //it prevents sending password and refresh token
  );

  if (!loggedInUser) {
    throw new ApiErrorResponse(500, "Something went wrong");
  }

  //this options object is for setting cookie options
  //httpOnly: true, means that the cookie can only be accessed by the web server and not by the javascript code on the client side, this is a security feature to prevent XSS attacks
  //secure: process.env.NODE_ENV === "production", means that the cookie will be sent over a secure connection (HTTPS) when the application is running in production mode, this is a security feature to prevent man-in-the-middle attacks
  const options = {
    httpOnly: true, //to secure and only developer can modify this
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { loggedInUser, accessToken, refreshToken }, //for app as it doesnt have cookies
        "User logged in successfully"
      )
    );
});

//checked
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingrefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingrefreshToken) {
    throw new ApiErrorResponse(401, "Refresh token is required");
  }

  //now refresh token only contains _id of user so we can use it to find the user
  try {
    const decodedToken = jwt.verify(
      incomingrefreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiErrorResponse(401, "Invalid refresh token");
    }

    if (user.refreshToken !== incomingrefreshToken) {
      throw new ApiErrorResponse(401, "Invalid refresh token");
    }

    //just renaming
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true, //to secure and only developer can modify this
      secure: process.env.NODE_ENV === "production",
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiErrorResponse(401, "Invalid refresh token");
  }
});

//checked
const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    // This code updates the document by setting the refreshToken field to undefined(we can use null and empty string as well but undefined works best in most cases).
    // The 'new' option set to true returns the modified document rather than the original.
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true, //to secure and only developer can modify this
    secure: process.env.NODE_ENV === "production",
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

//checked
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  console.log(req.body);
  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isValidPassword(oldPassword);

  if (!isPasswordValid) {
    throw new ApiErrorResponse(401, "Invalid credentials");
  }

  user.password = newPassword; //we are sending unhashed password as we have a pre hook which acts as a middleware which encrypts the password

  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, req.user, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "User details fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiErrorResponse(400, "Fullname and email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullName, email },
    },
    { new: true } //to return the modified document rather than the original
  ).select("-password -refreshToken"); //it prevents sending password and refresh token

  res.status(200).json(new ApiResponse(200, user, "User details updated"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  // console.log(req.file);
  // console.log(avatarLocalPath);
  if (!avatarLocalPath) {
    throw new ApiErrorResponse(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(avatar);

  if (!avatar) {
    throw new ApiErrorResponse(500, "Something went wrong");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true } //to return the modified document rather than the original
  ).select("-password -refreshToken"); //it prevents sending password and refresh token

  res.status(200).json(new ApiResponse(200, user, "User avatar updated"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiErrorResponse(400, "CoverImage is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage) {
    throw new ApiErrorResponse(500, "Something went wrong");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true } //to return the modified document rather than the original
  ).select("-password -refreshToken"); //it prevents sending password and refresh token

  res.status(200).json(new ApiResponse(200, user, "User coverImage updated"));
});

//check after writing a channel
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiErrorResponse(400, "Username is required");
  }

  const channel = await User.aggregate([
    {
      $match: { username: username.toLowerCase() },
    },
    {
      //this are the subscribers of your channel
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "Subscribers",
      },
    },
    {
      //this is the count of channels you subscribed
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "SubscribedChannels",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$Subscribers",
        },
        subscribedChannelsCount: {
          $size: "$SubscribedChannels",
        },
        isSubscribed: {
          //if is subscribed or not
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  res.status(200).json(new ApiResponse(200, channel[0]));
});

//important one abt aggregation pipeline
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logOutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
