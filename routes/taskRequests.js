import express from "express";
import { SUPERUSER } from "../constants/roles.js";
import taskRequests from "../controllers/tasksRequests.js";
import authenticate from "../middlewares/authenticate.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import validators from "../middlewares/validators/task-requests.js";

const router = express.Router();

router.get("/", authenticate, authorizeRoles([SUPERUSER]), taskRequests.getTaskRequests);
router.post(
  "/",
  authenticate,
  authorizeRoles([SUPERUSER]),
  validators.validateTaskRequest,
  taskRequests.createTaskRequest
);
router.put(
  "/:id",
  authenticate,
  authorizeRoles([SUPERUSER]),
  validators.validateTaskRequest,
  taskRequests.updateTaskRequest
);
router.delete("/:id", authenticate, authorizeRoles([SUPERUSER]), taskRequests.deleteTaskRequest);

export default router;
