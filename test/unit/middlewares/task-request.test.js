const Sinon = require("sinon");
const { expect } = require("chai");
const { postTaskRequests, getTaskRequests } = require("../../../middlewares/validators/task-requests");
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
  describe("getTaskRequests | Validator", function () {
    it("should pass the request when no values for query params are passed", async function () {
      const req = { query: {} };
      const res = {};
      const nextMiddlewareSpy = Sinon.spy();
      await getTaskRequests(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(1);
    });
    it("should pass validation for valid query parameters", async function () {
      const req = {
        query: {
          q: "status:approved",
        },
      };
      const res = {};
      const nextMiddlewareSpy = Sinon.spy();
      await getTaskRequests(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(1);
    });
    it("should pass validation for valid query parameters with multiple keys and values", async function () {
      const req = {
        query: {
          q: "status:approved request-type:assignment",
        },
      };
      const res = {};
      const nextMiddlewareSpy = Sinon.spy();
      await getTaskRequests(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(1);
    });
    it("should pass validation for valid sort query parameters", async function () {
      const req = {
        query: {
          q: "sort:created-desc",
        },
      };
      const res = {};
      const nextMiddlewareSpy = Sinon.spy();
      await getTaskRequests(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(1);
    });
    it("should pass validation for all valid query parameters", async function () {
      const req = {
        query: {
          dev: "true",
          next: "id",
          size: "20",
          q: "status:pending request-type:creation status:denied sort:created-desc",
        },
      };
      const res = {};
      const nextMiddlewareSpy = Sinon.spy();
      await getTaskRequests(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(1);
    });
    it("should not pass validation when next and prev are passed together", async function () {
      const req = {
        query: {
          next: "value",
          prev: "value",
        },
      };
      const res = {
        boom: {
          badRequest: Sinon.spy(),
        },
      };
      const nextMiddlewareSpy = Sinon.spy();
      await getTaskRequests(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(0);
      expect(res.boom.badRequest.callCount).to.be.equal(1);
    });
    it("should not pass validation when next is passed without size", async function () {
      const req = {
        query: {
          next: "value",
        },
      };
      const res = {
        boom: {
          badRequest: Sinon.spy(),
        },
      };
      const nextMiddlewareSpy = Sinon.spy();
      await getTaskRequests(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(0);
      expect(res.boom.badRequest.callCount).to.be.equal(1);
    });
    it("should not pass validation when prev is passed without size", async function () {
      const req = {
        query: {
          prev: "value",
        },
      };
      const res = {
        boom: {
          badRequest: Sinon.spy(),
        },
      };
      const nextMiddlewareSpy = Sinon.spy();
      await getTaskRequests(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(0);
      expect(res.boom.badRequest.callCount).to.be.equal(1);
    });
    it("should not pass validation for invalid query parameters", async function () {
      const req = {
        query: {
          invalidParam: "value",
        },
      };
      const res = {
        boom: {
          badRequest: Sinon.spy(),
        },
      };
      const nextMiddlewareSpy = Sinon.spy();
      await getTaskRequests(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(0);
      expect(res.boom.badRequest.callCount).to.be.equal(1);
    });
    it("should not pass validation for invalid query parameters in RQL format", async function () {
      const req = {
        query: {
          q: "invalidKey:value",
        },
      };
      const res = {
        boom: {
          badRequest: Sinon.spy(),
        },
      };
      const nextMiddlewareSpy = Sinon.spy();
      await getTaskRequests(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(0);
      expect(res.boom.badRequest.callCount).to.be.equal(1);
    });
    it("should not pass validation for invalid sort query parameters", async function () {
      const req = {
        query: {
          q: "status:approved sort:af:sdv",
        },
      };
      const res = {
        boom: {
          badRequest: Sinon.spy(),
        },
      };
      const nextMiddlewareSpy = Sinon.spy();
      await getTaskRequests(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(0);
      expect(res.boom.badRequest.callCount).to.be.equal(1);
    });
  });
});
