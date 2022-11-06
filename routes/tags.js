const express = require("express");

const { addTag, deleteTag, getAllTags } = require("../controllers/tags");
const { validTagBody } = require("../middlewares/validators/tags");

const router = express.Router();

router.post("/", validTagBody, addTag);
router.delete("/:tagid", deleteTag);
router.get("/", getAllTags);

module.exports = router;
