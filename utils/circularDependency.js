const { fetchUsers } = require("../models/users");
const { getGithubCreatedAt } = require("../services/githubService");

const githubModalCircularDependency = async (users) => {
  const usersData = await fetchUsers(users);
  const usersGithubCreatedAt = await Promise.all(
    usersData.users.map(async (user) => {
      const githubCreatedAt = await getGithubCreatedAt(user.github_id);
      return {
        id: user.id,
        github_created_at: githubCreatedAt,
      };
    })
  );
  return usersGithubCreatedAt;
};

module.exports = {
  githubModalCircularDependency,
};
