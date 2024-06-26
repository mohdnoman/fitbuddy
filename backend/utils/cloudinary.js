import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // Check if Cloudinary response contains the URL
        if (!response.url) {
            throw new Error("Failed to upload file to Cloudinary");
        }

        // Log the successful upload
        console.log("File uploaded to Cloudinary:", response.url);

        // Delete the local file
        fs.unlinkSync(localFilePath);

        // Return the Cloudinary response
        return response;
    } catch (error) {
        // Remove the locally saved temporary file as the upload operation failed
        fs.unlinkSync(localFilePath);
        // Log the error
        console.error("Error uploading file to Cloudinary:", error);
        // Return null to indicate failure
        return null;
    }
};

const removeFromCloudinary = async (imageLink) => {
    try {
        if (!imageLink) {
            throw new ApiError(400, "Image Url required")
        }

        const result = await cloudinary.uploader.destroy(imageLink)

        if (!result) {
            throw new ApiError(500, "Error while deleting image from Cloudinary")
        }

        return result
    } catch (error) {
        console.log("Error deleting file from Cloudinary:", error)

        return null
    }
}


export { uploadOnCloudinary, removeFromCloudinary }