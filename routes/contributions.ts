import express from "express";
const router = express.Router();
import { getUserContributions } from "../controllers/contributions.js";

router.get("/:username", getUserContributions);

export default router;
