const express = require("express");
const authorizeRoles = require("../middlewares/authorizeRoles");
const router = express.Router();
const { SUPERUSER } = require("../constants/roles");
const authenticate = require("../middlewares/authenticate");
const questions = require("../controllers/questions");
const questionValidators = require("../middlewares/validators/questions");

router.post(
  "/",
  authenticate,
  authorizeRoles([SUPERUSER]),
  questionValidators.createQuestion,
  questions.createQuestion
);

module.exports = router;
