const joi = require("joi");
const logger = require("../../utils/logger");

async function createBadge(req, res, next){
    const schema = joi.object().strict().keys({
        name: joi.string().min(3).max(30).required(),
        description: joi.string().min(3).max(130).required(),
        createdBy: joi.string().min(1).required(),
    });
    try{
        //TODO: add strong file check
        if(!req.file) {
            throw new Error("file is required");
        }
        await schema.validateAsync(req.body);
        next();
    }catch(error){
        logger.error(`Error validating createBadge payload: ${error}`);
        res.boom.badRequest(`API payload failed validation, ${error.details?.[0]?.message ?? error?.message}`);
    }
}

module.exports = {
    createBadge,
}