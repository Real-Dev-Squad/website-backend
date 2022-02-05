// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const cloudinary = require('cloudinary').v2
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('config')

cloudinary.config(config.get('cloudinary'))

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'upload'.
const upload = async (file: any, options = {}) => {
  const response = await cloudinary.uploader.upload(file, options)
  return response
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  upload
}
