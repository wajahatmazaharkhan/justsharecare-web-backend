import ImageKit from "imagekit";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({});

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const ImagekitFileUploader = async (localFilepath) => {
    try {
        if (!localFilepath) return null;

        // Read file from local storage
        const fileData = fs.readFileSync(localFilepath);

        // Upload to ImageKit
        const result = await imagekit.upload({
            file: fileData.toString("base64"),  // Convert to base64
            fileName: Date.now() + path.extname(localFilepath), 
        });

        // Delete local file after upload
        fs.unlinkSync(localFilepath);

        return result;

    } catch (error) {
        console.log("Error in ImageKit uploader:", error);

        // Always delete local file even if upload fails
        if (fs.existsSync(localFilepath)) {
            fs.unlinkSync(localFilepath);
        }

        return null;
    }
};
