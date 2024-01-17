import { Request, Response, NextFunction } from "express";
import { Boom } from "express-boom";

export type InviteBody = {
  inviteLink?: string;
  uniqueUserId: string;
  purpose: string;
};

export type Invite = {
  id?: string;
  uniqueUserId: string;
  purpose: string;
  inviteLink: string;
  createdAt?: number;
};
export type InviteResponse = Response & { boom: Boom };
export type InviteBodyRequest = Request & { InviteBody };
