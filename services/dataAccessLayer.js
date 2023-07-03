const userQuery = require("../models/users");
const { getPaginationLink } = require("../utils/users");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const { getQualifiers } = require("../utils/helper");
const { getUsernamesFromPRs } = require("../utils/users");
const { getFilteredPRsOrIssues } = require("../utils/pullRequests");

const retrieveUsers = async (req, res) => {
  try {
    // getting user details by id if present.
    const query = req.query?.query ?? "";
    const qualifiers = getQualifiers(query);

    // getting user details by id if present.
    if (req.query.id) {
      const id = req.query.id;
      let result;
      try {
        result = await userQuery.fetchUser({ userId: id });
      } catch (error) {
        logger.error(`Error while fetching user: ${error}`);
        return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
      }

      if (!result.userExists) {
        return res.boom.notFound("User doesn't exist");
      }

      const user = result.user;
      removeSensitiveInfo(user, ["phone", "email", "chaincode", "tokens"]);

      return res.json({
        message: "User returned successfully!",
        user,
      });
    }

    if (qualifiers?.filterBy) {
      const allPRs = await getFilteredPRsOrIssues(qualifiers);
      const usernames = getUsernamesFromPRs(allPRs);
      const { users } = await userQuery.fetchUsers(usernames);
      removeSensitiveInfo(users, ["phone", "email", "chaincode", "tokens"]);

      return res.json({
        message: "Users returned successfully!",
        users,
      });
    }

    const { allUsers, nextId, prevId } = await userQuery.fetchPaginatedUsers(req.query);
    allUsers.forEach((element) => {
      removeSensitiveInfo(element, ["phone", "email", "chaincode", "tokens"]);
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

const removeSensitiveInfo = function (obj, props) {
  for (let i = 0; i < props.length; i++) {
    if (Object.prototype.hasOwnProperty.call(obj, props[i])) {
      delete obj[props[i]];
    }
  }
};

module.exports = {
  retrieveUsers,
};
