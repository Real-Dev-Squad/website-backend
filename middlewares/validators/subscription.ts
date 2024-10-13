import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../../types/global";
import { emailRegex, phoneNumberRegex } from "../../constants/subscription-validator"; // Removed phoneNumberRegex import
import Joi from 'joi';

export const validateSubscribe = (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  
    if(req.body.email){
      req.body.email = req.body.email.trim();
    }
     if (req.body.phoneNumber) {
       req.body.phoneNumber = req.body.phoneNumber.trim();
     }
  const subscribeSchema = Joi.object({
    phoneNumber: Joi.string().allow('').optional().regex(phoneNumberRegex), 
    email: Joi.string().required().regex(emailRegex)
  });
  const { error } = subscribeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
