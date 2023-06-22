const firestore = require("../utils/firestore");
const qrAuthModel = firestore.collection("Qr_auth");

const updateStatus = async (userId, auth_status = "NOT_INIT") => {
  try {
    const authData = await qrAuthModel.doc(userId).get();

    if (!authData) {
      return {
        userExists: false,
      };
    }

    await qrAuthModel.doc(userId).set({
      ...authData.data(),
      auth_status,
    });

    return {
      userExists: true,
      data: {
        ...authData.data(),
        auth_status,
      },
    };
  } catch (err) {
    logger.error("Error in updating auth status", err);
    throw err;
  }
};

module.exports = {
  updateStatus,
};
