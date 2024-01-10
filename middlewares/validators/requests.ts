import joi from "joi";
import { NextFunction } from "express";
import { REQUEST_STATE } from "../../constants/request";
import { parseQueryParams } from "../../utils/queryParser";
import { OooStatusRequestRequest, OooStatusRequestResponse } from "../../types/oooStatusRequest";
const OOO_STATUS_REQUEST_ENUM = Object.values(REQUEST_STATE);

export const createOooStatusRequestValidator = async (
  req: OooStatusRequestRequest,
  res: OooStatusRequestResponse,
  next: NextFunction
) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      userId: joi.string().required(),
      from: joi.number().required(),
      until: joi.number().required(),
      message: joi.string().required(),
      state: joi.string().valid(REQUEST_STATE.PENDING).required(),
      createdAt: joi.number().required(),
      updatedAt: joi.number().required(),
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error while validating OOO status request creation payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

export const updateOooStatusRequestValidator = async (
  req: OooStatusRequestRequest,
  res: OooStatusRequestResponse,
  next: NextFunction
) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      state: joi.string().valid(REQUEST_STATE.APPROVED, REQUEST_STATE.REJECTED).required(),
      processedBy: joi.string().required(),
      updatedAt: joi.number().required(),
      reason: joi.string().optional(),
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error while validating OOO status request update payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

export const getOooStatusRequestValidator = async (req, res, next) => {
  const schema = joi.object().keys({
    dev: joi.bool().optional().sensitive(),
    cursor: joi.string().optional(),
    order: joi.string().valid("asc", "desc").optional(),
    size: joi.number().integer().positive().min(1).max(100).optional(),
    q: joi.string().optional(),
  });

  const querySchema = joi.object().keys({
    userId: joi.string().optional(),
    processedBy: joi.string().optional(),
    from: joi.number().optional(),
    until: joi.number().optional(),
    message: joi.string().optional(),
    createdAt: joi.number().optional(),
    updatedAt: joi.number().optional(),
    state: joi
      .string()
      .valid(...OOO_STATUS_REQUEST_ENUM)
      .optional(),
    reason: joi.string().optional(),
  });

  try {
    const { q: queryString } = req.query;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("q", queryString);
    const queries = parseQueryParams(urlSearchParams.toString());
    await Promise.all([schema.validateAsync(req.query), querySchema.validateAsync(queries)]);
    next();
  } catch (error) {
    logger.error(`Error while validating OOO status request get payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};
