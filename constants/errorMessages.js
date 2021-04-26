module.exports = {
  INTERNAL_SERVER_ERROR: 'An internal server error occurred',
  ONLY_IMAGE_SUPPORTED: 'Only image/jpeg, image/png supported',
  ONLY_ONE_FILE_ALLOWED: 'Only one file allowed',
  FILE_TOO_LARGE: (size) => `File too large, max accepted size is ${(size)} MB`
}
