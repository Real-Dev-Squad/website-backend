const express = require("express");
const { SUPERUSER } = require("../constants/roles");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const taskRequests = require("../controllers/tasksRequests");
const cache = require("../utils/cache");

router.get("/", cache(), authenticate, authorizeRoles([SUPERUSER]), taskRequests.fetchTaskRequests);
router.put("/create", taskRequests.createTaskRequest);
router.patch("/approve", authenticate, authorizeRoles([SUPERUSER]), taskRequests.approveTaskRequest);

module.exports = router;
