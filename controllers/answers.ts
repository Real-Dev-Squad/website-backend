import { Request } from "express";
import { CustomResponse } from "../typeDefinitions/global";

const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const answerQuery = require("../models/answers");
const crypto = require("crypto");

const createAnswer = async(req: Request, res: CustomResponse)=>{
  try {
    const answerId = crypto.randomUUID({ disableEntropyCache: true });
    const answer = await answerQuery.createAnswer({ ...req.body, id: answerId });
    return res.status(201).json({
      message: "Answer sent successfully",
      data: answer
    })
  } catch (error) {
    logger.error(`Error while creating answer: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
}

module.exports = {createAnswer};
