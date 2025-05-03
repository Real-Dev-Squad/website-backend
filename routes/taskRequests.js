import express from "express";
import { ROLES } from "../constants/roles.js";
import {
  fetchTaskRequests,
  fetchTaskRequestById,
  updateTaskRequests,
  migrateTaskRequests,
  addTaskRequests,
  addOrUpdate,
} from "../controllers/tasksRequests.js";
import authenticate from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import validators from "../middlewares/validators/task-requests.js";
import validateUser from "../middlewares/taskRequests.js";

const router = express.Router();
const { SUPERUSER } = ROLES;

router.get("/", authenticate, fetchTaskRequests);
router.get("/:id", authenticate, fetchTaskRequestById);
router.patch("/", authenticate, authorizeRoles([SUPERUSER]), validateUser, updateTaskRequests);
router.post("/", authenticate, validators.postTaskRequests, addTaskRequests);

router.post("/migrations", authenticate, authorizeRoles([SUPERUSER]), migrateTaskRequests);

// Deprecated | @Ajeyakrishna-k | https://github.com/Real-Dev-Squad/website-backend/issues/1597
router.post("/addOrUpdate", authenticate, validateUser, addOrUpdate);
router.patch("/approve", authenticate, authorizeRoles([SUPERUSER]), validateUser, updateTaskRequests);

export default router;
