import express from "express";
const router = express.Router();
import contributions from "../controllers/contributions";

router.get("/:username", contributions.getUserContributions);

module.exports = router;
