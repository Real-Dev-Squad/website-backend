const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const tasks = require("../controllers/tasks");
const { createTask, updateTask, updateSelfTask } = require("../middlewares/validators/tasks");
const authorizeRoles = require("../middlewares/authorizeRoles");
const {
  ROLES: { APPOWNER, SUPERUSER },
} = require("../constants/roles");

router.get("/", tasks.fetchTasks);
router.get("/self", authenticate, tasks.getSelfTasks);
router.get("/overdue", authenticate, authorizeRoles([SUPERUSER]), tasks.overdueTasks);
router.post("/", authenticate, authorizeRoles([APPOWNER, SUPERUSER]), createTask, tasks.addNewTask);
router.patch("/:id", authenticate, authorizeRoles([APPOWNER, SUPERUSER]), updateTask, tasks.updateTask);
router.get("/:username", tasks.getUserTasks);
router.patch("/self/:id", authenticate, updateSelfTask, tasks.updateTaskStatus);

module.exports = router;
