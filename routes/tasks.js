const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const tasks = require("../controllers/tasks");
const { createTask, updateTask, updateSelfTask, getTasksValidator } = require("../middlewares/validators/tasks");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { APPOWNER, SUPERUSER } = require("../constants/roles");
const assignTask = require("../middlewares/assignTask");
const { cacheResponse, invalidateCache } = require("../utils/cache");
const { ALL_TASKS } = require("../constants/cacheKeys");

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
router.patch("/migrate", authenticate, authorizeRoles([SUPERUSER]), tasks.updateOldTaskStatus);
router.patch(
  "/:id",
  authenticate,
  authorizeRoles([APPOWNER, SUPERUSER]),
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
);
router.patch("/assign/self", authenticate, invalidateCache({ invalidationKeys: [ALL_TASKS] }), tasks.assignTask);

module.exports = router;
