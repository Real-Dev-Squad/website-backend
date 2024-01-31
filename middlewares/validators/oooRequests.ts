import joi from "joi";
import { NextFunction } from "express";
import { REQUEST_STATE, REQUEST_TYPE } from "../../constants/request";
import { OooStatusRequestRequest, OooStatusRequestResponse } from "../../types/oooStatusRequest";

export const createOooStatusRequestValidator = async (
  req: OooStatusRequestRequest,
  res: OooStatusRequestResponse,
  next: NextFunction
) => {
  const requestedUserId = req.userData.id;

  const schema = joi
    .object()
    .strict()
    .keys({
      userId: joi.string().required().valid(requestedUserId).messages({
        "any.required": "userId is required",
        "string.empty": "userId cannot be empty",
        "any.only": "User must be the same as the logged in user",
      }),
      from: joi
        .number()
        .min(Date.now())
        .messages({
          "number.min": "from date must be greater than or equal to current date",
        })
        .required(),
      until: joi
        .number()
        .min(joi.ref("from"))
        .messages({
          "number.min": "until date must be greater than or equal to from date",
        })
        .required(),
      message: joi.string().required().messages({
        "any.required": "message is required",
        "string.empty": "message cannot be empty",
      }),
      state: joi.string().valid(REQUEST_STATE.PENDING).required().messages({
        "any.only": "state must be PENDING",
      }),
      type: joi.string().valid(REQUEST_TYPE.OOO).required(),
    });

  await schema.validateAsync(req.body, { abortEarly: false });
};
