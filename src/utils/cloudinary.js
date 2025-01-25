import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises"; // Correctly import fs.promises
import dotenv from "dotenv";

dotenv.config();

//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    //console.log(localFilePath);
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("file uploaded on cloudinary. File src : " + response.url);

    // Delete the file after upload using fs.promises.unlink
    try {
      await fs.unlink(localFilePath); // No callback needed here
      console.log("Local file deleted successfully.");
    } catch (err) {
      console.log("Error deleting local file from server: " + err);
    }
    //console.log(response);
    return response;
  } catch (error) {
    console.log("Error uploading to Cloudinary: " + error);

    //Ensure the local file is deleted even if upload fails
    try {
      await fs.unlink(localFilePath); // No callback needed here either
      console.log("Local file deleted after failed upload.");
    } catch (err) {
      console.log("Error deleting local file from server: " + err);
    }

    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    await cloudinary.uploader.destroy(publicId);
    console.log("file deleted from cloudinary");
  } catch (error) {
    console.log("Error deleting from cloudinary: " + error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
