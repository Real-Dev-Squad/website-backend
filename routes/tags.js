const express = require("express");

const { createValidator } = require("express-joi-validation");
const { addTag, deleteTag, getAllTags } = require("../controllers/tags");
const { tagSchema } = require("../middlewares/validators/tags");

const router = express.Router();
const validator = createValidator();

router.post("/", validator.body(tagSchema), addTag);
router.delete("/:tagid", deleteTag);
router.get("/", getAllTags);

module.exports = {
  routes: router,
};
