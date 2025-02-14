import { Request } from "express";
const crypto = require("crypto");

import { Answer, AnswerClient, AnswerFieldsToUpdate, AnswerStatus } from "../typeDefinitions/answers";
import { CustomRequest, CustomResponse } from "../typeDefinitions/global";
import { logger } from "../utils/logger";

const answerQuery = require("../models/answers");

const { ANSWER_STATUS } = require("../constants/answers");
const { HEADERS_FOR_SSE } = require("../constants/constants");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

/* Refer to limitation of this clients array here(in the limitations section of doc) - https://github.com/Real-Dev-Squad/website-www/wiki/%5BFeature%5D-%E2%80%90-Realtime-Word-Cloud-Questions-Answers-Feature*/
let clients: AnswerClient[] = [];

async function sendAnswerToAll(newAnswer: Answer, res: CustomResponse, method: "POST" | "PATCH") {
  const questionId: string = newAnswer.question_id;

  const allAnswers = await answerQuery.getAnswers({ questionId });
  if (method === "POST") {
    clients.forEach((client) => {
      if (client.status !== ANSWER_STATUS.APPROVED) {
        client.res.write(`data: ${JSON.stringify(allAnswers)}\n\n`);
      }
    });
    return res.status(201).json({
      message: "Answer created and sent for moderation",
      data: newAnswer,
    });
  }

  if (method === "PATCH") {
    const answers = await answerQuery.getAnswers({ questionId, status: ANSWER_STATUS.APPROVED });
    clients.forEach((client) => {
      if (client.status === ANSWER_STATUS.APPROVED) {
        client.res.write(`data: ${JSON.stringify(answers)}\n\n`);
      } else {
        client.res.write(`data: ${JSON.stringify(allAnswers)}\n\n`);
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
    const status = req.query?.status?.toString();

    res.writeHead(200, headers);

    // for initial sse(server sent event) connection sending null data
    const data = `data: null\n\n`;
    res.write(data);

    const clientId = crypto.randomUUID({ disableEntropyCache: true });
    const newClient = {
      id: clientId,
      res,
      status: status,
    };

    clients.push(newClient);

    req.on("close", () => {
      logger.info(`${clientId} Connection closed`);
      clients = clients.filter((client) => client.id !== clientId);
    });
  } catch (error) {
    logger.error(`Error while getting answers: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};
module.exports = { createAnswer, updateAnswer, getAnswers };
