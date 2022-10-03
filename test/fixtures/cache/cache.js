const tasksList = require("../tasks/tasks");

// Returns a dummy sample value to be stored in cache
const getDummyResponse = (expiryTime = 2) => {
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
