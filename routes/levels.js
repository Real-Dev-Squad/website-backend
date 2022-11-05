const express = require("express");
const { createValidator } = require("express-joi-validation");
const { addLevel, deleteLevel, getAllLevels } = require("../controllers/level-controller");
const { levelSchema } = require("../middlewares/validators/levels");

const router = express.Router();
const validator = createValidator();

router.post("/", validator.body(levelSchema), addLevel);
router.delete("/:levelid", deleteLevel);
router.get("/", getAllLevels);

module.exports = {
  routes: router,
};
