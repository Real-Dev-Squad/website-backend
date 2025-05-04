import joi from "joi";
import { EXTERNAL_ACCOUNTS_POST_ACTIONS } from "../../constants/external-accounts.js";

const externalAccountData = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      type: joi.string().required(),
      token: joi.string().required(),
      attributes: {
        userName: joi.string().required(),
        discriminator: joi.string().required(),
        userAvatar: joi.string().required(),
        discordId: joi.string().required(),
        discordJoinedAt: joi.string().required(),
        expiry: joi.number().required(),
      },
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating external account request payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};
const postExternalAccountsUsers = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      action: joi
        .string()
        .valid(...Object.values(EXTERNAL_ACCOUNTS_POST_ACTIONS))
        .required(),
    });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Error validating external account request payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const linkDiscord = async (req, res, next) => {
  const { token } = req.params;

  const schema = joi.object({
    token: joi.string().required(),
  });

  const validationOptions = { abortEarly: false };

  try {
    await schema.validateAsync({ token }, validationOptions);
    next();
  } catch (error) {
    logger.error(`Error retrieving event: ${error}`);
    res.boom.badRequest(error.details.map((detail) => detail.message));
  }
};

export default { externalAccountData, postExternalAccountsUsers, linkDiscord };
