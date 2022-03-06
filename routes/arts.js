const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const arts = require("../controllers/arts");
const artValidator = require("../middlewares/validators/arts");

router.get("/", arts.fetchArts);
router.get("/user/self", authenticate, arts.getSelfArts);
router.post("/user/add", authenticate, artValidator.createArt, arts.addArt);
router.patch("/user/update", authenticate, arts.updateArt);

module.exports = router;
