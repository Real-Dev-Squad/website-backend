const APPLICATION_STATUS_TYPES = ["accepted", "rejected", "pending"];
const NEW_APPLICATION_STATUS_TYPES = ["not_submitted", "pending", "accepted", "rejected", "requested_changes"];

const API_RESPONSE_MESSAGES = {
  APPLICATION_RETURN_SUCCESS: "Applications returned successfully",
};

module.exports = { APPLICATION_STATUS_TYPES, API_RESPONSE_MESSAGES, NEW_APPLICATION_STATUS_TYPES };
