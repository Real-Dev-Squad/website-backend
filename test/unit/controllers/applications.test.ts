import { expect } from "chai";
import sinon from "sinon";
import { CustomRequest, CustomResponse } from "../../../types/global";
const applicationsController = require("../../../controllers/applications");
const ApplicationModel = require("../../../models/applications");
const { API_RESPONSE_MESSAGES, APPLICATION_ERROR_MESSAGES } = require("../../../constants/application");
const { convertDaysToMilliseconds } = require("../../../utils/time");

describe("nudgeApplication", () => {
  let req: Partial<CustomRequest>;
  let res: Partial<CustomResponse> & {
    json: sinon.SinonSpy;
    boom: {
      notFound: sinon.SinonSpy;
      unauthorized: sinon.SinonSpy;
      tooManyRequests: sinon.SinonSpy;
      badImplementation: sinon.SinonSpy;
    };
  };
  let jsonSpy: sinon.SinonSpy;
  let boomNotFound: sinon.SinonSpy;
  let boomUnauthorized: sinon.SinonSpy;
  let boomTooManyRequests: sinon.SinonSpy;
  let boomBadImplementation: sinon.SinonSpy;

  const mockApplicationId = "test-application-id-123";
  const mockUserId = "test-user-id-456";
  const mockOtherUserId = "other-user-id-789";

  beforeEach(() => {
    jsonSpy = sinon.spy();
    boomNotFound = sinon.spy();
    boomUnauthorized = sinon.spy();
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
      const mockApplication = {
        id: mockApplicationId,
        userId: mockUserId,
        notFound: false,
        lastNudgeAt: null,
        nudgeCount: 0,
      };

      const getApplicationByIdStub = sinon.stub(ApplicationModel, "getApplicationById").resolves(mockApplication);
      const updateApplicationStub = sinon.stub(ApplicationModel, "updateApplication").resolves();

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(getApplicationByIdStub.calledOnce).to.be.true;
      expect(getApplicationByIdStub.calledWith(mockApplicationId)).to.be.true;
      expect(updateApplicationStub.calledOnce).to.be.true;

      const updateData = updateApplicationStub.firstCall.args[0];
      expect(updateData.nudgeCount).to.equal(1);
      expect(updateData.lastNudgeAt).to.be.a("string");
      expect(new Date(updateData.lastNudgeAt).getTime()).to.be.closeTo(Date.now(), 1000);

      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.firstCall.args[0].message).to.equal(API_RESPONSE_MESSAGES.NUDGE_SUCCESS);
      expect(jsonSpy.firstCall.args[0].nudgeCount).to.equal(1);
      expect(jsonSpy.firstCall.args[0].lastNudgeAt).to.be.a("string");
    });

    it("should successfully nudge an application when 24 hours have passed since last nudge", async () => {
      const twentyFourHoursAgo = new Date(Date.now() - convertDaysToMilliseconds(1) - 1000).toISOString();
      const mockApplication = {
        id: mockApplicationId,
        userId: mockUserId,
        notFound: false,
        lastNudgeAt: twentyFourHoursAgo,
        nudgeCount: 2,
      };

      const getApplicationByIdStub = sinon.stub(ApplicationModel, "getApplicationById").resolves(mockApplication);
      const updateApplicationStub = sinon.stub(ApplicationModel, "updateApplication").resolves();

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(getApplicationByIdStub.calledOnce).to.be.true;
      expect(getApplicationByIdStub.calledWith(mockApplicationId)).to.be.true;
      expect(updateApplicationStub.calledOnce).to.be.true;

      const updateData = updateApplicationStub.firstCall.args[0];
      expect(updateData.nudgeCount).to.equal(3);
      expect(updateData.lastNudgeAt).to.be.a("string");

      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.firstCall.args[0].message).to.equal(API_RESPONSE_MESSAGES.NUDGE_SUCCESS);
      expect(jsonSpy.firstCall.args[0].nudgeCount).to.equal(3);
    });

    it("should increment nudgeCount correctly when nudgeCount is undefined", async () => {
      const mockApplication = {
        id: mockApplicationId,
        userId: mockUserId,
        notFound: false,
        lastNudgeAt: null,
        nudgeCount: undefined,
      };

      sinon.stub(ApplicationModel, "getApplicationById").resolves(mockApplication);
      const updateApplicationStub = sinon.stub(ApplicationModel, "updateApplication").resolves();

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      const updateData = updateApplicationStub.firstCall.args[0];
      expect(updateData.nudgeCount).to.equal(1);
    });
  });

  describe("Error cases", () => {
    it("should return 404 when application is not found", async () => {
      const mockApplication = {
        notFound: true,
      };

      sinon.stub(ApplicationModel, "getApplicationById").resolves(mockApplication);

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(boomNotFound.calledOnce).to.be.true;
      expect(boomNotFound.firstCall.args[0]).to.equal("Application not found");
      expect(jsonSpy.notCalled).to.be.true;
    });

    it("should return 401 when user is not authorized (not the owner)", async () => {
      const mockApplication = {
        id: mockApplicationId,
        userId: mockOtherUserId,
        notFound: false,
        lastNudgeAt: null,
        nudgeCount: 0,
      };

      sinon.stub(ApplicationModel, "getApplicationById").resolves(mockApplication);

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(boomUnauthorized.calledOnce).to.be.true;
      expect(boomUnauthorized.firstCall.args[0]).to.equal("You are not authorized to nudge this application");
      expect(jsonSpy.notCalled).to.be.true;
    });

    it("should return 429 when trying to nudge within 24 hours", async () => {
      const oneHourAgo = new Date(Date.now() - convertDaysToMilliseconds(1) / 24).toISOString();
      const mockApplication = {
        id: mockApplicationId,
        userId: mockUserId,
        notFound: false,
        lastNudgeAt: oneHourAgo,
        nudgeCount: 1,
      };

      sinon.stub(ApplicationModel, "getApplicationById").resolves(mockApplication);

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(boomTooManyRequests.calledOnce).to.be.true;
      expect(boomTooManyRequests.firstCall.args[0]).to.equal(APPLICATION_ERROR_MESSAGES.NUDGE_TOO_SOON);
      expect(jsonSpy.notCalled).to.be.true;
    });

    it("should return 429 when trying to nudge exactly at 24 hours", async () => {
      const exactlyTwentyFourHoursAgo = new Date(Date.now() - convertDaysToMilliseconds(1)).toISOString();
      const mockApplication = {
        id: mockApplicationId,
        userId: mockUserId,
        notFound: false,
        lastNudgeAt: exactlyTwentyFourHoursAgo,
        nudgeCount: 1,
      };

      sinon.stub(ApplicationModel, "getApplicationById").resolves(mockApplication);

      await applicationsController.nudgeApplication(req as CustomRequest, res as CustomResponse);

      expect(boomTooManyRequests.calledOnce).to.be.true;
      expect(boomTooManyRequests.firstCall.args[0]).to.equal(APPLICATION_ERROR_MESSAGES.NUDGE_TOO_SOON);
      expect(jsonSpy.notCalled).to.be.true;
    });
  });
});
