const Sinon = require("sinon");
const { expect } = require("chai");
const { postTaskRequests } = require("../../../middlewares/validators/task-requests");
const data = require("../../fixtures/task-requests/task-requests");
describe("Middleware | Validators | Task Requests", function () {
  describe("postTaskRequests", function () {
    describe("Task Assignment Requests", function () {
      it("should not throw error when valid request body is passed", async function () {
        const req = {
          body: data.validAssignmentRequest,
        };
        const res = {};
        const nextSpy = Sinon.spy();
        await postTaskRequests(req, res, nextSpy);
        expect(nextSpy.calledOnce).to.be.equal(true);
      });
      it("should not throw error when valid request body with description is passed", async function () {
        const req = {
          body: data.assignmentReqWithDescription,
        };
        const res = {};
        const nextSpy = Sinon.spy();
        await postTaskRequests(req, res, nextSpy);
        expect(nextSpy.calledOnce).to.be.equal(true);
      });
      it("should not throw error when valid request body without external issue id is passed", async function () {
        const req = {
          body: data.assignmentReqWithoutExtIssueId,
        };
        const res = {};
        const nextSpy = Sinon.spy();
        await postTaskRequests(req, res, nextSpy);
        expect(nextSpy.calledOnce).to.be.equal(true);
      });
      it("should throw error when request body without proposed deadline is passed", async function () {
        const req = {
          body: data.assignmentReqWithoutProposedDeadline,
        };
        const badRequestSpy = Sinon.spy();
        const res = {
          boom: {
            badRequest: badRequestSpy,
          },
        };
        const nextSpy = Sinon.spy();
        await postTaskRequests(req, res, nextSpy);
        expect(badRequestSpy.calledOnce).to.be.equal(true);
        expect(nextSpy.callCount).to.be.equal(0);
      });
      it("should throw error when request body without task id is passed", async function () {
        const req = {
          body: data.assignmentReqWithoutTaskId,
        };
        const badRequestSpy = Sinon.spy();
        const res = {
          boom: {
            badRequest: badRequestSpy,
          },
        };
        const nextSpy = Sinon.spy();
        await postTaskRequests(req, res, nextSpy);
        expect(badRequestSpy.calledOnce).to.be.equal(true);
        expect(nextSpy.callCount).to.be.equal(0);
      });
      it("should throw error when request body without used id is passed", async function () {
        const req = {
          body: data.assignmentReqWithoutUserId,
        };
        const badRequestSpy = Sinon.spy();
        const res = {
          boom: {
            badRequest: badRequestSpy,
          },
        };
        const nextSpy = Sinon.spy();
        await postTaskRequests(req, res, nextSpy);
        expect(badRequestSpy.calledOnce).to.be.equal(true);
        expect(nextSpy.callCount).to.be.equal(0);
      });
    });
    describe("Task Creation Requests", function () {
      it("should not throw error when valid request body is passed", async function () {
        const req = {
          body: data.validCreationRequest,
        };
        const res = {};
        const nextSpy = Sinon.spy();
        await postTaskRequests(req, res, nextSpy);
        expect(nextSpy.calledOnce).to.be.equal(true);
      });
      it("should not throw error when valid request body with description is passed", async function () {
        const req = {
          body: data.creationReqWithDescription,
        };
        const res = {};
        const nextSpy = Sinon.spy();
        await postTaskRequests(req, res, nextSpy);
        expect(nextSpy.calledOnce).to.be.equal(true);
      });
      it("should throw error when request body without external issue id is passed", async function () {
        const req = {
          body: data.creationReqWithoutExtIssueId,
        };
        const badRequestSpy = Sinon.spy();
        const res = {
          boom: {
            badRequest: badRequestSpy,
          },
        };
        const nextSpy = Sinon.spy();
        await postTaskRequests(req, res, nextSpy);
        expect(badRequestSpy.calledOnce).to.be.equal(true);
        expect(nextSpy.callCount).to.be.equal(0);
      });
      it("should throw error when request body without proposed deadline is passed", async function () {
        const req = {
          body: data.creationReqWithoutProposedDeadline,
        };
        const badRequestSpy = Sinon.spy();
        const res = {
          boom: {
            badRequest: badRequestSpy,
          },
        };
        const nextSpy = Sinon.spy();
        await postTaskRequests(req, res, nextSpy);
        expect(badRequestSpy.calledOnce).to.be.equal(true);
        expect(nextSpy.callCount).to.be.equal(0);
      });
      it("should  throw error when request body with task id is passed", async function () {
        const req = {
          body: data.creationReqWithTaskId,
        };
        const badRequestSpy = Sinon.spy();
        const res = {
          boom: {
            badRequest: badRequestSpy,
          },
        };
        const nextSpy = Sinon.spy();
        await postTaskRequests(req, res, nextSpy);
        expect(badRequestSpy.calledOnce).to.be.equal(true);
        expect(nextSpy.callCount).to.be.equal(0);
      });
      it("should throw error when request body without used id is passed", async function () {
        const req = {
          body: data.creationReqWithoutUserId,
        };
        const badRequestSpy = Sinon.spy();
        const res = {
          boom: {
            badRequest: badRequestSpy,
          },
        };
        const nextSpy = Sinon.spy();
        await postTaskRequests(req, res, nextSpy);
        expect(badRequestSpy.calledOnce).to.be.equal(true);
        expect(nextSpy.callCount).to.be.equal(0);
      });
    });
    it("should throw error when invalid request body is passed", async function () {
      const req = {
        body: data.invalidRequest,
      };
      const badRequestSpy = Sinon.spy();
      const res = {
        boom: {
          badRequest: badRequestSpy,
        },
      };
      const nextSpy = Sinon.spy();
      await postTaskRequests(req, res, nextSpy);
      expect(badRequestSpy.calledOnce).to.be.equal(true);
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });
});
