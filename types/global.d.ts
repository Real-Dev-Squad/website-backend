import { Request, Response, NextFunction } from "express";
import { Boom } from "express-boom";

export type userData = {
  id: string;
  profileURL: string;
  discordJoinedAt: string;
  roles: {
    archived: boolean;
    in_discord?: boolean;
    member?: boolean;
    maven?: boolean;
    designer?: boolean;
    product_manager?: boolean;
    super_user?: boolean;
  };
  profileStatus: string;
  created_at: number;
  yoe: number;
  github_created_at: number;
  company: string;
  twitter_id: string;
  first_name: string;
  incompleteUserDetails: boolean;
  discordId: string;
  last_name: string;
  linkedin_id: string;
  picture?: {
    url?: string;
    publicId?: string;
  };
  instagram_id: string;
  github_display_name: string;
  github_id: string;
  designation: string;
  status: string;
  username: string;
  updated_at: number;
  isSubscribed: boolean;
  phone: string | null;
  email: string;
};

export type CustomResponse = Response & { boom: Boom };
export type CustomRequest = Request & { userData };
