const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const tasks = require("../controllers/tasks");
const { createTask, updateTask, updateSelfTask } = require("../middlewares/validators/tasks");
const { authorizeUser } = require("../middlewares/authorization");

router.get("/", tasks.fetchTasks);
router.get("/self", authenticate, tasks.getSelfTasks);
router.get("/overdue", authenticate, authorizeUser("superUser"), tasks.overdueTasks);
router.patch("/:id", authenticate, authorizeUser("appOwner"), updateTask, tasks.updateTask);
router.get("/:username", tasks.getUserTasks);
router.patch("/self/:id", authenticate, updateSelfTask, tasks.updateTaskStatus);

module.exports = router;
