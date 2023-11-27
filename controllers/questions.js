const logger = require("../utils/logger.ts");
const crypto = require("crypto");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const questionQuery = require("../models/questions");
let clients = [];

function sendQuestionToAll(newQuestion, res) {
  clients.forEach((client) => client.res.write(`data: ${JSON.stringify(newQuestion)}\n\n`));

  return res.status(201).send({
    message: "Question created and sent successfully to connected peers",
    data: newQuestion,
  });
}

// eslint-disable-next-line consistent-return
const createQuestion = async (req, res) => {
  try {
    const questionId = crypto.randomUUID({ disableEntropyCache: true });
    const question = await questionQuery.createQuestion({ ...req.body, id: questionId });
    sendQuestionToAll(question, res);
  } catch (error) {
    logger.error(`Error while creating question: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

// eslint-disable-next-line consistent-return
const getQuestions = async (req, res) => {
  try {
    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    };

    res.writeHead(200, headers);

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
