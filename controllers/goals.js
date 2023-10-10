const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const goals = require("../services/goalService");

const getGoalSiteToken = async (req, res) => {
  try {
    const { roles, id: userId } = req.userData;
    const body = JSON.stringify({
      data: {
        type: "User",
        attributes: {
          rds_id: userId,
          roles: roles,
        },
      },
    });
    const goalApiResponse = await goals.getOrCreateGoalUser({ body });

    if (goalApiResponse.status === 201) {
      let goalApiData = await goalApiResponse.json();
      goalApiData = goalApiData.data;
      const userData = goalApiData.attributes;
      return res.status(200).json({ message: "success", user: { ...userData, id: goalApiData.id } });
    }
    return res.status(goalApiResponse.status).json({ message: "error" });
  } catch {
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  getGoalSiteToken,
};
