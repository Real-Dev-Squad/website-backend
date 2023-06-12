const validateVerificationQuery = async (req, res, next) => {
  const { type: imageType } = req.query;
  try {
    if (!(imageType === "profile" || imageType === "discord")) {
      throw new Error("Invalid verification type was provided!");
    }
    next();
  } catch (error) {
    logger.error(`Error validating createLevel payload : ${error}`);
    res.boom.badRequest(error.message);
  }
};

module.exports = {
  validateVerificationQuery,
};
