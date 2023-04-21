const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const config = require("config");
const jwt = require("jsonwebtoken");
/**
 * Creates a role
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const createRole = async (req, res) => {
  try {
    const postData = {
      rolename: `group-${req.body.rolename}`,
      mentionable: true,
    };
    const authToken = jwt.sign({}, config.get("botToken.botPrivateKey"), {
      algorithm: "RS256",
      expiresIn: config.get("userToken.ttl"),
    });
    const BASE_URL = "CLOUDFLARE_WORKERS_URLS";
    const responseForCreatedRole = await fetch(`${BASE_URL}/create-guild-role`, {
      method: "PUT",
      body: JSON.stringify(postData),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    }).then((response) => response.json());
    return res.json({
      message: "Role created successfully!",
      responseForCreatedRole,
    });
  } catch (err) {
    logger.error(`Error while creating new Role: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  createRole,
};
