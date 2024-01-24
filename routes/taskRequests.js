const express = require("express");
const { SUPERUSER } = require("../constants/roles");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const taskRequests = require("../controllers/tasksRequests");
const { validateUser } = require("../middlewares/taskRequests");
const validators = require("../middlewares/validators/task-requests");

router.get("/", authenticate, taskRequests.fetchTaskRequests);
router.get("/:id", authenticate, taskRequests.fetchTaskRequestById);
router.patch("/", authenticate, authorizeRoles([SUPERUSER]), validateUser, taskRequests.updateTaskRequests);
router.post("/", authenticate, validators.postTaskRequests, taskRequests.addTaskRequests);

router.post("/migrations", authenticate, authorizeRoles([SUPERUSER]), taskRequests.migrateTaskRequests);

// Deprecated | @Ajeyakrishna-k | https://github.com/Real-Dev-Squad/website-backend/issues/1597
router.post("/addOrUpdate", authenticate, validateUser, taskRequests.addOrUpdate);
router.patch("/approve", authenticate, authorizeRoles([SUPERUSER]), validateUser, taskRequests.updateTaskRequests);

module.exports = router;
