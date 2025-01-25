import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiErrorResponse } from "../utils/ApiErrorResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.header("authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiErrorResponse(401, "Unauthorized");
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiErrorResponse(401, "Unauthorized");
    }

    req.user = user; //now we add the user to the request
    next();
  } catch (error) {
    throw new ApiErrorResponse(401, error?.message || "Invalid access Token");
  }
});
