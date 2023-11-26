import chai, { expect } from "chai";
import chaiHttp from "chai-http";
const sinon = require("sinon");

const app = require("../../server");
const cleanDb = require("../utils/cleanDb");

const answerDataArray = require("../fixtures/answers/answers");
const answerQuery = require("../../models/answers");

chai.use(chaiHttp);

describe("answers", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("POST answers - createAnswer", function () {
    afterEach(function () {
      sinon.restore();
    });

    it("should return 500 if server fails to process the request", function (done) {
      sinon.stub(answerQuery, "createAnswer").throws(new Error());

      chai
        .request(app)
        .post("/answers")
        .send(answerDataArray[1])
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(500);
          expect(response.body.message).to.equal("An internal server error occurred");

          return done();
        });
    });

    it("should create and return answer", function (done) {
      sinon.stub(answerQuery, "createAnswer").returns(answerDataArray[2]);

      chai
        .request(app)
        .post("/answers")
        .send(answerDataArray[1])
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(201);
          expect(response.body.data.id).to.equal("dummy-answer-id-2");

          Object.keys(answerDataArray[2]).forEach((key) => {
            expect(response.body.data[key]).to.equal(answerDataArray[2][key]);
          });
          return done();
        });
    });
  });
});
