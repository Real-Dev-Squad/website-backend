import express from "express";
const router = express.Router();
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";
import authenticate from "../middlewares/authenticate.js";
import questions from "../controllers/questions.js";
import questionValidators from "../middlewares/validators/questions.js";

const { SUPERUSER } = ROLES;

router.post(
  "/",
  authenticate,
  authorizeRoles([SUPERUSER]),
  questionValidators.createQuestion,
  questions.createQuestion
);

router.get("/", questions.getQuestions);

export default router;
