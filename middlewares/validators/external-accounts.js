const joi = require("joi");
const { EXTERNAL_ACCOUNTS_POST_ACTIONS } = require("../../constants/external-accounts");

const externalAccountData = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    type: joi.string().required(),
    token: joi.string().required(),
    attributes: joi.object().strict().required(),
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
module.exports = { externalAccountData, postExternalAccountsUsers };
