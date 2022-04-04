const express = require("express");
const router = express.Router();
const member = require("../controllers/testTypescript");

router.get("/mehul", member.testTypescript);

export = router;
