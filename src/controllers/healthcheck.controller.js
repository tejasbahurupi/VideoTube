import { ApiErrorResponse } from "../utils/ApiErrorResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiErrorResponse(200, "OK", "HealthCheck passed")); //200 is the status code for success
});

export { healthcheck };
