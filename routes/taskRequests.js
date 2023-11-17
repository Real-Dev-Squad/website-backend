const express = require("express");
const { SUPERUSER } = require("../constants/roles");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const taskRequests = require("../controllers/tasksRequests");
const { validateUser } = require("../middlewares/taskRequests");
const validators = require("../middlewares/validators/task-requests");

router.get("/", authenticate, authorizeRoles([SUPERUSER]), validators.getTaskRequests, taskRequests.fetchTaskRequests);
router.get("/:id", authenticate, authorizeRoles([SUPERUSER]), taskRequests.fetchTaskRequestById);
router.post("/addOrUpdate", authenticate, validateUser, taskRequests.addOrUpdate);
router.patch("/approve", authenticate, authorizeRoles([SUPERUSER]), validateUser, taskRequests.updateTaskRequests);
router.patch("/", authenticate, authorizeRoles([SUPERUSER]), validateUser, taskRequests.updateTaskRequests);
router.post("/", authenticate, validators.postTaskRequests, taskRequests.addTaskRequests);
router.post("/migrations", authenticate, authorizeRoles([SUPERUSER]), taskRequests.migrateTaskRequests);

module.exports = router;
