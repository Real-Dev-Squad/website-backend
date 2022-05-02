const express = require("express");
const router = express.Router();
const newsletters = require("../controllers/newsletter");
const { validateEmail } = require("../middlewares/validators/newsletter");

router.post("/subscribe", validateEmail, newsletters.addEmail);

router.get("/", newsletters.getMailingList);

router.post("/unsubscribe", validateEmail, newsletters.removeEmail);

module.exports = router;