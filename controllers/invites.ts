import { addInviteToInviteModel, getUserDiscordInvite } from "../models/discordactions";
import { InviteResponse, InviteBodyRequest } from "../types/invites";
import { addLog } from "../models/logs";
import { generateDiscordInviteLink } from "../utils/discord-actions";
import { verifyAuthToken } from "../utils/verifyAuthToken";

export const createInviteLink = async (req: InviteBodyRequest, res: InviteResponse) => {
  try {
    const { userId, purpose } = req.body;
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      return res.boom.unauthorized();
    }
    const token = authHeader.split(" ")[1];
    const isValid = await verifyAuthToken(token);
    if (!isValid) {
      return res.boom.unauthorized();
    }

    const inviteExist = await getUserDiscordInvite(userId);
    if (!inviteExist.notFound) {
      return res.boom.badRequest("Invite link already exists");
    }

    const inviteLink = await generateDiscordInviteLink();
    if (!inviteLink) {
      return res.boom.badRequest("Error while generating invite link");
    }
    const inviteData = {
      userId,
      purpose,
      inviteLink,
      createdAt: Date.now(),
    };
    const invite = await addInviteToInviteModel(inviteData);
    if (!invite) {
      return res.boom.badRequest("Error while adding invite link to database");
    }
    const inviteLog = {
      type: "invite",
      meta: {
        action: "create",
        createdBy: userId,
        createdAt: Date.now(),
      },
      body: {
        id: invite,
        ...inviteData,
      },
    };
    await addLog(inviteLog.type, inviteLog.meta, inviteLog.body);

    return res.json({
      message: "Invite link created successfully",
      data: {
        id: invite,
        ...inviteData,
      },
    });
  } catch (error) {
    logger.error("Internal server error", error);
    return res.boom.internal(error);
  }
};

export const getInviteLink = async (req: InviteBodyRequest, res: InviteResponse) => {
  try {
    const { userId } = req.params;
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      return res.boom.unauthorized("Unauthorised");
    }
    const token = authHeader.split(" ")[1];
    const isValid = await verifyAuthToken(token);
    if (!isValid) {
      return res.boom.unauthorized();
    }
    const invite = await getUserDiscordInvite(userId);

    if (!invite) {
      return res.boom.badRequest("Error while fetching invite link");
    }
    return res.json({
      message: "Invite link fetched successfully",
      data: invite,
    });
  } catch (error) {
    logger.error("Error while getting invite link", error);
    return res.boom.internal(error);
  }
};
