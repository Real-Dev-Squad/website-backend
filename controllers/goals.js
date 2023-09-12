const config = require("config");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

const getGoalSiteToken = async (req, res) => {
  try {
    const { roles, id: userId } = req.userData;
    const goalSiteConfig = config.services.goalAPI;
    const goalApiResponse = await fetch(`${goalSiteConfig.baseUrl}/api/v1/user/`, {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "User",
          attributes: {
            rds_id: userId,
            roles: roles,
          },
        },
      }),
      headers: { "Content-Type": "application/vnd.api+json", "Rest-Key": goalSiteConfig.secretKey },
    });

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
