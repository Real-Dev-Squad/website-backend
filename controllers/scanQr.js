const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const { fetchUserDeviceInfo } = require("../models/scanQr");

/**
 * Fetch the user device info data if user has scanned qr
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const isQrScanned = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const userDeviceInfoData = await fetchUserDeviceInfo(userId);
    return res.json(userDeviceInfoData);
  } catch (error) {
    logger.error(`Error while fetching user device info data: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  isQrScanned,
};
