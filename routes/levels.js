const express = require("express");
const { addLevel, deleteLevel, getAllLevels } = require("../controllers/levels");
const { createLevel } = require("../middlewares/validators/levels");

const router = express.Router();

router.post("/", createLevel, addLevel);
router.delete("/:levelid", deleteLevel);
router.get("/", getAllLevels);

module.exports = router;
