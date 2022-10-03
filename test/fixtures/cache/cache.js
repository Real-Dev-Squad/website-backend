const tasksList = require("../tasks/tasks");

const DEFAULT_EXPIRY_TIME_MIN = 2

// Returns a dummy sample value to be stored in cache
const getDummyResponse = (expiryTime = DEFAULT_EXPIRY_TIME_MIN) => {
  const apiResponse = { message: "Tasks returned successfully!", tasks: tasksList() };
  const stringifiedResponse = JSON.stringify(apiResponse);

  return {
    expiry: new Date().getTime() + expiryTime * 60000,
    priority: 1,
    response: stringifiedResponse,
    size: Buffer.byteLength(stringifiedResponse),
  };
};

module.exports = { getDummyResponse };
