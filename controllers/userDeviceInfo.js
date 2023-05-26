const UserDeviceInfoModel = require("../models/userDeviceInfo");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

const storeUserDeviceInfo = async (req, res) => {
  try {
    const userJson = {
      user_id: req.body.user_id,
      device_info: req.body.device_info,
    };

    const userInfo = await UserDeviceInfoModel.storeUserDeviceInfo(userJson);

    return res.json({
      ...userInfo,
      message: "User Device Info added successfully!",
    });
  } catch (err) {
    logger.error(`Error while storing user device info : ${err}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  storeUserDeviceInfo,
};
