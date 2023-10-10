const config = require("config");

const getOrCreateGoalUser = async ({ body }) => {
  const goalSiteConfig = config.services.goalAPI;
  return fetch(`${goalSiteConfig.baseUrl}/api/v1/user/`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/vnd.api+json", "Rest-Key": goalSiteConfig.secretKey },
  });
};
module.exports = { getOrCreateGoalUser };
