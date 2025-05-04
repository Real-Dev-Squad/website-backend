import DatauriParser from "datauri/parser.js";

import { updateUserPicture } from "../models/users.js";
import { upload } from "../utils/cloudinary.js";
import cloudinaryMetaData from "../constants/cloudinary.js";
import logger from "../utils/logger.js";

/**
 * upload user profile picture to cloudinary
 *
 * @param file { Object }: multipart file data
 * @param userId { string }: User id
 */
const uploadProfilePicture = async ({ file, userId, coordinates }) => {
  try {
    const parser = new DatauriParser();
    const imageDataUri = parser.format(file.originalname, file.buffer);
    const imageDataInBase64 = imageDataUri.content;
    const uploadResponse = await upload(imageDataInBase64, {
      folder: `${cloudinaryMetaData.PROFILE.FOLDER}/${userId}`,
      tags: cloudinaryMetaData.PROFILE.TAGS,
      transformation: {
        ...coordinates,
        crop: "crop",
        fetch_format: "auto",
      },
    });
    const { public_id: publicId, secure_url: url } = uploadResponse;
    await updateUserPicture({ publicId, url }, userId);
    return { publicId, url };
  } catch (err) {
    logger.error(`Error while uploading profile picture ${err}`);
    throw err;
  }
};

/**
 * upload badge image to cloudinary
 * @param file { Object }: File object
 * @param badgeName { string }: Badge name
 * @return image { Object }: id and imageUrl
 */
async function uploadBadgeImage({ file, badgeName }) {
  try {
    const parser = new DatauriParser();
    const imageDataUri = parser.format(file.originalname, file.buffer);
    const imageDataInBase64 = imageDataUri.content;
    const uploadResponse = await upload(imageDataInBase64, {
      folder: `${cloudinaryMetaData.BADGE.FOLDER}/${badgeName}`,
      tags: cloudinaryMetaData.BADGE.TAGS,
    });
    const { public_id: id, secure_url: imageUrl } = uploadResponse;
    return { id, imageUrl };
  } catch (err) {
    logger.error(`Error while uploading profile picture ${err}`);
    throw err;
  }
}

export { uploadProfilePicture, uploadBadgeImage };
