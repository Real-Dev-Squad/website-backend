import authenticate from "../middlewares/authenticate";

const express = require("express");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER, MEMBER } = require("../constants/roles");
const router = express.Router();
const answers = require("../controllers/answers");
const answerValidators = require("../middlewares/validators/answers");

router.post("/", answerValidators.createAnswer, answers.createAnswer);
router.patch(
  "/:answerId",
  authenticate,
  authorizeRoles([SUPERUSER, MEMBER]),
  answerValidators.updateAnswer,
  answers.updateAnswer
);

router.get("/", answers.getAnswers);

module.exports = router;
