import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `Database connected ! DB Host : ${connectionInstance.connection.host} `
    );
  } catch (error) {
    console.log(error);
    process.exit(1); //exit the process
  }
};
export default connectDB;
