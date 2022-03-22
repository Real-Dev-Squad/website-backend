const multer = require("multer");
const multerConstant = require("../constants/multer");
const errorMessage = require("../constants/errorMessages");
const multerMemoryStorage = multer.memoryStorage();

const MB_1 = multerConstant.FILE_SIZE_1MB;
const profileFileSize = multerConstant.PROFILE_FILE_SIZE;

const fileFilterImagesOnly = (req, file, cb) => {
  const mimetype = file.mimetype;
  const allowedMimeTypes = ["image/png", "image/jpeg"];
  const isMimeTypeAllowed = allowedMimeTypes.includes(mimetype);
  if (isMimeTypeAllowed) {
    return cb(null, true);
  }
  return cb(new multer.MulterError("TYPE_UNSUPPORTED_FILE"), false);
};

const upload = multer({
  storage: multerMemoryStorage,
  limits: { fileSize: profileFileSize },
  fileFilter: fileFilterImagesOnly,
});

const multerErrorHandling = (err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    res.boom.entityTooLarge(errorMessage.FILE_TOO_LARGE(profileFileSize / MB_1));
  } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    res.boom.badData(errorMessage.ONLY_ONE_FILE_ALLOWED);
  } else if (err.code === "TYPE_UNSUPPORTED_FILE") {
    res.boom.unsupportedMediaType(errorMessage.ONLY_IMAGE_SUPPORTED);
  } else {
    res.boom.badImplementation(errorMessage.INTERNAL_SERVER_ERROR);
  }
};

const isMulterError = (err) => {
  return err instanceof multer.MulterError;
};

module.exports = {
  fileFilterImagesOnly,
  isMulterError,
  multerErrorHandling,
  upload,
};
