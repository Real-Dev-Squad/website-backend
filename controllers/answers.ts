import { Request } from "express";
import { CustomRequest, CustomResponse } from "../typeDefinitions/global";

const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const answerQuery = require("../models/answers");
const crypto = require("crypto");
import { Answer, AnswerFieldsToUpdate, AnswerStatus } from "../typeDefinitions/answers";
const { ANSWER_STATUS } = require("../constants/answers");
const logger = require("../utils/logger");
const { HEADERS_FOR_SSE } = require("../constants/constants");

let clients = [];

async function sendAnswerToAll(newAnswer: Answer, res: CustomResponse, method: "POST" | "PATCH") {
  const questionId: string = newAnswer.question_id;

  if (method === "POST") {
    const answers = await answerQuery.getAnswers({ questionId, status: ANSWER_STATUS.PENDING });
    clients.forEach((client) => {
      console.log(answers);
      if (client.status === ANSWER_STATUS.PENDING) {
        client.res.write(`data: ${JSON.stringify(answers)}\n\n`);
      }
    });
    return res.status(201).json({
      message: "Answer created and sent successfully to connected peers",
      data: newAnswer,
    });
  }

  if (method === "PATCH") {
    const answers = await answerQuery.getAnswers({ questionId, status: ANSWER_STATUS.APPROVED });
    clients.forEach((client) => {
      if (client.status === ANSWER_STATUS.APPROVED) {
        client.res.write(`data: ${JSON.stringify(answers)}\n\n`);
      }
    });

    return res.status(204).send();
  }
}

const createAnswer = async (req: Request, res: CustomResponse) => {
  try {
    const answerId = crypto.randomUUID({ disableEntropyCache: true });
    const answer = await answerQuery.createAnswer({ ...req.body, id: answerId });

    sendAnswerToAll(answer, res, "POST");
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
    sendAnswerToAll(answer, res, "PATCH");
  } catch (error) {
    logger.error(`Error while updating answer: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const getAnswers = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const headers = HEADERS_FOR_SSE;

    res.writeHead(200, headers);

    // for initial sse(server sent event) connection sending null data
    const data = `data: null\n\n`;
    res.write(data);

    const clientId = crypto.randomUUID({ disableEntropyCache: true });
    console.log({ req: req });
    const newClient = {
      id: clientId,
      res,
      status: req.query.status,
    };

    clients.push(newClient);

    req.on("close", () => {
      logger.info(`${clientId} Connection closed`);
      clients = clients.filter((client) => client.id !== clientId);
    });
  } catch (error) {
    logger.error(`Error while getting question: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};
module.exports = { createAnswer, updateAnswer, getAnswers };
