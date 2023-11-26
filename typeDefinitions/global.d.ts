import { Request, Response } from "express";
import { Boom } from "express-boom";

export type CustomResponse = Response & Boom;

