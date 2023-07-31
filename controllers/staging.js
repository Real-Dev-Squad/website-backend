const { addOrUpdate } = require("../models/users");

const updateRoles = async (req, res) => {
  try {
    const userData = await req.userData;
    if (process.env.NODE_ENV !== "production") {
      return res.status(403).json({
        message: "FORBIDDEN | To be used only in staging and development",
      });
    }
    const userId = req.userData.id;
    await addOrUpdate(
      {
        roles: {
          ...userData.roles,
          ...req.body,
        },
      },
      userId
    );
    return res.status(200).json({
      message: "Roles Updated successfully",
    });
  } catch (err) {
    logger.error(`Oops an error occured: ${err}`);
    return res.status(500).json({
      message: "Oops an internal error occured",
    });
  }
};

module.exports = {
  updateRoles,
};
