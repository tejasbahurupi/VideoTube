import { app } from "./app.js";
import connectDB from "./db/index.js";

import dotenv from "dotenv"; //used for environment variables.

dotenv.config({
  path: ".env",
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
