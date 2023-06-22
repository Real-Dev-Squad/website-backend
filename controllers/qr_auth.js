const qrAuthQuery = require("../models/qr_auth");

const updateAuthStatus = async (req, res) => {
  try {
    const userId = req.userData.id;
    const authStatus = req.params.authorization_status ? req.params.authorization_status : "NOT_INIT";
    const result = await qrAuthQuery.updateStatus(userId, authStatus);

    if (result.userExists) {
      return res.json({
        message: "Updated successfully!",
        ...result.data,
      });
    }

    return res.boom.notFound("Document not found!");
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  updateAuthStatus,
};
