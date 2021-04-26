const cloudinary = require('cloudinary').v2
const config = require('config')

cloudinary.config(config.get('cloudinary'))

const upload = async (file, options = {}) => {
  const response = await cloudinary.uploader.upload(file, options)
  return response
}

const generateUrl = async (publicId, transformations = {}) => {
  const url = cloudinary.url(publicId, transformations)
  return url
}

module.exports = {
  upload,
  generateUrl
}
