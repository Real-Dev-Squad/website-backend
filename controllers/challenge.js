const challengeQuery = require("../models/challenges");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

/**
 * Get the challenges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const fetchChallenges = async (req, res) => {
  try {
    const allChallenges = await challengeQuery.fetchChallenges();
    const promiseArray = await getParticipantsofChallenges(allChallenges);
    const challengesWithParticipants = await Promise.all(promiseArray);
    return res.json({
      message: challengesWithParticipants.length ? "Challenges returned successfully!" : "No Challenges found",
      challenges: challengesWithParticipants,
    });
  } catch (err) {
    logger.error(`Error while retrieving challenges ${err}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

/**
 * Add a challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const createChallenge = async (req, res) => {
  try {
    const challengeAdded = await challengeQuery.postChallenge(req.body);
    if (challengeAdded) {
      return res.json({
        message: "Challenge added successfully",
      });
    } else {
      return res.boom.badRequest("Unable to add challenge");
    }
  } catch (err) {
    logger.error(`Error while adding challenge ${err}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

/**
 * @param {Array} allChallenges
 * @returns {Promise<participants|Array>}
 */
const getParticipantsofChallenges = async (allChallenges) => {
  return allChallenges.map(async (challenge) => {
    const participants = await challengeQuery.fetchParticipantsData(challenge.participants);
    return {
      ...challenge,
      participants,
    };
  });
};

/**
 * Suscribe user to a challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const subscribeToChallenge = async (req, res) => {
  try {
    const { user_id: userId, challenge_id: challengeId } = req.body;
    const subscribeUser = await challengeQuery.subscribeUserToChallenge(userId, challengeId);
    if (subscribeUser) {
      return res.status(200).json({
        challenge_id: challengeId,
        is_user_subscribed: 1,
      });
    } else {
      return res.boom.notFound("User cannot be subscribed to challenge");
    }
  } catch (err) {
    logger.error(`Error while retrieving challenges ${err}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  fetchChallenges,
  createChallenge,
  subscribeToChallenge,
};
