const firestore = require("../utils/firestore");
const qrAuthModel = firestore.collection("QrCodeAuth");

const updateStatus = async (userId, authStatus = "NOT_INIT") => {
  try {
    const authData = await qrAuthModel.doc(userId).get();

    if (!authData.data()) {
      return {
        userExists: false,
      };
    }

    await qrAuthModel.doc(userId).set({
      ...authData.data(),
      authorization_status: authStatus,
    });

    return {
      userExists: true,
      data: {
        ...authData.data(),
        authorization_status: authStatus,
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
