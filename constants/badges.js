const DOCUMENT_WRITE_SIZE = 500;

const ERROR_MESSAGES = {
  MODELS: {
    UNASSIGN_BADGES: "Error un-assigning badges",
    ASSIGN_BADGES: "Error assigning badges",
    CREATE_BADGE: "Error creating badge",
    FETCH_USER_BADGES: "Error fetching all user badges",
    FETCH_BADGES: "Error fetching badges",
  },
  CONTROLLERS: {
    DELETE_USER_BADGES: "Failed to unassign badges",
    POST_USER_BADGES: "Failed to assign badges",
    POST_BADGE: "Failed to create badge",
    GET_USER_BADGES: "Failed to get user badges",
    GET_BADGES: "Failed to get all badges.",
  },
  MISC: {
    USER_ID_DOES_NOT_EXIST: "The User-Id does not exsit",
  },
  VALIDATORS: {
    CREATE_BADGE: {
      FILE_IS_MISSING: "Badge image file is missing",
      VALIDATON_FAILED: "Error validating createBadge payload",
    },
    ASSIGN_OR_UNASSIGN_BADGES: {
      VALIDATON_FAILED: "Error validating assign or unassign badges payload",
    },
    API_PAYLOAD_VALIDATION_FAILED: "API payload failed validation",
  },
};

const SUCCESS_MESSAGES = {
  CONTROLLERS: {
    DELETE_USER_BADGES: "Badges un-assigned successfully",
    POST_USER_BADGES: "Badges assigned successfully",
    POST_BADGE: "Badge created successfully",
    GET_USER_BADGES: "User Badges returned succesfully",
    GET_BADGES: "Badges returned successfully",
  },
};

module.exports = {
  DOCUMENT_WRITE_SIZE,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
