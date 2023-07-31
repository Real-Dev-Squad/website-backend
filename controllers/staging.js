const { addOrUpdate } = require("../models/users");

const updateRoles = async (req, res) => {
  try {
    const userData = await req.userData;
    if (process.env.NODE_ENV !== "staging" || process.env.NODE_ENV !== "development") {
      return res.status(403).json({
        message: "FORBIDDEN | To be used only in staging and development",
      });
    }
    const userId = req.userData.id;
    if (req.body.super_user) {
      await addOrUpdate(
        {
          roles: {
            ...userData.roles,
            super_user: req.body.super_user,
          },
        },
        userId
      );
    } else if (req.body.member) {
      await addOrUpdate(
        {
          roles: {
            ...userData.roles,
            member: req.body.member,
          },
        },
        userId
      );
    }
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
