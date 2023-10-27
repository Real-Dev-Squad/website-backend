module.exports = {
  INTERNAL_SERVER_ERROR: "An internal server error occurred",
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again or contact admin",
  ONLY_IMAGE_SUPPORTED: "Only image/jpeg, image/png supported",
  ONLY_ONE_FILE_ALLOWED: "Only one file allowed",
  DATA_ADDED_SUCCESSFULLY: "User Device Info added successfully!",
  USER_DATA_ALREADY_PRESENT: "The authentication document has already been created",
  BAD_REQUEST: "BAD_REQUEST",
  INVALID_QUERY_PARAM: "Invalid Query Parameters Passed",
  FILE_TOO_LARGE: (size) => `File too large, max accepted size is ${size} MB`,
  USER_DOES_NOT_EXIST_ERROR: "User does not exist!",
};
