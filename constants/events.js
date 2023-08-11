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

const API_URLS = {
  CREATE_EVENT: "/rooms",
  GET_ALL_EVENTS: ({ limitOfRooms, isEnabled, start }) => {
    return `/rooms?limit=${limitOfRooms}&enabled=${isEnabled}&start=${start}`;
  },
  GET_EVENT_BY_ID: ({ isActiveRoom, roomId }) => {
    return `/${isActiveRoom ? "active-" : ""}rooms/${roomId}`;
  },
  UPDATE_EVENT: ({ roomId }) => {
    return `/rooms/${roomId}`;
  },
  END_ACTIVE_EVENT: ({ roomId }) => {
    return `/active-rooms/${roomId}/end-room`;
  },
  KICKOUT_PEER: ({ roomId }) => {
    return `/active-rooms/${roomId}/remove-peers`;
  },
};

const SUCCESS_MESSAGES = {
  CONTROLLERS: {
    JOIN_EVENT: "Token generated successfully!",
    GET_EVENT_BY_ID: "Event details retrieved successfully.",
    UPDATE_EVENT: ({ isEnabled }) => {
      return `Event is ${isEnabled ? "enabled" : "disabled"}.`;
    },
    END_ACTIVE_EVENT: "Event ended successfully.",
    KICKOUT_PEER: "Selected Participant is removed from event.",
    ADD_PEER_TO_EVENT: "Selected Participant is added to the event.",
  },
};

const ERROR_MESSAGES = {
  CONTROLLERS: {
    CREATE_EVENT: "Couldn't create event. Please try again later",
    GET_ALL_EVENTS: "Couldn't get events. Please try again later",
    GET_EVENT_BY_ID: "Unable to retrieve event details",
    UPDATE_EVENT: "Couldn't update event. Please try again later.",
    END_ACTIVE_EVENT: "Couldn't end the event. Please try again later.",
    KICKOUT_PEER: "You can't remove selected Participant from Remove, Please ask Admin or Host for help.",
    ADD_PEER_TO_EVENT: "You can't add selected Participant. Please ask Admin or Host for help.",
  },
  MODELS: {
    KICKOUT_PEER: {
      PEER_NOT_FOUND: "Participant not found",
      PEER_NOT_FOUND_IN_EVENT: "Participant is not part of the specified event.",
      UNABLE_TO_REMOVE_PEER: "Error in removing peer from the event.",
    },
    ADD_PEER_TO_EVENT: "Error in adding peer to the event.",
    END_ACTIVE_EVENT: "Error in ending event.",
    UPDATE_EVENT: "Error in enabling event.",
    CREATE_EVENT: "Error in creating event.",
  },
  VALIDATORS: {
    CREATE_EVENT: "Error creating event: ",
    GET_ALL_EVENTS: "Error retrieving all events: ",
    JOIN_EVENT: "Error joining event: ",
    GET_EVENT_BY_ID: "Error retrieving event: ",
    UPDATE_EVENT: "Error updating event: ",
    END_ACTIVE_EVENT: "Error while ending the event: ",
    ADD_PEER_TO_EVENT: "Error while adding a peer to the event: ",
    KICKOUT_PEER: "We encountered some error while removing selected Participant from event:",
  },
};

module.exports = {
  API_100MS_BASE_URL,
  GET_ALL_EVENTS_LIMIT_MIN,
  UNWANTED_PROPERTIES_FROM_100MS,
  API_URLS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
};
