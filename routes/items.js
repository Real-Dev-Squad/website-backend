const express = require("express");
const {
  addTagsToItem,
  removeTagsFromItem,
  getItemsBasedOnType,
  getItemsBasedOnTagId,
  getAllItems,
  getItemsBasedOnitemId,
  getItemsBasedOnTagType,
} = require("../controllers/items");
const { createItem } = require("../middlewares/validators/items");

const router = express.Router();

router.post("/", createItem, addTagsToItem);
router.delete("/", removeTagsFromItem);
router.get("/bytype/:type", getItemsBasedOnType);
router.get("/bytag/:tagid", getItemsBasedOnTagId);
router.get("/byitem/:itemid", getItemsBasedOnitemId);
router.get("/bytagtype/:tagtype", getItemsBasedOnTagType);
router.get("/", getAllItems);

module.exports = router;
