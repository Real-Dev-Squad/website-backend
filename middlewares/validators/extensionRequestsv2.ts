import joi from "joi";
import { NextFunction } from "express";
import { ExtensionRequestRequest, ExtensionRequestResponse } from "../../types/extensionRequests.js";
import { REQUEST_TYPE,REQUEST_STATE } from "../../constants/requests.js";

export const createExtensionRequestValidator = async (
  req: ExtensionRequestRequest,
  res: ExtensionRequestResponse,
  next: NextFunction
) => {

  const schema = joi
    .object()
    .strict()
    .keys({
      taskId: joi.string().required().messages({
        "string.empty": "taskId cannot be empty",
        "any.required": "taskId is required",
      }),
      title: joi.string().required().messages({
        "string.empty": "title cannot be empty",
        "any.required": "title is required",
      }),
      oldEndsOn: joi.number().required().messages({
        "number.base": "oldEndsOn must be a number",
        "any.required": "oldEndsOn is required",
      }),
      newEndsOn: joi.number().required().min(joi.ref("oldEndsOn")).messages({
        "number.base": "newEndsOn must be a number",
        "any.required": "newEndsOn is required",
      }),
      message: joi.string().required().messages({
        "string.empty": "message cannot be empty",
      }),
      state: joi.string().valid(REQUEST_STATE.PENDING).required().messages({
        "string.empty": "state cannot be empty",
        "any.required": "state is required",
      }),
      type: joi.string().valid(REQUEST_TYPE.EXTENSION).required().messages({
        "string.empty": "type cannot be empty",
        "any.required": "type is required",
      }),
    });

  await schema.validateAsync(req.body, { abortEarly: false });
};
