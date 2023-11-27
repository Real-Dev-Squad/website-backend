import { Request } from "express";
import { CustomRequest, CustomResponse } from "../typeDefinitions/global";

const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const answerQuery = require("../models/answers");
const crypto = require("crypto");
import { Answer, AnswerFieldsToUpdate, AnswerStatus } from "../typeDefinitions/answers";
const { ANSWER_STATUS } = require("../constants/answers");

const createAnswer = async (req: Request, res: CustomResponse) => {
  try {
    const answerId = crypto.randomUUID({ disableEntropyCache: true });
    const answer = await answerQuery.createAnswer({ ...req.body, id: answerId });
    return res.status(201).json({
      message: "Answer sent successfully",
      data: answer,
    });
  } catch (error) {
    logger.error(`Error while creating answer: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const updateAnswer = async (req: CustomRequest, res: CustomResponse) => {
  const id: string = req.params.answerId;
  const status: AnswerStatus = req.body.status;

  try {
    const fieldsToUpdate: AnswerFieldsToUpdate = { status, reviewed_by: req.userData.id };

    const answer = await answerQuery.updateAnswer(id, fieldsToUpdate);
    return res.status(204).send();
  } catch (error) {
    logger.error(`Error while updating answer: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = { createAnswer, updateAnswer };
