const userQuery = require("../models/users");
const { getPaginationLink } = require("../utils/users");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

const retrieveUsers = async (req, res) => {
  try {
    const { allUsers, nextId, prevId } = await userQuery.fetchPaginatedUsers(req.query);
    allUsers.forEach((element) => {
      delete element.phone;
      delete element.email;
      delete element.chaincode;
      delete element.tokens;
    });
    return res.json({
      message: "Users returned successfully!",
      users: allUsers,
      links: {
        next: nextId ? getPaginationLink(req.query, "next", nextId) : "",
        prev: prevId ? getPaginationLink(req.query, "prev", prevId) : "",
      },
    });
  } catch (error) {
    logger.error(`Error while fetching all users: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  retrieveUsers,
};
