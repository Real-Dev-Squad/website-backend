import { Request, Response, NextFunction } from "express";
import { Boom } from "express-boom";

export type InviteBody = {
  inviteLink?: string;
  userId: string;
  purpose: string;
};

export type Invite = {
  id?: string;
  userId: string;
  purpose: string;
  inviteLink: string;
  createdAt?: number;
};
export type InviteBodyRequest = Request & { InviteBody };
