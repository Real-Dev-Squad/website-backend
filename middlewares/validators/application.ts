import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../../types/global";
import { customWordCountValidator } from "../../utils/customWordCountValidator";
const joi = require("joi");
const { APPLICATION_STATUS_TYPES, APPLICATION_ROLES } = require("../../constants/application");
const { phoneNumberRegex } = require("../../constants/subscription-validator");
const logger = require("../../utils/logger");

const validateApplicationData = async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  if (req.body.socialLink?.phoneNo) {
    req.body.socialLink.phoneNo = req.body.socialLink.phoneNo.trim();
  }

  const socialLinkSchema = joi
    .object({
      phoneNo: joi.string().optional().regex(phoneNumberRegex).message('"phoneNo" must be in a valid format'),
      github: joi.string().min(1).optional(),
      instagram: joi.string().min(1).optional(),
      linkedin: joi.string().min(1).optional(),
      twitter: joi.string().min(1).optional(),
      peerlist: joi.string().min(1).optional(),
      behance: joi.string().min(1).optional(),
      dribbble: joi.string().min(1).optional(),
    })
    .optional();

  const schema = joi
    .object()
    .strict()
    .keys({
      userId: joi.string().optional(),
      firstName: joi.string().min(1).required(),
      lastName: joi.string().min(1).required(),
      college: joi.string().min(1).required(),
      skills: joi.string().min(5).required(),
      city: joi.string().min(1).required(),
      state: joi.string().min(1).required(),
      country: joi.string().min(1).required(),
      foundFrom: joi.string().min(1).required(),
      introduction: joi.string().min(1).required(),
      forFun: joi
        .string()
        .custom((value, helpers) => customWordCountValidator(value, helpers, 100))
        .required(),
      funFact: joi
        .string()
        .custom((value, helpers) => customWordCountValidator(value, helpers, 100))
        .required(),
      whyRds: joi
        .string()
        .custom((value, helpers) => customWordCountValidator(value, helpers, 100))
        .required(),
      flowState: joi.string().optional(),
      numberOfHours: joi.number().min(1).max(100).required(),
      role: joi
        .string()
        .valid(...Object.values(APPLICATION_ROLES))
        .required(),
      imageUrl: joi.string().uri().required(),
      socialLink: socialLinkSchema,
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error in validating application data: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateApplicationUpdateData = async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const schema = joi
  .object({
    status: joi
      .string()
      .valid(
        APPLICATION_STATUS_TYPES.ACCEPTED,
        APPLICATION_STATUS_TYPES.REJECTED,
        APPLICATION_STATUS_TYPES.CHANGES_REQUESTED
      )
      .required()
      .messages({
        "any.required": "Status is required",
        "any.only":
          "Status must be one of: accepted, rejected, or changes_requested",
      }),

    feedback: joi.when("status", {
      is: APPLICATION_STATUS_TYPES.CHANGES_REQUESTED,
      then: joi
        .string()
        .min(1)
        .required()
        .messages({
          "any.required":
            "Feedback is required when status is changes_requested",
          "string.min":
            "Feedback cannot be empty when status is changes_requested",
        }),
      otherwise: joi.string().optional().allow(""),
    }),
  })
  .strict();


  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error in validating recruiter data: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateApplicationQueryParam = async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const schema = joi.object().strict().keys({
    userId: joi.string().optional(),
    status: joi.string().optional(),
    size: joi.string().optional(),
    next: joi.string().optional(),
    dev: joi.string().optional(),
  });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Error validating query params : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  validateApplicationData,
  validateApplicationUpdateData,
  validateApplicationQueryParam,
};
