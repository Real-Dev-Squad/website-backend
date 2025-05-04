import express from "express";

import authenticate from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";
import answers from "../controllers/answers.js";
import answerValidators from "../middlewares/validators/answers.js";


const { SUPERUSER, MEMBER } = ROLES;
const router = express.Router();


router.post("/", answerValidators.createAnswer, answers.createAnswer);
router.patch(
  "/:answerId",
  authenticate,
  authorizeRoles([SUPERUSER, MEMBER]),
  answerValidators.updateAnswer,
  answers.updateAnswer
);

router.get("/", answers.getAnswers);

export default router;
