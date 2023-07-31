const { addOrUpdate, getUsersByRole } = require("../models/users");

const updateRoles = async (req, res) => {
  try {
    const userData = await req.userData;
    if (process.env.NODE_ENV === "production") {
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

const removePrivileges = async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      message: "FORBIDDEN | To be used only in staging and development",
    });
  }
  try {
    const updateUserPromises = [];
    const members = await getUsersByRole("member");
    const superUsers = await getUsersByRole("super_user");

    members.forEach((member) => {
      updateUserPromises.push(
        addOrUpdate(
          {
            roles: {
              ...member.roles,
              member: false,
            },
          },
          member.id
        )
      );
    });
    superUsers.forEach((superUser) => {
      updateUserPromises.push(
        addOrUpdate(
          {
            roles: {
              ...superUser.roles,
              super_user: false,
            },
          },
          superUser.id
        )
      );
    });

    await Promise.all(updateUserPromises);

    return res.status(200).json({
      message: "Roles Updated successfully",
    });
  } catch (err) {
    logger.error(`Oops an error occurred: ${err}`);
    return res.status(500).json({
      message: "Oops an internal error occurred",
    });
  }
};

module.exports = {
  updateRoles,
  removePrivileges,
};
