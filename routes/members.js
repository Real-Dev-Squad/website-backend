import express from "express";
import members from "../controllers/members.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import authenticate from "../middlewares/authenticate.js";
import { addRecruiter, fetchRecruitersInfo } from "../controllers/recruiters.js";
import { validateRecruiter } from "../middlewares/validators/recruiter.js";
import { validateGetMembers } from "../middlewares/validators/members.js";
import { SUPERUSER } from "../constants/roles.js";

const router = express.Router();

router.get("/", authenticate, authorizeRoles([SUPERUSER]), validateGetMembers, members.getMembers);
router.get("/recruiters", authenticate, authorizeRoles([SUPERUSER]), fetchRecruitersInfo);
router.post("/recruiters", authenticate, authorizeRoles([SUPERUSER]), validateRecruiter, addRecruiter);

export default router;
