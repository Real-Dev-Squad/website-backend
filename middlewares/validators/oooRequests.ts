import joi from "joi";
import { NextFunction } from "express";
import { REQUEST_STATE, REQUEST_TYPE } from "../../constants/requests";
import { OooRequestCreateRequest, OooRequestResponse } from "../../types/oooRequest";

export const createOooStatusRequestValidator = async (
  req: OooRequestCreateRequest,
  res: OooRequestResponse,
  next: NextFunction
) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      from: joi
        .number()
        .min(Date.now())
        .messages({
          "number.min": "from date must be greater than or equal to Today's date",
        })
        .required(),
      until: joi
        .number()
        .min(joi.ref("from"))
        .messages({
          "number.min": "until date must be greater than or equal to from date",
        })
        .required(),
      reason: joi.string().required().messages({
        "any.required": "reason is required",
        "string.empty": "reason cannot be empty",
      }),
      type: joi.string().valid(REQUEST_TYPE.OOO).required().messages({
        "string.empty": "type cannot be empty",
        "any.required": "type is required",
      }),
      status: joi.string().valid(REQUEST_STATE.PENDING).required().messages({
        "string.empty": "status cannot be empty",
        "any.required": "status is required",
      }),
    });

  await schema.validateAsync(req.body, { abortEarly: false });
};
