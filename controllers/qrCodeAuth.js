const qrAuthQuery = require("../models/qrCodeAuth");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

const updateAuthStatus = async (req, res) => {
  try {
    const userId = req.userData.id;
    const authStatus = req.params.authorization_status;
    const result = await qrAuthQuery.updateStatus(userId, authStatus);

    if (!result.userExists) {
      return res.boom.notFound("Document not found!");
    }

    return res.json({
      message: `Authentication document for user ${userId} updated successfully`,
      data: { ...result.data },
    });
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  updateAuthStatus,
};
