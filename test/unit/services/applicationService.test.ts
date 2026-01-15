import { expect } from "chai";
import sinon from "sinon";
import { Conflict } from "http-errors";
import * as applicationService from "../../../services/applicationService";
import { applicationPayload } from "../../../types/application";
const ApplicationModel = require("../../../models/applications");
const logger = require("../../../utils/logger");
const {
  APPLICATION_STATUS_TYPES,
  APPLICATION_ERROR_MESSAGES,
  APPLICATION_REVIEW_CYCLE_START_DATE,
} = require("../../../constants/application");
const applicationsData = require("../../fixtures/applications/applications")();

describe("createApplicationService", () => {
  const mockUserId = "test-user-id-123";
  const mockApplicationId = "mock-application-id-456";

  const mockPayload: applicationPayload = {
    ...applicationsData[6],
    imageUrl: "https://example.com/image.jpg",
  };

  afterEach(() => {
    sinon.restore();
  });

  describe("Date-based application creation logic", () => {
    it("should create application successfully when existing application was created before Jan 1, 2026", async () => {
      const existingApplication = {
        id: "existing-app-id",
        userId: mockUserId,
        createdAt: "2025-12-31T23:59:59.999Z",
        status: "pending",
      };

      const getUserApplicationsStub = sinon
        .stub(ApplicationModel, "getUserApplications")
        .resolves([existingApplication]);

      const addApplicationStub = sinon.stub(ApplicationModel, "addApplication").resolves(mockApplicationId);

      const result = await applicationService.createApplicationService({
        userId: mockUserId,
        payload: mockPayload,
      });

      expect(result).to.have.property("applicationId", mockApplicationId);
      expect(result).to.have.property("isNew", true);
      expect(getUserApplicationsStub.calledOnce).to.be.true;
      expect(addApplicationStub.calledOnce).to.be.true;

      const applicationData = addApplicationStub.getCall(0).args[0];
      expect(applicationData).to.have.property("isNew", true);
    });

    it("should throw Conflict error when existing application was created after Jan 1, 2026", async () => {
      const existingApplication = {
        id: "existing-app-id",
        userId: mockUserId,
        createdAt: "2026-01-01T00:00:00.001Z",
        status: "pending",
      };

      const getUserApplicationsStub = sinon
        .stub(ApplicationModel, "getUserApplications")
        .resolves([existingApplication]);

      const addApplicationStub = sinon.stub(ApplicationModel, "addApplication").resolves(mockApplicationId);

      try {
        await applicationService.createApplicationService({
          userId: mockUserId,
          payload: mockPayload,
        });
        expect.fail("Should have thrown Conflict error");
      } catch (err) {
        expect(err).to.be.instanceOf(Conflict);
        expect(err.message).to.equal(APPLICATION_ERROR_MESSAGES.APPLICATION_ALREADY_REVIEWED);
        expect(getUserApplicationsStub.calledOnce).to.be.true;
        expect(addApplicationStub.called).to.be.false;
      }
    });

    it("should create application successfully when existing application was created exactly on Jan 1, 2026 (boundary case)", async () => {
      const existingApplication = {
        id: "existing-app-id",
        userId: mockUserId,
        createdAt: APPLICATION_REVIEW_CYCLE_START_DATE.toISOString(),
        status: "pending",
      };

      const getUserApplicationsStub = sinon
        .stub(ApplicationModel, "getUserApplications")
        .resolves([existingApplication]);

      const addApplicationStub = sinon.stub(ApplicationModel, "addApplication").resolves(mockApplicationId);

      const result = await applicationService.createApplicationService({
        userId: mockUserId,
        payload: mockPayload,
      });

      expect(result).to.have.property("applicationId", mockApplicationId);
      expect(result).to.have.property("isNew", true);
      expect(getUserApplicationsStub.calledOnce).to.be.true;
      expect(addApplicationStub.calledOnce).to.be.true;
    });

    it("should create application successfully when no existing application exists", async () => {
      const getUserApplicationsStub = sinon.stub(ApplicationModel, "getUserApplications").resolves([]);

      const addApplicationStub = sinon.stub(ApplicationModel, "addApplication").resolves(mockApplicationId);

      const result = await applicationService.createApplicationService({
        userId: mockUserId,
        payload: mockPayload,
      });

      expect(result).to.have.property("applicationId", mockApplicationId);
      expect(result).to.have.property("isNew", true);
      expect(getUserApplicationsStub.calledOnce).to.be.true;
      expect(addApplicationStub.calledOnce).to.be.true;

      const applicationData = addApplicationStub.getCall(0).args[0];
      expect(applicationData).to.have.property("isNew", true);
    });
  });

  describe("isNew field verification", () => {
    it("should set isNew field to true in the application data saved to database", async () => {
      const getUserApplicationsStub = sinon.stub(ApplicationModel, "getUserApplications").resolves([]);

      const addApplicationStub = sinon.stub(ApplicationModel, "addApplication").resolves(mockApplicationId);

      await applicationService.createApplicationService({
        userId: mockUserId,
        payload: mockPayload,
      });

      const applicationData = addApplicationStub.getCall(0).args[0];
      expect(applicationData.isNew).to.equal(true);
      expect(applicationData.score).to.equal(0);
      expect(applicationData.status).to.equal(APPLICATION_STATUS_TYPES.PENDING);
      expect(applicationData.nudgeCount).to.equal(0);
    });

    it("should set isNew field to true even when existing application exists before Jan 1, 2026", async () => {
      const existingApplication = {
        id: "existing-app-id",
        userId: mockUserId,
        createdAt: "2025-06-15T10:30:00.000Z",
        status: "rejected",
      };

      sinon.stub(ApplicationModel, "getUserApplications").resolves([existingApplication]);

      const addApplicationStub = sinon.stub(ApplicationModel, "addApplication").resolves(mockApplicationId);

      await applicationService.createApplicationService({
        userId: mockUserId,
        payload: mockPayload,
      });

      const applicationData = addApplicationStub.getCall(0).args[0];
      expect(applicationData.isNew).to.equal(true);
    });
  });

  describe("Field transformation and mapping", () => {
    it("should correctly transform payload fields to application structure", async () => {
      sinon.stub(ApplicationModel, "getUserApplications").resolves([]);

      const addApplicationStub = sinon.stub(ApplicationModel, "addApplication").resolves(mockApplicationId);

      await applicationService.createApplicationService({
        userId: mockUserId,
        payload: mockPayload,
      });

      const applicationData = addApplicationStub.getCall(0).args[0];

      expect(applicationData.userId).to.equal(mockUserId);
      expect(applicationData.biodata.firstName).to.equal(mockPayload.firstName);
      expect(applicationData.biodata.lastName).to.equal(mockPayload.lastName);
      expect(applicationData.location.city).to.equal(mockPayload.city);
      expect(applicationData.location.state).to.equal(mockPayload.state);
      expect(applicationData.location.country).to.equal(mockPayload.country);
      expect(applicationData.professional.institution).to.equal(mockPayload.college);
      expect(applicationData.professional.skills).to.equal(mockPayload.skills);
      expect(applicationData.intro.introduction).to.equal(mockPayload.introduction);
      expect(applicationData.intro.funFact).to.equal(mockPayload.funFact);
      expect(applicationData.intro.forFun).to.equal(mockPayload.forFun);
      expect(applicationData.intro.whyRds).to.equal(mockPayload.whyRds);
      expect(applicationData.intro.numberOfHours).to.equal(mockPayload.numberOfHours);
      expect(applicationData.foundFrom).to.equal(mockPayload.foundFrom);
      expect(applicationData.role).to.equal(mockPayload.role);
      expect(applicationData.imageUrl).to.equal(mockPayload.imageUrl);
      if (mockPayload.socialLink) {
        expect(applicationData.socialLink).to.deep.equal(mockPayload.socialLink);
      }
    });

    it("should handle optional field (socialLink) when not provided", async () => {
      const payloadWithoutSocialLink: applicationPayload = {
        ...mockPayload,
        socialLink: undefined,
      };

      sinon.stub(ApplicationModel, "getUserApplications").resolves([]);

      const addApplicationStub = sinon.stub(ApplicationModel, "addApplication").resolves(mockApplicationId);

      await applicationService.createApplicationService({
        userId: mockUserId,
        payload: payloadWithoutSocialLink,
      });

      const applicationData = addApplicationStub.getCall(0).args[0];

      expect(applicationData).to.have.property("imageUrl", mockPayload.imageUrl);
      expect(applicationData).to.not.have.property("socialLink");
      expect(applicationData.biodata.firstName).to.equal(mockPayload.firstName);
      expect(applicationData.foundFrom).to.equal(mockPayload.foundFrom);
    });

    it("should include createdAt timestamp in the application data", async () => {
      sinon.stub(ApplicationModel, "getUserApplications").resolves([]);

      const addApplicationStub = sinon.stub(ApplicationModel, "addApplication").resolves(mockApplicationId);

      const beforeCreation = new Date().toISOString();

      await applicationService.createApplicationService({
        userId: mockUserId,
        payload: mockPayload,
      });

      const afterCreation = new Date().toISOString();

      const applicationData = addApplicationStub.getCall(0).args[0];
      expect(applicationData.createdAt).to.exist;
      expect(applicationData.createdAt).to.be.a("string");
      expect(applicationData.createdAt >= beforeCreation).to.be.true;
      expect(applicationData.createdAt <= afterCreation).to.be.true;
    });
  });

  describe("Error handling", () => {
    it("should propagate Conflict errors without modification", async () => {
      const existingApplication = {
        id: "existing-app-id",
        userId: mockUserId,
        createdAt: "2026-06-15T10:30:00.000Z",
        status: "pending",
      };

      sinon.stub(ApplicationModel, "getUserApplications").resolves([existingApplication]);

      try {
        await applicationService.createApplicationService({
          userId: mockUserId,
          payload: mockPayload,
        });
        expect.fail("Should have thrown Conflict error");
      } catch (err) {
        expect(err).to.be.instanceOf(Conflict);
        expect(err.message).to.equal(APPLICATION_ERROR_MESSAGES.APPLICATION_ALREADY_REVIEWED);
      }
    });

    it("should log and re-throw non-Conflict errors", async () => {
      const testError = new Error("Database connection failed");
      const loggerErrorStub = sinon.stub(logger, "error");

      sinon.stub(ApplicationModel, "getUserApplications").rejects(testError);

      try {
        await applicationService.createApplicationService({
          userId: mockUserId,
          payload: mockPayload,
        });
        expect.fail("Should have thrown error");
      } catch (err) {
        expect(err).to.equal(testError);
        expect(loggerErrorStub.calledOnce).to.be.true;
        expect(loggerErrorStub.getCall(0).args[0]).to.equal("Error in createApplicationService");
        expect(loggerErrorStub.getCall(0).args[1]).to.equal(testError);
      }
    });

    it("should handle errors from addApplication and log them", async () => {
      const testError = new Error("Failed to save application");
      const loggerErrorStub = sinon.stub(logger, "error");

      sinon.stub(ApplicationModel, "getUserApplications").resolves([]);
      sinon.stub(ApplicationModel, "addApplication").rejects(testError);

      try {
        await applicationService.createApplicationService({
          userId: mockUserId,
          payload: mockPayload,
        });
        expect.fail("Should have thrown error");
      } catch (err) {
        expect(err).to.equal(testError);
        expect(loggerErrorStub.calledOnce).to.be.true;
        expect(loggerErrorStub.getCall(0).args[0]).to.equal("Error in createApplicationService");
        expect(loggerErrorStub.getCall(0).args[1]).to.equal(testError);
      }
    });
  });
});
