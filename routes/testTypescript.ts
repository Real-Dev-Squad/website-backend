import express = require('express');
const router = express.Router();
import { testTypescript } from "../controllers/testTypescript";

router.get("/mehul", testTypescript);

export =  router;
