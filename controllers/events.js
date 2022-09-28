const event = require("../models/events");
const { firestore } = require("firebase-admin");

const addNewEvent = async (req, res) => {
  try {
    const { id: user } = req.userData;
    const eventData = {
      ...req.body,
      user,
      createdAt: firestore.Timestamp.now(),
    };

    await event.createNewEvent(eventData);
    return res.json({ message: "event created successfully" });
  } catch {
    return res.boom.badImplementation("An internal server error occurred");
  }
};
const getAllEvents = async (req, res) => {
  try {
    const allEvents = await event.getAllEvents();
    return res.json({
      message: "Events returned successfully!",
      events: allEvents.length > 0 ? allEvents : [],
    });
  } catch (err) {
    return res.boom.badImplementation("An internal server error occurred");
  }
};

const getAllTaskEvents = async (req, res) => {
  try {
    const allTaskEvents = await event.getAllTaskEvents();
    return res.json({
      message: "Task events returned successfully",
      events: allTaskEvents.length > 0 ? allTaskEvents : [],
    });
  } catch {
    return res.boom.badImplementation("An internal server error occurred");
  }
};

const getAllUserEvents = async (req, res) => {
  try {
    const allUserEvents = await event.getAllUserEvents();
    return res.json({
      message: "User events returned successfully",
      events: allUserEvents.length > 0 ? allUserEvents : [],
    });
  } catch {
    return res.boom.badImplementation("An internal server error occurred");
  }
};

const getUserEvents = async (req, res) => {
  try {
    const username = req.params.username;
    const userEvents = await event.getUserEvents(username);
    return res.json({
      message: "User events returned successfully",
      events: userEvents.length > 0 ? userEvents : [],
    });
  } catch {
    return res.boom.badImplementation("An internal server error occured");
  }
};
module.exports = {
  addNewEvent,
  getAllEvents,
  getAllTaskEvents,
  getAllUserEvents,
  getUserEvents,
};
