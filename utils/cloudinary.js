const cloudinary = require("cloudinary").v2;
const config = require("config");

cloudinary.config(config.get("cloudinary"));

const upload = async (file, options = {}) => {
  const response = await cloudinary.uploader.upload(file, options);
  return response;
};

module.exports = {
  upload,
};
