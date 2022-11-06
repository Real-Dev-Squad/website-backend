const express = require("express");

const { addTag, deleteTag, getAllTags } = require("../controllers/tags");
const { createTag } = require("../middlewares/validators/tags");

const router = express.Router();

router.post("/", createTag, addTag);
router.delete("/:tagid", deleteTag);
router.get("/", getAllTags);

module.exports = router;
