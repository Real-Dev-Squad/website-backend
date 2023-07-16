const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const tasks = require("../controllers/tasks");
const { createTask, updateTask, updateSelfTask, getTasksValidator } = require("../middlewares/validators/tasks");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { APPOWNER, SUPERUSER } = require("../constants/roles");
const assignTask = require("../middlewares/assignTask");
const { cache, invalidateCache } = require("../utils/cache");
const { TASKS_ALL } = require("../constants/cacheKeys");

router.get("/", getTasksValidator, cache({ invalidationKey: TASKS_ALL, expiry: 10 }), tasks.fetchTasks);
router.get("/self", authenticate, tasks.getSelfTasks);
router.get("/overdue", authenticate, authorizeRoles([SUPERUSER]), tasks.overdueTasks);
router.post(
  "/",
  authenticate,
  authorizeRoles([APPOWNER, SUPERUSER]),
  invalidateCache({ invalidationKeys: [TASKS_ALL] }),
  createTask,
  tasks.addNewTask
);
router.patch(
  "/:id",
  authenticate,
  authorizeRoles([APPOWNER, SUPERUSER]),
  invalidateCache({ invalidationKeys: [TASKS_ALL] }),
  updateTask,
  tasks.updateTask
);
router.get("/:id/details", tasks.getTask);
router.get("/:username", tasks.getUserTasks);
router.patch(
  "/self/:id",
  authenticate,
  invalidateCache({ invalidationKeys: [TASKS_ALL] }),
  updateSelfTask,
  tasks.updateTaskStatus,
  assignTask
);
router.patch("/assign/self", authenticate, invalidateCache({ invalidationKeys: [TASKS_ALL] }), tasks.assignTask);

module.exports = router;
