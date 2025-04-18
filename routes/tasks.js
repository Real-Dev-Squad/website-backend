const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const tasks = require("../controllers/tasks");
const {
  createTask,
  updateTask,
  updateSelfTask,
  getTasksValidator,
  getUsersValidator,
} = require("../middlewares/validators/tasks");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { authorizeAndAuthenticate } = require("../middlewares/authorizeUsersAndService");
const { APPOWNER, SUPERUSER } = require("../constants/roles");
const assignTask = require("../middlewares/assignTask");
const { cacheResponse, invalidateCache } = require("../utils/cache");
const { ALL_TASKS } = require("../constants/cacheKeys");
const { verifyCronJob } = require("../middlewares/authorizeBot");
const { CLOUDFLARE_WORKER, CRON_JOB_HANDLER } = require("../constants/bot");
const { devFlagMiddleware } = require("../middlewares/devFlag");
const { userAuthorization } = require("../middlewares/userAuthorization");

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

router.get("/", getTasksValidator, cacheResponse({ invalidationKey: ALL_TASKS, expiry: 10 }), tasks.fetchTasks);
router.get("/self", authenticate, tasks.getSelfTasks);

router.get("/overdue", authenticate, authorizeRoles([SUPERUSER]), tasks.overdueTasks);
router.post(
  "/",
  authenticate,
  authorizeRoles([APPOWNER, SUPERUSER]),
  invalidateCache({ invalidationKeys: [ALL_TASKS] }),
  createTask,
  tasks.addNewTask
);
router.patch(
  "/:id",
  authenticate,
  enableDevModeMiddleware,
  invalidateCache({ invalidationKeys: [ALL_TASKS] }),
  updateTask,
  tasks.updateTask
);
router.get("/:id/details", tasks.getTask);
router.get("/:username", tasks.getUserTasks);

router.patch(
  "/self/:id",
  authenticate,
  invalidateCache({ invalidationKeys: [ALL_TASKS] }),
  updateSelfTask,
  tasks.updateTaskStatus,
  assignTask
); // this route is being deprecated in favor of /tasks/:id/status.
router.patch(
  "/:id/status",
  authenticate,
  devFlagMiddleware,
  invalidateCache({ invalidationKeys: [ALL_TASKS] }),
  updateSelfTask,
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

router.get("/users/discord", verifyCronJob, getUsersValidator, tasks.getUsersHandler);

router.post("/migration", authenticate, authorizeRoles([SUPERUSER]), tasks.updateStatus);
router.post("/orphanTasks", authenticate, authorizeRoles([SUPERUSER]), tasks.orphanTasks);

module.exports = router;
