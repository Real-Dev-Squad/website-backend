const multer = require('multer')
const multerConstant = require('../constants/multer')
const multerMemoryStorage = multer.memoryStorage()

const MB_1 = multerConstant.FILE_SIZE_1MB
const profileFileSize = multerConstant.PROFILE_FILE_SIZE

function fileFilterImagesOnly (req, file, cb) {
  const mimetype = file.mimetype
  const isMimeTypePng = (mimetype === 'image/png')
  const isMimeTypeJpeg = (mimetype === 'image/jpeg')
  if (isMimeTypePng || isMimeTypeJpeg) {
    return cb(null, true)
  }
  return cb(new multer.MulterError('TYPE_UNSUPPORTED_FILE'), false)
};

const upload = multer({
  storage: multerMemoryStorage,
  limits: { fileSize: profileFileSize },
  fileFilter: fileFilterImagesOnly
})

const multerErrorHandling = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.boom.entityTooLarge(`File too large, max accepted size is ${(profileFileSize / MB_1)} MB`)
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    res.boom.badImplementation('Only one file allowed')
  } else if (err.code === 'TYPE_UNSUPPORTED_FILE') {
    res.boom.unsupportedMediaType('Only image/jpeg, image/png supported')
  } else {
    res.boom.badImplementation('An internal server error occurred')
  }
}

const isMulterError = (err) => {
  return (err instanceof multer.MulterError)
}

module.exports = {
  upload,
  multerErrorHandling,
  isMulterError
}
