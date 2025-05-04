import { v2 as cloudinary } from "cloudinary";
import config from "config";

cloudinary.config(config.get("cloudinary"));

const upload = async (file, options = {}) => {
  const response = await cloudinary.uploader.upload(file, options);
  return response;
};

export { upload };
