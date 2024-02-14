import joi from "joi";
import { NextFunction } from "express";
import { REQUEST_STATE, REQUEST_TYPE } from "../../constants/requests";
import { OooRequestCreateRequest, OooRequestResponse,OooRequestUpdateRequest } from "../../types/oooRequest";

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


export const updateOooStatusRequestValidator = async (
  req: OooRequestUpdateRequest,

) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      reason: joi.string().optional(),
      state: joi
        .string()
        .valid(REQUEST_STATE.APPROVED, REQUEST_STATE.REJECTED)
        .required()
        .messages({
          "any.only": "state must be APPROVED or REJECTED",
        }),
      type: joi.string().valid(REQUEST_TYPE.OOO).required(),
    });

  await schema.validateAsync(req.body, { abortEarly: false });
};
