import multer from "multer";
import { FILE_SIZE_1MB, PROFILE_FILE_SIZE } from "../constants/multer.js";
import { FILE_TOO_LARGE, ONLY_ONE_FILE_ALLOWED, ONLY_IMAGE_SUPPORTED, INTERNAL_SERVER_ERROR } from "../constants/errorMessages.js";

const multerMemoryStorage = multer.memoryStorage();

const fileFilterImagesOnly = (req, file, cb) => {
  const mimetype = file.mimetype;
  const allowedMimeTypes = ["image/png", "image/jpeg"];
  const isMimeTypeAllowed = allowedMimeTypes.includes(mimetype);
  if (isMimeTypeAllowed) {
    return cb(null, true);
  }
  return cb(new multer.MulterError("TYPE_UNSUPPORTED_FILE"), false);
};

export const upload = multer({
  storage: multerMemoryStorage,
  limits: { fileSize: PROFILE_FILE_SIZE },
  fileFilter: fileFilterImagesOnly,
});

// TODO: Add type for req, res, next
export const multerErrorHandling = (err: any, req: any, res: any, next: any) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    res.boom.entityTooLarge(FILE_TOO_LARGE(PROFILE_FILE_SIZE / FILE_SIZE_1MB));
  } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    res.boom.badData(ONLY_ONE_FILE_ALLOWED);
  } else if (err.code === "TYPE_UNSUPPORTED_FILE") {
    res.boom.unsupportedMediaType(ONLY_IMAGE_SUPPORTED);
  } else {
    res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

export const isMulterError = (err) => {
  return err instanceof multer.MulterError;
};
