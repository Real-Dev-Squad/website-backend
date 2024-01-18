import { createInviteLinkModel, getInviteLinkModel } from "../models/invites";
import { InviteResponse, InviteBodyRequest } from "../types/invites";
import { addLog } from "../models/logs";
import { generateDiscordInviteLink } from "../utils/discord-actions";
import { verifyAuthToken } from "../utils/verifyAuthToken";

export const createInviteLink = async (req: InviteBodyRequest, res: InviteResponse) => {
  try {
    const { userId, purpose } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.boom.unauthorized("Unauthorised");
    }
    const token = authHeader.split(" ")[1];
    const isValid = await verifyAuthToken(token);
    if (!isValid) {
      return res.boom.unauthorized();
    }
    const inviteLink = await generateDiscordInviteLink();
    if (!inviteLink) {
      return res.boom.badRequest("Invite link already exists");
    }
    const invite = await createInviteLinkModel({ userId, purpose, inviteLink });

    if (invite.error) {
      return res.boom.badRequest(invite.error);
    }
    const inviteLog = {
      type: "invite",
      meta: {
        action: "create",
        createdBy: userId,
        createdAt: Date.now(),
      },
      body: invite,
    };
    await addLog(inviteLog.type, inviteLog.meta, inviteLog.body);

    return res.json({
      message: "Invite link created successfully",
      invite,
    });
  } catch (error) {
    logger.error("Internal server error", error);
    return res.boom.internal(error);
  }
};

export const getInviteLink = async (req: InviteBodyRequest, res: InviteResponse) => {
  try {
    const { userId } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.boom.unauthorized("Unauthorised");
    }
    const token = authHeader.split(" ")[1];
    const isValid = await verifyAuthToken(token);
    if (!isValid) {
      return res.boom.unauthorized();
    }
    const invite = await getInviteLinkModel(userId);

    if (invite.error) {
      return res.boom.badRequest(invite.error);
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
