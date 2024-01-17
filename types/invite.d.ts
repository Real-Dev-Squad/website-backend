import { Boom } from "express-boom";

export type InviteBody = {
  uniqueUserId: string;
  purpose: string;
  createdAt?: Date;
};

export type Invite = {
  id: string;
  uniqueUserId: string;
  purpose: string;
  inviteLink: string;
  createdAt?: number;
};
export type InviteResponse = Response & { boom: Boom };
export type InviteBodyRequest = Request & { InviteBody: InviteBody };
