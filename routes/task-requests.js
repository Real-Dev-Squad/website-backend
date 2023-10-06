const express = require("express");
const { SUPERUSER } = require("../constants/roles");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const taskRequests = require("../controllers/tasksRequests");
const { validateUser } = require("../middlewares/taskRequests");

router.get("/", authenticate, authorizeRoles([SUPERUSER]), taskRequests.fetchTaskRequests);
router.get("/:id", authenticate, authorizeRoles([SUPERUSER]), taskRequests.fetchTaskRequestById);
router.post("/", authenticate, validateUser, taskRequests.addOrUpdate);
router.patch("/", authenticate, authorizeRoles([SUPERUSER]), validateUser, taskRequests.approveTaskRequest);

module.exports = router;
