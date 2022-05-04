import express, { Router } from "express";
const router = Router();
import { testTypescript } from "../controllers/testTypescript";

router.get("/mehul", testTypescript);

export { router };
