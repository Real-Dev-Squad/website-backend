// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  INTERNAL_SERVER_ERROR: 'An internal server error occurred',
  ONLY_IMAGE_SUPPORTED: 'Only image/jpeg, image/png supported',
  ONLY_ONE_FILE_ALLOWED: 'Only one file allowed',
  FILE_TOO_LARGE: (size: any) => `File too large, max accepted size is ${(size)} MB`
}
