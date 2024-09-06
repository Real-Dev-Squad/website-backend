import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../../types/global";
const joi = require("joi");

export const validateSubscribe = (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const subscribeSchema = Joi.object({
    phoneNumber: joi.string().required(),
    email: joi.string().required()
  });
  const { error } = subscribeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
