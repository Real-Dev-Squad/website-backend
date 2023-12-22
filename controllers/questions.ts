const crypto = require("crypto");
import { Request, Response } from "express";

import { Question } from "../types/questions";
import { CustomRequest, CustomResponse } from "../types/global";

const logger = require("../utils/logger.ts");
const { HEADERS_FOR_SSE } = require("../constants/constants");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

const questionQuery = require("../models/questions");

let clients = [];

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
    const question = await questionQuery.createQuestion({ ...req.body, id: questionId });
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

module.exports = { createQuestion, getQuestions };
