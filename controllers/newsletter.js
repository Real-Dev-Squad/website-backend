const newsletters = require("../models/newsletter");

const addEmail = async (req, res) => {
    try {
        const a = await newsletters.subscribe(req.body);
        return res.json({
            message: "gotcha",
            response: a
        });
    } catch (err) {
        logger.error("control failed")
        return res.boom.badImplementation("not working")
    }
};

const getMailingList = async (req, res) => {
    try {
        const list = await newsletters.getMailingList();
        return res.json({
            message: "here is your list",
            response: list
        });
    } catch (err) {
        logger.error("Error in fetching list")
        return res.boom.badImplementation("not working")
    }
}

const removeEmail = async (req, res) => {
    try {
        const a = await newsletters.unsubscribe(req.body);
        return res.json({
            message: "done",
            response: a
        });
    } catch (err) {
        logger.error("couldn't perform operation")
        return res.boom.badImplementation("not working")
    }
}

module.exports = {
    addEmail,
    getMailingList,
    removeEmail
}