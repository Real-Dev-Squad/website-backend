import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import usersStatusController from "../controllers/usersStatus";

router.get("/self", authenticate, usersStatusController.getUserStatus);
router.get("/:userId", usersStatusController.getUserStatus);

module.exports = router;
