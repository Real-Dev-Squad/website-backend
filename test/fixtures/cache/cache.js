const tasksList = require("../tasks/tasks");

const EXPIRY_TIME_IN_MIN = 2;
const INVALID_KEY = "keyNotPresentInCache";

// Returns a dummy sample value to be stored in cache
const getDummyResponse = (expiryTime = EXPIRY_TIME_IN_MIN) => {
  const apiResponse = { message: "Tasks returned successfully!", tasks: tasksList() };
  const stringifiedResponse = JSON.stringify(apiResponse);

  return {
    expiry: new Date().getTime() + expiryTime * 60000,
    priority: 1,
    response: stringifiedResponse,
    size: Buffer.byteLength(stringifiedResponse),
  };
};

module.exports = { getDummyResponse, INVALID_KEY };
