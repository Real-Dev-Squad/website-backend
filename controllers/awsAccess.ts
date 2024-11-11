import { PROFILE_SVC_GITHUB_URL } from "../constants/urls";
import {addUserToGroup, createUser, fetchAwsUserIdByUsername} from "../utils/awsFunctions";
const dataAccess = require("../services/dataAccessLayer");
const userDataLevels = require('../constants/userDataLevels');

export const addUserToAWSGroup = async (req, res) => {
    const { groupId, userId } = req.body;

    try {
      const userInfoData = await dataAccess.retrieveUsers({ discordId: userId, level: userDataLevels.ACCESS_LEVEL.INTERNAL, role: 'cloudfare_worker'});
      if (!userInfoData.userExists) {
        return res.status(400).json({ error: "User not found" });
      } else if(!userInfoData.user.email) {
        return res.status(400).json({ error: `User email is required to create an AWS user. Please update your email by setting up Profile service, url : ${PROFILE_SVC_GITHUB_URL}` });
      }
      
      let awsUserId = await fetchAwsUserIdByUsername(userInfoData.user.username);
      
      let userCreationResponse = null;
      
      if (awsUserId === null){
        // We need to create the user in AWS before and then fetch its Id
        userCreationResponse = await createUser(userInfoData.user.username, userInfoData.user.email);
        awsUserId = userCreationResponse.UserId;
      }

      let userAdditionResponse = await addUserToGroup(groupId, awsUserId)

      if (userAdditionResponse.conflict){
        return res.status(200).json({
          message: `User ${userId} is already part of the AWS group, please try signing in.`
        })
      }

      if (userAdditionResponse)
        return res.status(200).json({
          message: `User ${userId} successfully added to group ${groupId}.`
        });
    } catch (error) {
      logger.error(`Error in adding user - ${userId} to AWS group - ${groupId} error - ${error}`);
        return res.status(500).json({
          error: `Something went wrong, please try again`
        });
    }
};
