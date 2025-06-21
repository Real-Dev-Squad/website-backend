import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import { updateImpersonationRequestValidator } from "../middlewares/validators/impersonationRequests";
import { updateImpersonationRequestStatusController } from "../controllers/impersonationRequests";

router.patch("/requests/:id", authenticate,updateImpersonationRequestValidator,updateImpersonationRequestStatusController);

module.exports = router;