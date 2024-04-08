import Joi from "joi";
import { userState, CANCEL_OOO } from "../../constants/userStatus";
import { NextFunction } from "express";
import { CustomResponse } from "../../typeDefinitions/global";
import dataAccess from "../../services/dataAccessLayer";
const threeDaysInMilliseconds = 172800000;

const validateUsersStatusData = async (todaysTime: number, req: any, res: any, next: any) => {
  const validUserStatuses = [userState.OOO, userState.ONBOARDING];

  const statusSchema = Joi.object({
    status: Joi.string()
      .trim()
      .valid(...validUserStatuses)
      .required()
      .error(new Error(`Invalid Status. the acceptable statuses are ${validUserStatuses}`)),
    appliedOn: Joi.number()
      .min(todaysTime)
      .required()
      .error(new Error(`The 'appliedOn' field must have a value that is either today or a date that follows today.`)),
    endsOn: Joi.any().when("status", {
      is: userState.OOO,
      then: Joi.number()
        .min(Joi.ref("appliedOn"))
        .required()
        .error(
          new Error(
            `The 'endsOn' field must have a value that is either 'appliedOn' date or a date that comes after 'appliedOn' day.`
          )
        ),
      otherwise: Joi.optional(),
    }),
    message: Joi.when(Joi.ref("status"), {
      is: userState.OOO,
      then: Joi.when(Joi.ref("endsOn"), {
        is: Joi.number().greater(
          Joi.ref("appliedOn", {
            adjust: (value) => value + threeDaysInMilliseconds,
          })
        ),
        then: Joi.string()
          .required()
          .error(
            new Error(`The value for the 'message' field is mandatory when State is OOO for more than three days.`)
          ),
        otherwise: Joi.optional(),
      }),
      otherwise: Joi.optional(),
    }),
  });

  const cancelOooSchema = Joi.object()
    .keys({
      cancelOoo: Joi.boolean().valid(true).required(),
    })
    .unknown(false);

  let schema: any;

  const validateUserId = async (userId: string) => {
    // @ts-expect-error
    const result = await dataAccess.retrieveUsers({ id: userId });
    if(!result.userExists) {
      throw new Error("No user found with this userId.")
    }
  }

  try {
    if (Object.keys(req.body).includes(CANCEL_OOO)) {
      schema = cancelOooSchema;
    } else {
      schema = statusSchema;
    }
    await schema.validateAsync(req.body);
    await validateUserId(req.params.userId);
    next();
  } catch (error) {
    // @ts-ignore
    logger.error(`Error validating UserStatus ${error}`);
    res.boom.badRequest(error);
  }
};

export const validateUsersStatus = (req: any, res: any, next: any) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todaysTime = today.getTime();
  validateUsersStatusData(todaysTime, req, res, next);
};