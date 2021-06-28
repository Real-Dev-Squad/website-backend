const DatauriParser = require('datauri/parser')
const userModel = require('../models/users')
const { upload } = require('../utils/cloudinary')
const cloudinaryMetaData = require('../constants/cloudinary')

/**
 * upload user profile picture to cloudinary
 *
 * @param file { Object }: multipart file data
 * @param userId { string }: User id
 */
const uploadProfilePicture = async (file, userId) => {
  try {
    const parser = new DatauriParser()
    const imageDataUri = parser.format(file.originalname, file.buffer)
    const imageDataInBase64 = imageDataUri.content
    const uploadResponse = await upload(imageDataInBase64, {
      folder: `${cloudinaryMetaData.PROFILE.FOLDER}/${userId}`,
      tags: cloudinaryMetaData.PROFILE.TAGS
    })
    const { public_id: publicId, secure_url: url } = uploadResponse
    await userModel.updateUserPicture({ publicId, url }, userId)
    return { publicId, url }
  } catch (err) {
    logger.error(`Error while uploading profile picture ${err}`)
    throw err
  }
}

module.exports = {
  uploadProfilePicture
}
