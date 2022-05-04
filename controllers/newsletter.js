const newsletters = require("../models/newsletter");

const ERROR_MESSAGE = "Something went wrong. Please try again or contact admin";

const addEmail = async (req, res) => {
  try {
    const response = await newsletters.subscribe(req.body);
    return res.json({
      message: "gotcha",
      response: response,
    });
  } catch (err) {
    logger.error("Logging error from addEmail controllers");
    return res.boom.badImplementation(ERROR_MESSAGE);
  }
};

const getMailingList = async (req, res) => {
  try {
    const list = await newsletters.getMailingList();
    return res.json({
      message: "here is your list",
      response: list,
    });
  } catch (err) {
    logger.error("Logging error from getMailingList controllers");
    return res.boom.badImplementation(ERROR_MESSAGE);
  }
};

const removeEmail = async (req, res) => {
  try {
    const response = await newsletters.unsubscribe(req.body);
    return res.json({
      message: "done",
      response: response,
    });
  } catch (err) {
    logger.error("Logging error from removeEmail controllers");
    return res.boom.badImplementation(ERROR_MESSAGE);
  }
};

module.exports = {
  addEmail,
  getMailingList,
  removeEmail,
};
