import joi from "joi";
import { NextFunction } from "express";
import { REQUEST_STATE } from "../../constants/request";
import { OooStatusRequestRequest, OooStatusRequestResponse } from "../../types/oooStatusRequest";
import { RQLQueryParser } from "../../utils/RQLParser";

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
  const queryParamsSchema = joi
    .object()
    .keys({
      dev: joi.bool().optional().sensitive(),
      prev: joi.string().optional(),
      next: joi.string().optional(),
      size: joi.number().integer().positive().min(1).max(100).optional(),
      q: joi.string().optional(),
    })
    .without("prev", "next")
    .with("prev", "size")
    .with("next", "size");

  const filtersSchema = joi.object().keys({
    status: joi
      .array()
      .items(
        joi.object().keys({
          value: joi.string().valid(...Object.values(REQUEST_STATE).map((value) => value.toLowerCase())),
          operator: joi.string().optional(),
        })
      )
      .optional(),
    "request-type": joi
      .array()
      .items(
        joi.object().keys({
          value: joi.string().valid(...Object.values(REQUEST_STATE).map((value) => value.toLowerCase())),
          operator: joi.string().optional(),
        })
      )
      .optional(),
  });

  const sortSchema = joi.object().keys({
    created: joi.string().valid("asc", "desc").optional(),
    requestors: joi.string().valid("asc", "desc").optional(),
  });

  try {
    const { q: queryString } = req.query;
    const rqlQueryParser = new RQLQueryParser(queryString);

    await Promise.all([
      filtersSchema.validateAsync(rqlQueryParser.getFilterQueries()),
      sortSchema.validateAsync(rqlQueryParser.getSortQueries()),
      queryParamsSchema.validateAsync(req.query),
    ]);
    next();
  } catch (error) {
    logger.error(`Error validating get task requests payload : ${error}`);
    res.boom.badRequest(error?.details?.[0]?.message || error?.message);
  }
};
