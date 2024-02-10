const express = require("express");
const { addLevel, deleteLevel, getAllLevels } = require("../controllers/levels");
const { validateLevelBody } = require("../middlewares/validators/levels");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");

const router = express.Router();

router.post("/", authenticate, authorizeRoles([SUPERUSER]), validateLevelBody, addLevel);
router.delete("/:levelid", authenticate, authorizeRoles([SUPERUSER]), deleteLevel);
router.get("/", getAllLevels);

module.exports = router;
