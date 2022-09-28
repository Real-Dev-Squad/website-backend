const firestore = require("../utils/firestore");
const { modifyEvent, buildEventObject } = require("../utils/events");
const { getUserId } = require("../utils/users");
const eventModel = firestore.collection("events");

const createNewEvent = async (eventData) => {
  try {
    const event = await eventModel.add(eventData);
    return event;
  } catch (err) {
    logger.error("Error in updating task", err);
    throw err;
  }
};

const getAllEvents = async () => {
  try {
    const eventSnapshot = await eventModel.get();
    const eventObj = buildEventObject(eventSnapshot);
    const promises = eventObj.map((event) => modifyEvent(event));
    const finalEvents = await Promise.all(promises);
    return finalEvents;
  } catch (err) {
    logger.error("Error in updating task", err);
    throw err;
  }
};

const getAllTaskEvents = async () => {
  try {
    const taskEventsSnapshot = await eventModel.where("type", "==", "TASK_EVENT").get();
    const taskEventObj = buildEventObject(taskEventsSnapshot);
    const promises = taskEventObj.map((event) => modifyEvent(event));
    const finalEvents = await Promise.all(promises);
    return finalEvents;
  } catch (err) {
    logger.error("Error in updating task", err);
    throw err;
  }
};

const getAllUserEvents = async () => {
  try {
    const userEventSnapshot = await eventModel.where("type", "==", "USER_EVENT").get();
    const userEventObj = buildEventObject(userEventSnapshot);
    const promises = userEventObj.map((event) => modifyEvent(event));
    const finalEvents = await Promise.all(promises);
    return finalEvents;
  } catch (err) {
    logger.error("Error in updating task", err);
    throw err;
  }
};

const getUserEvents = async (username) => {
  try {
    const userId = await getUserId(username);
    const userEventSnapshot = await eventModel.where("user", "==", userId).get();
    const userEventObj = buildEventObject(userEventSnapshot);
    const promises = userEventObj.map((event) => modifyEvent(event));
    const finalEvents = await Promise.all(promises);
    return finalEvents;
  } catch (err) {
    logger.error("Error in updating task", err);
    throw err;
  }
};

module.exports = {
  createNewEvent,
  getAllEvents,
  getAllTaskEvents,
  getAllUserEvents,
  getUserEvents,
};
