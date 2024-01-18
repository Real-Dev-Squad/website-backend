import firestore from "../utils/firestore";
import { InviteBody, Invite } from "../types/invites";
const inviteModel = firestore.collection("invite");

export const createInviteLinkModel = async (body: InviteBody) => {
  try {
    const { userId, purpose, inviteLink } = body;
    const existingInvite = await inviteModel.where("userId", "==", userId).get();
    if (!existingInvite.empty) {
      return {
        error: "Invite link already exists",
      };
    }

    const invite: Invite = {
      userId,
      purpose,
      inviteLink,
      createdAt: Date.now(),
    };
    const doc = await inviteModel.add(invite);

    return {
      id: doc.id,
      ...invite,
    };
  } catch (error) {
    logger.error("Error creating invite link", error);
    throw error;
  }
};

export const getInviteLinkModel = async (userId: string) => {
  try {
    const invite = await inviteModel.where("userId", "==", userId).get();
    if (invite.empty) {
      return {
        error: "Invite link not found",
      };
    }
    const inviteLink = invite.docs[0].data();
    return inviteLink;
  } catch (error) {
    logger.error("Error getting invite link", error);
    throw error;
  }
};
