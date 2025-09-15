import eventData from "../events/events.js";

export const event1Data = eventData[0];

export const eventOnePeerData = {
  peerId: "dummyid",
  name: "Satyam Bajpai",
  eventId: event1Data.room_id,
  role: "guest",
  joinedAt: new Date(),
};

export default { eventOnePeerData };
