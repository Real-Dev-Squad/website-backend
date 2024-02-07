import express from "express";
const router = express.Router();
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");

import authenticate from "../middlewares/authenticate";
import { createRequestsMiddleware,updateRequestsMiddleware } from "../middlewares/validators/requests";
import { createRequestController , updateRequestController} from "../controllers/requests";

router.post("/",authenticate, createRequestsMiddleware, createRequestController);
router.put("/:id",authenticate, authorizeRoles([SUPERUSER]), updateRequestsMiddleware, updateRequestController);
module.exports = router;
