import express from "express";
const router = express.Router();
import { getUserContributions } from "../controllers/contributions";

router.get("/:username", getUserContributions);

export default router;
