import { expect } from "chai";
import sinon from "sinon";
import { CustomRequest, CustomResponse } from "../../../types/global";
const applicationsController = require("../../../controllers/applications");
const ApplicationModel = require("../../../models/applications");
const { API_RESPONSE_MESSAGES, APPLICATION_ERROR_MESSAGES } = require("../../../constants/application");

describe("nudgeApplication", () => {
  let req: Partial<CustomRequest>;
  let res: Partial<CustomResponse> & {
    json: sinon.SinonSpy;
    boom: {
      notFound: sinon.SinonSpy;
      unauthorized: sinon.SinonSpy;
      badRequest: sinon.SinonSpy;
      tooManyRequests: sinon.SinonSpy;
      badImplementation: sinon.SinonSpy;
    };
  };
  let jsonSpy: sinon.SinonSpy;
  let boomNotFound: sinon.SinonSpy;
  let boomUnauthorized: sinon.SinonSpy;
  let boomBadRequest: sinon.SinonSpy;
  let boomTooManyRequests: sinon.SinonSpy;
  let boomBadImplementation: sinon.SinonSpy;

  const mockApplicationId = "test-application-id-123";
  const mockUserId = "test-user-id-456";

  beforeEach(() => {
    jsonSpy = sinon.spy();
    boomNotFound = sinon.spy();
    boomUnauthorized = sinon.spy();
    boomBadRequest = sinon.spy();
    boomTooManyRequests = sinon.spy();
    boomBadImplementation = sinon.spy();

    req = {
      params: {
        applicationId: mockApplicationId,
      },
      userData: {
        id: mockUserId,
        username: "testuser",
      },
    };

    res = {
      json: jsonSpy,
      boom: {
        notFound: boomNotFound,
        unauthorized: boomUnauthorized,
        badRequest: boomBadRequest,
        tooManyRequests: boomTooManyRequests,
        badImplementation: boomBadImplementation,
      },
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Success cases", () => {
    it("should successfully nudge an application when no previous nudge exists", async () => {
      const mockResult = {
        status: "success",
        nudgeCount: 1,
        lastNudgeAt: new Date().toISOString(),
      };

      const nudgeApplicationStub = sinon.stub(ApplicationModel, "nudgeApplication").resolves(mockResult);

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(nudgeApplicationStub.calledOnce).to.be.true;
      expect(nudgeApplicationStub.firstCall.args[0]).to.deep.equal({
        applicationId: mockApplicationId,
        userId: mockUserId,
      });

      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.firstCall.args[0].message).to.equal(API_RESPONSE_MESSAGES.NUDGE_SUCCESS);
      expect(jsonSpy.firstCall.args[0].nudgeCount).to.equal(1);
      expect(jsonSpy.firstCall.args[0].lastNudgeAt).to.be.a("string");
    });

    it("should successfully nudge an application when 24 hours have passed since last nudge", async () => {
      const mockResult = {
        status: "success",
        nudgeCount: 3,
        lastNudgeAt: new Date().toISOString(),
      };

      const nudgeApplicationStub = sinon.stub(ApplicationModel, "nudgeApplication").resolves(mockResult);

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(nudgeApplicationStub.calledOnce).to.be.true;
      expect(nudgeApplicationStub.firstCall.args[0]).to.deep.equal({
        applicationId: mockApplicationId,
        userId: mockUserId,
      });

      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.firstCall.args[0].message).to.equal(API_RESPONSE_MESSAGES.NUDGE_SUCCESS);
      expect(jsonSpy.firstCall.args[0].nudgeCount).to.equal(3);
      expect(jsonSpy.firstCall.args[0].lastNudgeAt).to.be.a("string");
    });

    it("should increment nudgeCount correctly when nudgeCount is undefined", async () => {
      const mockResult = {
        status: "success",
        nudgeCount: 1,
        lastNudgeAt: new Date().toISOString(),
      };

      sinon.stub(ApplicationModel, "nudgeApplication").resolves(mockResult);

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.firstCall.args[0].nudgeCount).to.equal(1);
    });
  });

  describe("Error cases", () => {
    it("should return 404 when application is not found", async () => {
      const mockResult = {
        status: "notFound",
      };

      sinon.stub(ApplicationModel, "nudgeApplication").resolves(mockResult);

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(boomNotFound.calledOnce).to.be.true;
      expect(boomNotFound.firstCall.args[0]).to.equal("Application not found");
      expect(jsonSpy.notCalled).to.be.true;
    });

    it("should return 401 when user is not authorized (not the owner)", async () => {
      const mockResult = {
        status: "unauthorized",
      };

      sinon.stub(ApplicationModel, "nudgeApplication").resolves(mockResult);

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(boomUnauthorized.calledOnce).to.be.true;
      expect(boomUnauthorized.firstCall.args[0]).to.equal("You are not authorized to nudge this application");
      expect(jsonSpy.notCalled).to.be.true;
    });

    it("should return 429 when trying to nudge within 24 hours", async () => {
      const mockResult = {
        status: "tooSoon",
      };

      sinon.stub(ApplicationModel, "nudgeApplication").resolves(mockResult);

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(boomTooManyRequests.calledOnce).to.be.true;
      expect(boomTooManyRequests.firstCall.args[0]).to.equal(APPLICATION_ERROR_MESSAGES.NUDGE_TOO_SOON);
      expect(jsonSpy.notCalled).to.be.true;
    });

    it("should return 429 when trying to nudge exactly at 24 hours", async () => {
      const mockResult = {
        status: "tooSoon",
      };

      sinon.stub(ApplicationModel, "nudgeApplication").resolves(mockResult);

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(boomTooManyRequests.calledOnce).to.be.true;
      expect(boomTooManyRequests.firstCall.args[0]).to.equal(APPLICATION_ERROR_MESSAGES.NUDGE_TOO_SOON);
      expect(jsonSpy.notCalled).to.be.true;
    });

    it("should return 400 when trying to nudge an application that is not in pending status", async () => {
      const mockResult = {
        status: "notPending",
      };

      sinon.stub(ApplicationModel, "nudgeApplication").resolves(mockResult);

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(boomBadRequest.calledOnce).to.be.true;
      expect(boomBadRequest.firstCall.args[0]).to.equal(APPLICATION_ERROR_MESSAGES.NUDGE_ONLY_PENDING_ALLOWED);
      expect(jsonSpy.notCalled).to.be.true;
    });
  });
});

describe("submitApplicationFeedback", () => {
  let req: Partial<CustomRequest>;
  let res: Partial<CustomResponse> & {
    json: sinon.SinonSpy;
    boom: {
      notFound: sinon.SinonSpy;
      badImplementation: sinon.SinonSpy;
    };
  };
  let jsonSpy: sinon.SinonSpy;
  let boomNotFound: sinon.SinonSpy;
  let boomBadImplementation: sinon.SinonSpy;

  const mockApplicationId = "test-application-id-123";
  const mockUsername = "test-reviewer";

  beforeEach(() => {
    jsonSpy = sinon.spy();
    boomNotFound = sinon.spy();
    boomBadImplementation = sinon.spy();

    req = {
      params: {
        applicationId: mockApplicationId,
      },
      body: {
        status: "accepted",
      },
      userData: {
        id: "test-user-id",
        username: mockUsername,
      },
    };

    res = {
      json: jsonSpy,
      boom: {
        notFound: boomNotFound,
        badImplementation: boomBadImplementation,
      },
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Success cases", () => {
    it("should successfully submit feedback with status accepted", async () => {
      const mockResult = {
        status: "success",
      };

      const addApplicationFeedbackStub = sinon
        .stub(ApplicationModel, "addApplicationFeedback")
        .resolves(mockResult);

      await applicationsController.submitApplicationFeedback(req as CustomRequest, res as CustomResponse);

      expect(addApplicationFeedbackStub.calledOnce).to.be.true;
      expect(addApplicationFeedbackStub.firstCall.args[0]).to.deep.equal({
        applicationId: mockApplicationId,
        status: "accepted",
        feedback: undefined,
        reviewerName: mockUsername,
      });

      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.firstCall.args[0].message).to.equal(API_RESPONSE_MESSAGES.FEEDBACK_SUBMITTED_SUCCESS);
    });

    it("should successfully submit feedback with status rejected", async () => {
      req.body = { status: "rejected" };
      const mockResult = {
        status: "success",
      };

      sinon.stub(ApplicationModel, "addApplicationFeedback").resolves(mockResult);

      await applicationsController.submitApplicationFeedback(req as CustomRequest, res as CustomResponse);

      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.firstCall.args[0].message).to.equal(API_RESPONSE_MESSAGES.FEEDBACK_SUBMITTED_SUCCESS);
    });

    it("should successfully submit feedback with status changes_requested and feedback text", async () => {
      req.body = {
        status: "changes_requested",
        feedback: "Please update your skills section",
      };
      const mockResult = {
        status: "success",
      };

      const addApplicationFeedbackStub = sinon
        .stub(ApplicationModel, "addApplicationFeedback")
        .resolves(mockResult);

      await applicationsController.submitApplicationFeedback(req as CustomRequest, res as CustomResponse);

      expect(addApplicationFeedbackStub.calledOnce).to.be.true;
      expect(addApplicationFeedbackStub.firstCall.args[0]).to.deep.equal({
        applicationId: mockApplicationId,
        status: "changes_requested",
        feedback: "Please update your skills section",
        reviewerName: mockUsername,
      });

      expect(jsonSpy.calledOnce).to.be.true;
    });

    it("should successfully submit feedback with optional feedback text for accepted status", async () => {
      req.body = {
        status: "accepted",
        feedback: "Great application!",
      };
      const mockResult = {
        status: "success",
      };

      sinon.stub(ApplicationModel, "addApplicationFeedback").resolves(mockResult);

      await applicationsController.submitApplicationFeedback(req as CustomRequest, res as CustomResponse);

      expect(jsonSpy.calledOnce).to.be.true;
    });

    it("should handle empty feedback string", async () => {
      req.body = {
        status: "accepted",
        feedback: "",
      };
      const mockResult = {
        status: "success",
      };

      sinon.stub(ApplicationModel, "addApplicationFeedback").resolves(mockResult);

      await applicationsController.submitApplicationFeedback(req as CustomRequest, res as CustomResponse);

      expect(jsonSpy.calledOnce).to.be.true;
    });
  });
});
