// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const multer = require('multer')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const multerConstant = require('../constants/multer')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const errorMessage = require('../constants/errorMessages')
const multerMemoryStorage = multer.memoryStorage()

const MB_1 = multerConstant.FILE_SIZE_1MB
const profileFileSize = multerConstant.PROFILE_FILE_SIZE

const fileFilterImagesOnly = (req: any, file: any, cb: any) => {
  const mimetype = file.mimetype
  const allowedMimeTypes = ['image/png', 'image/jpeg']
  const isMimeTypeAllowed = allowedMimeTypes.includes(mimetype)
  if (isMimeTypeAllowed) {
    return cb(null, true)
  }
  return cb(new multer.MulterError('TYPE_UNSUPPORTED_FILE'), false)
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'upload'.
const upload = multer({
  storage: multerMemoryStorage,
  limits: { fileSize: profileFileSize },
  fileFilter: fileFilterImagesOnly
})

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'multerErro... Remove this comment to see the full error message
const multerErrorHandling = (err: any, req: any, res: any, next: any) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.boom.entityTooLarge(errorMessage.FILE_TOO_LARGE(profileFileSize / MB_1))
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    res.boom.badImplementation(errorMessage.ONLY_ONE_FILE_ALLOWED)
  } else if (err.code === 'TYPE_UNSUPPORTED_FILE') {
    res.boom.unsupportedMediaType(errorMessage.ONLY_IMAGE_SUPPORTED)
  } else {
    res.boom.badImplementation(errorMessage.INTERNAL_SERVER_ERROR)
  }
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isMulterEr... Remove this comment to see the full error message
const isMulterError = (err: any) => {
  return (err instanceof multer.MulterError)
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  upload,
  multerErrorHandling,
  isMulterError
}
