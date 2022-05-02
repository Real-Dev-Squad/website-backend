const joi = require("joi");

const validateEmail = async (req, res, next) => {
    const schema = joi.object().strict().keys({
        email: joi.string().required()
    });

    try {
        await schema.validateAsync(req.body);
        next();
    } catch (error) {
        logger.error(error);
        res.boom.badRequest(error.details[0].message);
    }
};

module.exports = {
    validateEmail
}