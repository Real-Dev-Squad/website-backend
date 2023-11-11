const config = require("config");

const getOrCreateGoalUser = async ({ userId, roles }) => {
  const body = JSON.stringify({
    data: {
      type: "User",
      attributes: {
        rds_id: userId,
        roles: roles,
      },
    },
  });
  const goalSiteConfig = config.services.goalAPI;
  return fetch(`${goalSiteConfig.baseUrl}/api/v1/user/`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/vnd.api+json", "Rest-Key": goalSiteConfig.secretKey },
  });
};
module.exports = { getOrCreateGoalUser };
