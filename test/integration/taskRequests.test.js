const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const tasksModel = require("../../models/tasks");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const userData = require("../fixtures/user/user")();
const taskData = require("../fixtures/tasks/tasks")();
chai.use(chaiHttp);

const config = require("config");
const cookieName = config.get("userToken.cookieName");

let jwt;
let taskId;

const member = userData[0];
// const superUser = userData[4];

describe("Task Requests", function () {
  let userId;
  before(async function () {
    userId = await addUser(member);
    jwt = authService.generateAuthToken({ userId });
    // superUserJwt = authService.generateAuthToken({ userId: superUserId });

    taskId = (await tasksModel.updateTask(taskData[4])).taskId;
  });

  after(async function () {
    await cleanDb();
  });

  afterEach(async function () {
    sinon.restore();
  });

  describe("PUT /taskRequests/create - creates a new task", function () {
    it("Should matches response on success", function (done) {
      chai
        .request(app)
        .put("/taskRequests/create")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          taskId,
          userId,
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(201);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Task request created successfully");
          expect(res.body.taskRequest).to.be.a("object");
          return done();
        });
    });
  });
});
