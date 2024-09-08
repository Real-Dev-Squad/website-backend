import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../../types/global";
import Joi from 'joi';

export const validateSubscribe = (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const subscribeSchema = Joi.object({
    phoneNumber: Joi.string().required(),
    email: Joi.string().required()
  });
  const { error } = subscribeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
