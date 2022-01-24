const userQuery = require("../models/users");
const fetchLog = require("../models/logs");

//filter as a query parameter

const getLogs = async (req, res) => {
  try {
    const obj = {
      username = "",
      type: "",
      timestamp: "",
      payload: "",
    };

    obj.username = req.query.username;
    obj.type = req.query.type;
    obj.timestamp = req.query.timestamp;
    obj.payload = req.query.payload;

    const allLogs = await fetchLog(obj)

    if (allLogs) {
      return res.json({ allLogs});
    }

    return res.boom.notFound("User doesn't exist");
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

module.exports = {
  getLogs,
};
