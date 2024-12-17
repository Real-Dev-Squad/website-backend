import joi from "joi";
import { NextFunction } from "express";
import { REQUEST_STATE, REQUEST_TYPE } from "../../constants/requests";
import { OooRequestCreateRequest, OooRequestResponse } from "../../types/oooRequest";
import { createOooStatusRequestValidator } from "./oooRequests";
import { createExtensionRequestValidator } from "./extensionRequestsv2";
import {createTaskRequestValidator} from "./taskRequests";
import { ExtensionRequestRequest, ExtensionRequestResponse } from "../../types/extensionRequests";
import { CustomResponse } from "../../typeDefinitions/global";
import { UpdateRequest } from "../../types/requests";
import { TaskRequestRequest, TaskRequestResponse } from "../../types/taskRequests";
import { createOnboardingExtensionRequestValidator } from "./onboardingExtensionRequest";
import { OnboardingExtensionCreateRequest, OnboardingExtensionResponse } from "../../types/onboardingExtension";

export const createRequestsMiddleware = async (
  req: OooRequestCreateRequest|ExtensionRequestRequest | TaskRequestRequest | OnboardingExtensionCreateRequest,
  res: CustomResponse,
  next: NextFunction
) => {
  const type = req.body.type;

  try {
    switch (type) {
      case REQUEST_TYPE.OOO:
        await createOooStatusRequestValidator(req as OooRequestCreateRequest, res as OooRequestResponse, next);
        break;
      case REQUEST_TYPE.EXTENSION:
        await createExtensionRequestValidator(req as ExtensionRequestRequest, res as ExtensionRequestResponse, next);
        break;
      case REQUEST_TYPE.TASK:
        await createTaskRequestValidator(req as TaskRequestRequest, res as TaskRequestResponse, next);
        break;
      case REQUEST_TYPE.ONBOARDING:
        await createOnboardingExtensionRequestValidator(req as OnboardingExtensionCreateRequest, res as OnboardingExtensionResponse, next);
        break;
      default:
        res.boom.badRequest(`Invalid request type: ${type}`);
    }

    next();
  } catch (error) {
    const errorMessages = error.details.map((detail:any) => detail.message);
    logger.error(`Error while validating request payload : ${errorMessages}`);
    res.boom.badRequest(errorMessages);
  }
};

export const updateRequestsMiddleware = async (
  req: UpdateRequest,
  res: CustomResponse,
  next: NextFunction
) => {
  const schema = joi
  .object()
  .strict()
  .keys({
    reason: joi.string().optional()
      .messages({
        "string.empty": "reason cannot be empty",
      }),
    state: joi
      .string()
      .valid(REQUEST_STATE.APPROVED, REQUEST_STATE.REJECTED)
      .required()
      .messages({
        "any.only": "state must be APPROVED or REJECTED",
      }),
    type: joi.string().valid(REQUEST_TYPE.OOO, REQUEST_TYPE.EXTENSION).required(),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessages = error.details.map((detail:any) => detail.message);
    logger.error(`Error while validating request payload : ${errorMessages}`);
    res.boom.badRequest(errorMessages);
  }
};

export const getRequestsMiddleware = async (req: OooRequestCreateRequest, res: OooRequestResponse, next: NextFunction) => {
  const schema = joi.object().keys({
    dev: joi.bool().sensitive().optional(), // TODO: Remove this validator once feature is tested and ready to be used
    id: joi.string().optional(),
    type: joi
      .string()
      .valid(REQUEST_TYPE.OOO, REQUEST_TYPE.EXTENSION, REQUEST_TYPE.TASK, REQUEST_TYPE.ALL)
      .optional(),
    requestedBy: joi.string().insensitive().optional(),
    state: joi
      .string()
      .valid(REQUEST_STATE.APPROVED, REQUEST_STATE.PENDING, REQUEST_STATE.REJECTED)
      .optional(),
    page: joi.number().integer().min(0).when("next", {
      is: joi.exist(),
      then: joi.forbidden().messages({
        "any.only": "next is not allowed when using page",
      }),
    }).when("prev", {
      is: joi.exist(),
      then: joi.forbidden().messages({
        "any.only": "page is not allowed when using prev",
      }),
    }).optional(),
    next: joi
      .string()
      .optional(),
    prev: joi
      .string()
      .optional(),
    size: joi.number().integer().positive().min(1).max(100).optional(),
  });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    logger.error(`Error while validating request query : ${errorMessages}`);
    res.boom.badRequest(errorMessages);
  }
};
