const logger = require("../../utils/logger");
const Firestore = require("@google-cloud/firestore");

const firestore = require("../../utils/firestore");
const challengesModel = firestore.collection("/challenges");
const userModel = firestore.collection("/users");

const errorMessages = `user cannot be suscribed to challenge`;
const userDoesNotExistError = `User does not exist. Please register to participate`;

async function subscribeUserToChallenge(userId, challengeId) {
  try {
    let user = "";
    const getUser = await userModel.doc(userId).get();
    user = getUser._fieldsProto.github_display_name.stringValue;
    if (user) {
      const challengeRef = await challengesModel.doc(challengeId);
      const updatedChallenge = await challengeRef.update({ participants: Firestore.FieldValue.arrayUnion({ name: user }) });
      return challengeRef.get()
    } else {
      throw new Error(userDoesNotExistError);
    }
  } catch (err) {
    logger.error(errorMessages, err);
    throw err;
  }
}

module.exports = {
  subscribeUserToChallenge,
};
