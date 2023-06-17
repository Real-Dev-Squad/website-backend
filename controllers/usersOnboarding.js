const { fetchUser } = require("../models/users");
const { getAllUserStatus } = require("../models/userStatus");
const { userState } = require("../constants/userStatus");
const { filterUsersWithOnboardingState } = require("../utils/userStatus");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

/**
 * Collects all Users with ONBOARDING state and are present in discord server for more than 31 days
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getUsersWithOnboardingState = async (req, res) => {
  try {
    const { allUserStatus } = await getAllUserStatus({});

    if (!allUserStatus.length) {
      return res.boom.notFound("User status not found");
    }

    const allUsersWithOnboardingState = filterUsersWithOnboardingState(allUserStatus);

    if (!allUsersWithOnboardingState.length) {
      return res.boom.notFound("User doesn't exist with onboarding state");
    }

    const updatedOnboardingUsersWithDate = [];

    for (const user of allUsersWithOnboardingState) {
      const result = await fetchUser({ userId: user.userId });

      if (result.user.discordJoinedAt) {
        const userDiscordJoinedDate = new Date(result.user.discordJoinedAt);

        const currentDate = new Date();

        const timeDifferenceInMilliseconds = currentDate.getTime() - userDiscordJoinedDate.getTime();

        const daysDifferenceInInteger = Math.floor(timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24));

        if (daysDifferenceInInteger > 31) {
          updatedOnboardingUsersWithDate.push({ ...result.user, currentStatus: userState.ONBOARDING });
        }
      }
    }

    if (!updatedOnboardingUsersWithDate.length) {
      return res.boom.notFound(
        "Users with an onboarding state of more than 31 days do not exist or user has missing discordJoinedDate"
      );
    }

    return res.json({
      message: "All User found successfully.",
      totalUsers: updatedOnboardingUsersWithDate.length,
      allUser: updatedOnboardingUsersWithDate,
    });
  } catch (err) {
    logger.error(`Error while fetching all the User: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = { getUsersWithOnboardingState };
