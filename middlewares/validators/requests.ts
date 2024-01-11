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
  const requestedUserId = req.userData.id;

  const schema = joi
    .object()
    .strict()
    .keys({
      userId: joi.string().required().valid(requestedUserId)
        .messages({
          'any.required': 'userId is required',
          'string.empty': 'userId cannot be empty',
          'any.only': 'User must be the same as the logged in user',
        }),
      from: joi.number().min(Date.now())
        .messages({
          'number.min': 'from date must be greater than or equal to current date',
        })
        .required(),
      until: joi.number().min(joi.ref('from'))
        .messages({
          'number.min': 'until date must be greater than or equal to from date',
        })
        .required(),
      message: joi.string().required()
        .messages({
          'any.required': 'message is required',
          'string.empty': 'message cannot be empty',
        }),
      state: joi.string().valid(REQUEST_STATE.PENDING).required()
        .messages({
          'any.only': 'state must be PENDING',
        }),
      createdAt: joi.number().optional(),
      updatedAt: joi.number().optional(),
    });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    logger.error(`Error while validating OOO status request creation payload: ${errorMessages}`);
    res.boom.badRequest(errorMessages);
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
    res.boom.badRequest(error.details[0].message);
  }
};
