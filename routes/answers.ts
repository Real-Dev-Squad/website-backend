const express = require("express");
const authorizeRoles = require("../middlewares/authorizeRoles");
const router = express.Router();
const answers = require("../controllers/answers");
const answerValidators = require("../middlewares/validators/answers");

router.post("/", answerValidators.createAnswer, answers.createAnswer);

// router.get("/", answers.getanswers);

module.exports = router;
