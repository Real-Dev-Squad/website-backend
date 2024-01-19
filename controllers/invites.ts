import { addInviteToInviteModel, getUserDiscordInvite } from "../models/discordactions";
import { InviteBodyRequest } from "../types/invites";
import {CustomResponse} from "../types/global";
import { addLog } from "../models/logs";
import { generateDiscordInviteLink } from "../utils/discord-actions";
const { logType } = require("../constants/logs");

export const createInviteLink = async (req: InviteBodyRequest, res: CustomResponse) => {
  try {
    const { userId, purpose } = req.body;

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
      type: logType.DISCORD_INVITES,
      meta: {
        action: "create",
        createdBy: logType.EXTERNAL_SERVICE,
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

export const getInviteLink = async (req: InviteBodyRequest, res: CustomResponse) => {
  try {
    const { userId } = req.params;

    const invite = await getUserDiscordInvite(userId);

    if (invite.notFound) {
      return res.boom.badRequest("Invite link not found");
    }
    delete invite["notFound"];
    return res.json({
      message: "Invite link fetched successfully",
      data: {
        ...invite,
      },
    });
  } catch (error) {
    logger.error("Error while getting invite link", error);
    return res.boom.internal(error);
  }
};
