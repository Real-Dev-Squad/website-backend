// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const DatauriParser = require('datauri/parser')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userModel'... Remove this comment to see the full error message
const userModel = require('../models/users')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'upload'.
const { upload } = require('../utils/cloudinary')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const cloudinaryMetaData = require('../constants/cloudinary')

/**
 * upload user profile picture to cloudinary
 *
 * @param file { Object }: multipart file data
 * @param userId { string }: User id
 */
const uploadProfilePicture = async (file: any, userId: any) => {
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

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  uploadProfilePicture
}
