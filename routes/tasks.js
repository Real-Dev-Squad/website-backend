import express from "express";
import authenticate from "../middlewares/authenticate.js";
import * as tasks from "../controllers/tasks.js";
import validateTask from "../middlewares/validators/tasks.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { authorizeAndAuthenticate } from "../middlewares/authorizeUsersAndService.js";
import { ROLES } from "../constants/roles.js";
import assignTask from "../middlewares/assignTask.js";
import { cacheResponse, invalidateCache } from "../utils/cache.js";
import { ALL_TASKS } from "../constants/cacheKeys.js";
import { verifyCronJob } from "../middlewares/authorizeBot.js";
import { CLOUDFLARE_WORKER, CRON_JOB_HANDLER } from "../constants/bot.js";
import { devFlagMiddleware } from "../middlewares/devFlag.js";
import { userAuthorization } from "../middlewares/userAuthorization.js";

const router = express.Router();
const { APPOWNER, SUPERUSER } = ROLES;

const oldAuthorizationMiddleware = authorizeRoles([APPOWNER, SUPERUSER]);
const newAuthorizationMiddleware = authorizeAndAuthenticate(
  [APPOWNER, SUPERUSER],
  [CLOUDFLARE_WORKER, CRON_JOB_HANDLER]
);

// Middleware to check if 'dev' query parameter is set to true
const enableDevModeMiddleware = (req, res, next) => {
  if (req.query.dev === "true") {
    newAuthorizationMiddleware(req, res, next);
  } else {
    oldAuthorizationMiddleware(req, res, next);
  }
};

router.get(
  "/",
  validateTask.getTasksValidator,
  cacheResponse({ invalidationKey: ALL_TASKS, expiry: 10 }),
  tasks.fetchTasks
);
router.get("/self", authenticate, tasks.getSelfTasks);

router.get("/overdue", authenticate, authorizeRoles([SUPERUSER]), tasks.overdueTasks);
router.post(
  "/",
  authenticate,
  authorizeRoles([APPOWNER, SUPERUSER]),
  invalidateCache({ invalidationKeys: [ALL_TASKS] }),
  validateTask.createTask,
  tasks.addNewTask
);
router.patch(
  "/:id",
  authenticate,
  enableDevModeMiddleware,
  invalidateCache({ invalidationKeys: [ALL_TASKS] }),
  validateTask.updateTask,
  tasks.updateTask
);
router.get("/:id/details", tasks.getTask);
router.get("/:username", tasks.getUserTasks);

router.patch(
  "/self/:id",
  authenticate,
  invalidateCache({ invalidationKeys: [ALL_TASKS] }),
  validateTask.updateSelfTask,
  tasks.updateTaskStatus,
  assignTask
); // this route is being deprecated in favor of /tasks/:id/status.
router.patch(
  "/:id/status",
  authenticate,
  devFlagMiddleware,
  invalidateCache({ invalidationKeys: [ALL_TASKS] }),
  validateTask.updateSelfTask,
  tasks.updateTaskStatus,
  assignTask
);
router.patch("/assign/self", authenticate, invalidateCache({ invalidationKeys: [ALL_TASKS] }), tasks.assignTask); // this route is being deprecated in favor of /assign/:userId.

router.patch(
  "/assign/:userId",
  authenticate,
  devFlagMiddleware,
  userAuthorization,
  invalidateCache({ invalidationKeys: [ALL_TASKS] }),
  tasks.assignTask
);

router.get("/users/discord", verifyCronJob, validateTask.getUsersValidator, tasks.getUsersHandler);

router.post("/migration", authenticate, authorizeRoles([SUPERUSER]), tasks.updateStatus);
router.post("/orphanTasks", authenticate, authorizeRoles([SUPERUSER]), tasks.orphanTasks);

export default router;
