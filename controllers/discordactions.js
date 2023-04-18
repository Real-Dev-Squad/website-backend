const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

/**
 * Creates a role
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const createRole = async (req, res) => {
  try {
    const postData = {
      rolename: req.newrole,
      permissions: req.permissions,
    };
    const BASE_URL = "dummy";
    // Make a POST request to ServerB
    const res = await fetch(`${BASE_URL}/create-guild-role`, {
      method: "POST",
      body: JSON.stringify(postData),
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.json());
    return res.json({
      message: "Role created successfully!",
      res,
    });
  } catch (err) {
    logger.error(`Error while creating new level: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  createRole,
};
