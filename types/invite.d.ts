import { Boom } from "express-boom";

export type InviteBody = {
  uniqueUserId: string;
  reason: string;
  createdAt?: Date;
};

export type Invite = {
  id: string;
  uniqueUserId: string;
  reason: string;
  inviteLink: string;
  createdAt?: number;
};
export type InviteResponse = Response & { boom: Boom };
export type InviteBodyRequest = Request & { InviteBody: InviteBody };
