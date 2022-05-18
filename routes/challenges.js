const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const challenges = require("../controllers/challenge");
const { createChallenge } = require("../middlewares/validators/challenges");

router.get("/", authenticate, challenges.fetchChallenges);
router.post("/", authenticate, createChallenge, challenges.createChallenge);
router.post("/subscribe", authenticate, challenges.subscribeToChallenge);

module.exports = router;
