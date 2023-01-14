const DOCUMENT_WRITE_SIZE = 500;

const ERROR_MESSAGES = {
  models: {
    unassignBadges: "Error un-assigning badges",
    assignBadges: "Error assigning badges",
    createBadge: "Error creating badge",
    fetchUserBadges: "Error fetching all user badges",
    fetchBadges: "Error fetching badges",
  },
  controllers: {
    deleteUserBadges: "Failed to unassign badges",
    postUserBadges: "Failed to assign badges",
    postBadge: "Failed to create badge",
    getUserBadges: "Failed to get user badges",
    getBadges: "Failed to get all badges.",
  },
  misc: {
    userDoesNotExist: "The User does not exsit",
  },
  validators: {
    createBadge: {
      fileisMissing: "Badge image file is missing",
      validatonFailed: "Error validating createBadge payload",
    },
    assignOrUnassignBadges: {
      validatonFailed: "Error validating assign or unassign badges payload",
    },
    apiPayloadValidationFailed: "API payload failed validation",
  },
};

const SUCCESS_MESSAGES = {
  controllers: {
    deleteUserBadges: "Badges un-assigned successfully",
    postUserBadges: "Badges assigned successfully",
    postBadge: "Badge created successfully",
    getUserBadges: "User Badges returned succesfully",
    getBadges: "Badges returned successfully",
  },
};

module.exports = {
  DOCUMENT_WRITE_SIZE,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
