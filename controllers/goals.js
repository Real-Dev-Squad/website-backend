const config = require("config");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

const getGoalSiteToken = async (req, res) => {
  try {
    const { roles, id: userId } = req.userData;
    const goalSiteConfig = config.services.goalAPI;

    const goalApiResponse = await fetch(`${goalSiteConfig.baseUrl}/auth_token`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        roles,
        goal_api_secret_key: goalSiteConfig.secretKey,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const goalApiData = await goalApiResponse.json();

    if (goalApiResponse.status === 200) {
      const goalApiToken = goalApiData.token ?? "";
      const goalApiTokenExpiry = goalApiData.token_expiry;
      const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl"));

      res.cookie(goalSiteConfig.cookieName, goalApiToken, {
        domain: rdsUiUrl.hostname,
        expires: new Date(Date.now() + goalApiTokenExpiry),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });

      return res.status(200);
    }
    return res.status(400);
  } catch {
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  getGoalSiteToken,
};
