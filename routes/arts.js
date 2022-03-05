const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { addArt, updateArt, fetchArts, getSelfArts } = require("../controllers/arts");

router.get("/", fetchArts);
router.get("/user/self", authenticate, getSelfArts);
router.post("/user/add", authenticate, addArt);
router.patch("/user/update", authenticate, updateArt);

module.exports = router;
