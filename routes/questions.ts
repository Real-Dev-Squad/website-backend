import express from "express";
const router = express.Router();
const authorizeRoles = require("../middlewares/authorizeRoles");
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

router.get("/", questions.getQuestions);

module.exports = router;
