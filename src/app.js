import express from "express";
import cors from "cors"; //cors is used to allow cross origin requests
import cookieParser from "cookie-parser";

const app = express();
//app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

//common middleware
app.use(express.json({ limit: "16kb" })); //limit the size of the request body to 16kb, used for only allowing json data
app.use(express.urlencoded({ extended: true })); //parse url-encoded data
app.use(express.static("public")); //serve static files
app.use(cookieParser()); //parse cookies

//import routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";

//routes
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/user/subscription", subscriptionRouter);
app.use("/api/v1/video", videoRouter);

export { app };
