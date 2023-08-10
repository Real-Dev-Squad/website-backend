const API_100MS_BASE_URL = "https://api.100ms.live/v2";
const GET_ALL_EVENTS_LIMIT_MIN = 10;
const UNWANTED_PROPERTIES_FROM_100MS = [
  "customer_id",
  "app_id",
  "recording_info",
  "template_id",
  "template",
  "customer",
];

const SUCCESS_MESSAGES = {
  CONTROLLERS: {
    KICKOUT_PEER: "Selected Participant is removed from event.",
  },
};

const ERROR_MESSAGES = {
  CONTROLLERS: {
    KICKOUT_PEER: "You can't remove selected Participant from Remove, Please ask Admin or Host for help.",
  },
  MODELS: {
    KICKOUT_PEER: {
      PEER_NOT_FOUND: "Participant not found",
      PEER_NOT_FOUND_IN_EVENT: "Participant is not part of the specified event.",
      UNABLE_TO_REMOVE_PEER: "Error in removing peer from the event.",
    },
  },
  VALIDATORS: {
    KICKOUT_PEER: "We encountered some error while removing selected Participant from event:",
  },
};

module.exports = {
  API_100MS_BASE_URL,
  GET_ALL_EVENTS_LIMIT_MIN,
  UNWANTED_PROPERTIES_FROM_100MS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
};
