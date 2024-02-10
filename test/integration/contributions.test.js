/* eslint-disable no-unused-expressions */
const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const chaiHttp = require("chai-http");

const githubService = require("../../services/githubService");
const testModel = require("../../models/tasks");
const userModel = require("../../models/users");

const app = require("../../server");

chai.use(chaiHttp);

// Import fixtures
const githubPRInfo = require("../fixtures/contributions/githubPRInfo")();

describe("Contributions", function () {
  before(async function () {
    const user = {
      first_name: "Prakash",
      last_name: "C",
      yoe: 0,
      img: "./img.png",
      github_id: "prakashchoudhary07",
      username: "prakash",
    };
    // Adding user
    await userModel.addOrUpdate(user);
    // Creating second user
    user.username = "userWithNoPrs";
    user.github_id = "userWithNoPrs";
    await userModel.addOrUpdate(user);
    // Creating second user
    user.username = "userNoTask";
    user.github_id = "userNoTask";
    await userModel.addOrUpdate(user);
    //  Creating task for user
    const task = {
      title: "Task for contribution (GET contributions/:username API)",
      purpose: "To Test mocha",
      featureUrl: "<testUrl>",
      type: "Dev | Group",
      links: ["https://github.com/Real-Dev-Squad/website-backend/pull/145"],
      endsOn: "1613798827750",
      startedOn: "1613698827750",
      status: "Active",
      percentCompleted: 10,
      dependsOn: ["Depends on task 2"],
      participants: ["prakash"],
      completionAward: { gold: 3, bronze: 300 },
      lossRate: { gold: 1 },
      isNoteworthy: true,
    };
    await testModel.updateTask(task);
    // Creating second task
    task.links = ["https://github.com/Real-Dev-Squad/website-backend/pull/83"];
    task.isNoteworthy = false;
    await testModel.updateTask(task);
  });
  afterEach(function () {
    sinon.restore();
  });
  describe("GET /contributions/{username}", function () {
    it("Should get all the contributions of the user", function (done) {
      sinon.stub(githubService, "fetchPRsByUser").returns(githubPRInfo.prakash);
      chai
        .request(app)
        .get("/contributions/prakash")
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.noteworthy).to.be.a("array");
          expect(res.body.all).to.be.a("array");
          const [noteworthyObj] = res.body.noteworthy;
          expect(noteworthyObj).to.contain.keys("task", "prList");
          expect(noteworthyObj.task.isNoteworthy).to.be.true;
          expect(noteworthyObj.task).to.have.all.keys(
            "dependsOn",
            "endsOn",
            "featureUrl",
            "isNoteworthy",
            "participants",
            "purpose",
            "startedOn",
            "status",
            "title",
            "id"
          );
          expect(noteworthyObj.prList[0]).to.have.all.keys(
            "title",
            "state",
            "url",
            "createdAt",
            "updatedAt",
            "raisedBy"
          );
          const [noteworthyObj2] = res.body.all;
          expect(noteworthyObj2).to.contain.keys("task", "prList");
          expect(noteworthyObj2.task.isNoteworthy).to.be.false;
          return done();
        });
    });
    it("Should respond 404 for unregistered user", function (done) {
      chai
        .request(app)
        .get("/contributions/prakashchoudhary")
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User doesn't exist");
          return done();
        });
    });
    it("Should respond empty object when user has no pr and task available", function (done) {
      sinon.stub(githubService, "fetchPRsByUser").returns(githubPRInfo.userWithNoPrs);
      chai
        .request(app)
        .get("/contributions/userWithNoPrs")
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.noteworthy).to.be.a("array").that.is.empty;
          expect(res.body.all).to.be.a("array").that.is.empty;
          return done();
        });
    });

    it("Should respond with all data, noteworthy to be empty", function (done) {
      sinon.stub(githubService, "fetchPRsByUser").returns(githubPRInfo.userNoTask);
      chai
        .request(app)
        .get("/contributions/userNoTask")
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.noteworthy).to.be.a("array").that.is.empty;
          expect(res.body.all).to.be.a("array");
          const [prdata] = res.body.all;
          expect(prdata).to.contain.keys("task", "prList");
          expect(prdata.task).to.be.empty;
          expect(prdata.prList[0]).to.have.all.keys("title", "state", "url", "createdAt", "updatedAt", "raisedBy");
          return done();
        });
    });
  });
});
