import joi from "joi";
import { NextFunction } from "express";
import { REQUEST_STATE, REQUEST_TYPE, ERROR_WHILE_ACKNOWLEDGING_REQUEST } from "../../constants/requests";
import { AcknowledgeOooRequest, OooRequestCreateRequest, OooRequestResponse } from "../../types/oooRequest";

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
        .min(new Date().setUTCHours(0, 0, 0, 0))
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
    });

  await schema.validateAsync(req.body, { abortEarly: false });
};

const acknowledgeOooRequestSchema = joi
  .object()
  .strict()
  .keys({
    comment: joi.string().optional()
      .messages({
        "string.empty": "comment cannot be empty",
      }),
    status: joi
      .string()
      .valid(REQUEST_STATE.APPROVED, REQUEST_STATE.REJECTED)
      .required()
      .messages({
        "any.only": "status must be APPROVED or REJECTED",
      }),
    type: joi.string().equal(REQUEST_TYPE.OOO).required().messages({
      "any.required": "type is required",
      "any.only": "type must be OOO"
    })
  });

const paramsSchema = joi
  .object()
  .strict()
  .keys({
    id: joi.string().trim().required().messages({
      "any.required": "Request ID is required",
      "string.empty": "Request ID cannot be empty"
    })
  });

/**
 * Middleware to validate the acknowledge Out-Of-Office (OOO) request payload.
 * 
 * @param {AcknowledgeOooRequest} req - The request object containing the body to be validated.
 * @param {OooRequestResponse} res - The response object used to send error responses if validation fails.
 * @param {NextFunction} next - The next middleware function to call if validation succeeds.
 * @returns {Promise<void>} Resolves or sends errors.
 */
export const acknowledgeOooRequestValidator = async (
  req: AcknowledgeOooRequest,
  res: OooRequestResponse,
  next: NextFunction
): Promise<void> => {
  try {
    await acknowledgeOooRequestSchema.validateAsync(req.body, { abortEarly: false });
    await paramsSchema.validateAsync(req.params, { abortEarly: false });
    return next();
  } catch (error: unknown) {

    if (error instanceof joi.ValidationError) {
      const errorMessages = error.details.map((detail) => detail.message);
      logger.error(`${ERROR_WHILE_ACKNOWLEDGING_REQUEST}: ${errorMessages}`);
      return res.boom.badRequest(errorMessages);
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`${ERROR_WHILE_ACKNOWLEDGING_REQUEST}: ${errorMessage}`);
    return res.boom.badRequest([ERROR_WHILE_ACKNOWLEDGING_REQUEST]);
  }
};
