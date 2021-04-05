const cloudinary = require('cloudinary').v2
const config = require('config')

cloudinary.config(config.get('cloudinary'))

async function upload (file, options = {}) {
  const response = await cloudinary.uploader.upload(file, options)
  return response
}

async function generateUrl (publicId, transformations = {}) {
  const url = cloudinary.url(publicId, transformations)
  return url
}

module.exports = {
  upload,
  generateUrl
}
