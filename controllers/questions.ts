import crypto from "crypto";
import { Request } from "express";

import { Client, Question } from "../types/questions.js";
import { CustomRequest, CustomResponse } from "../types/global.js";
import logger from "../utils/logger.js";

import { HEADERS_FOR_SSE } from "../constants/constants.js";
import { INTERNAL_SERVER_ERROR } from "../constants/errorMessages.js";

import { createQuestion as modelCreateQuestion } from "../models/questions.js";

/* Refer to limitation of this clients array here(in the limitations section of doc) - https://github.com/Real-Dev-Squad/website-www/wiki/%5BFeature%5D-%E2%80%90-Realtime-Word-Cloud-Questions-Answers-Feature*/
let clients: Client[] = [];

function sendQuestionToAll(newQuestion: Question, res: CustomResponse) {
  clients.forEach((client) => client.res.write(`data: ${JSON.stringify(newQuestion)}\n\n`));

  res.status(201).send({
    message: "Question created and sent successfully to connected peers",
    data: newQuestion,
  });
}

const createQuestion = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const questionId = crypto.randomUUID({ disableEntropyCache: true });
    const question = await modelCreateQuestion({ ...req.body, id: questionId });
    return sendQuestionToAll(question, res);
  } catch (error) {
    logger.error(`Error while creating question: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

// eslint-disable-next-line consistent-return
const getQuestions = async (req: Request, res: CustomResponse) => {
  try {
    res.writeHead(200, HEADERS_FOR_SSE);

    // for initial sse(server sent event) connection sending null data
    const data = `data: null\n\n`;
    res.write(data);

    const clientId = crypto.randomUUID({ disableEntropyCache: true });

    const newClient = {
      id: clientId,
      res,
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

export default { createQuestion, getQuestions };
