import chai from "chai";
const { expect } = chai;
const cleanDb = require("../../utils/cleanDb");
const applicationsData = require("../../fixtures/applications/applications")();
const ApplicationModel = require("../../../models/applications");

describe("applications", function () {
  let applicationId1: string,
    applicationId2: string,
    applicationId3: string,
    applicationId4: string,
    applicationId5: string;

  before(async () => {
    const applicationOne = { ...applicationsData[0], userId: "faksdjfkdfjdkfjksdfkj" };
    const applicationTwo = { ...applicationsData[1], userId: "ffksadfjkdfjsdfksdfkd" };
    const applicationThree = { ...applicationsData[2], userId: "fakfjdkfjkfasjdkfsjdkf" };
    const applicationFour = { ...applicationsData[3], userId: "fkasdjfkldjfldjkfalsdfjl" };
    const applicationFive = { ...applicationsData[4], userId: "kfasdjfkdlfjkasdjflsdjfk" };

    const promises = [
      ApplicationModel.addApplication(applicationOne),
      ApplicationModel.addApplication(applicationTwo),
      ApplicationModel.addApplication(applicationThree),
      ApplicationModel.addApplication(applicationFour),
      ApplicationModel.addApplication(applicationFive),
    ];
    const [id1, id2, id3, id4, id5] = await Promise.all(promises);
    applicationId1 = id1;
    applicationId2 = id2;
    applicationId3 = id3;
    applicationId4 = id4;
    applicationId5 = id5;
  });

  after(async () => {
    await cleanDb();
  });

  describe("getAllApplications", function () {
    it("should return the same number of applications as per limit, and last doc id", async function () {
      const { applications, lastDocId } = await ApplicationModel.getAllApplications(5);

      expect(applications).to.be.a("array");
      expect(applications.length).to.be.equal(5);
      expect(lastDocId).to.exist;
    });
  });

  describe("getUserApplications", function () {
    it("should return users most recent application", async function () {
      const applications = await ApplicationModel.getUserApplications("kfasdjfkdlfjkasdjflsdjfk");
      expect(applications).to.be.a("array");
      expect(applications.length).to.be.equal(1);
    });
  });

  describe("addApplication", function () {
    it("should add the application to db", async function () {
      const applicationId = await ApplicationModel.addApplication({
        ...applicationsData[4],
        userId: "fasfjsjkfjaskdfjskaldfj",
      });
      expect(applicationId).to.exist;
    });
  });

  describe("getApplicationsBasedOnStatus", function () {
    it("should return applications with the status provided in the param ,the lastDocId and total count", async function () {
      const { applications, lastDocId, totalCount } = await ApplicationModel.getApplicationsBasedOnStatus(
        "rejected",
        5
      );

      expect(applications).to.be.a("array");
      expect(applications.length).to.be.equal(4);
      applications.forEach((application) => {
        expect(application.status).to.be.equal("rejected");
      });
      expect(lastDocId).to.exist;
      expect(totalCount).to.be.a("number");
    });

    it("should return application with a particular status for a particular user if userId is provided in the argument", async function () {
      const { applications } = await ApplicationModel.getApplicationsBasedOnStatus(
        "pending",
        5,
        null,
        "faksdjfkdfjdkfjksdfkj"
      );

      expect(applications).to.be.a("array");
      expect(applications.length).to.be.equal(1);
      expect(applications[0].id).to.be.equal(applicationId1);
      expect(applications[0].status).to.be.equal("pending");
    });
  });

  describe("getApplicationById", function () {
    it("should return the application if the application exist in the db", async function () {
      const application = await ApplicationModel.getApplicationById(applicationId1);
      expect(application.notFound).to.be.equal(false);
      expect(application.id).to.be.equal(applicationId1);
    });

    it("should return notFound true, if the application doesn't exist in the db", async function () {
      const application = await ApplicationModel.getApplicationById("fksadfkd");
      expect(application.notFound).to.be.equal(true);
    });
  });

  describe("updateApplication", function () {
    it("should update a particular application", async function () {
      const dataToUpdate = { status: "accepted" };
      await ApplicationModel.updateApplication(dataToUpdate, applicationId1);
      const application = await ApplicationModel.getApplicationById(applicationId1);

      expect(application.status).to.be.equal("accepted");
    });
  });

  describe("addApplicationFeedback", function () {
    let testApplicationId: string;
    const reviewerName = "test-reviewer";

    beforeEach(async function () {
      const testApplication = { ...applicationsData[0], userId: "test-user-feedback" };
      testApplicationId = await ApplicationModel.addApplication(testApplication);
    });

    it("should successfully add feedback with status accepted", async function () {
      const result = await ApplicationModel.addApplicationFeedback({
        applicationId: testApplicationId,
        status: "accepted",
        reviewerName,
      });

      expect(result.status).to.be.equal("success");

      const application = await ApplicationModel.getApplicationById(testApplicationId);
      expect(application.status).to.be.equal("accepted");
      expect(application.feedback).to.be.a("array");
      expect(application.feedback.length).to.be.equal(1);
      expect(application.feedback[0].status).to.be.equal("accepted");
      expect(application.feedback[0].reviewerName).to.be.equal(reviewerName);
      expect(application.feedback[0].createdAt).to.exist;
      expect(application.feedback[0]).to.not.have.property("feedback");
    });

    it("should successfully add feedback with status rejected", async function () {
      const result = await ApplicationModel.addApplicationFeedback({
        applicationId: testApplicationId,
        status: "rejected",
        reviewerName,
      });

      expect(result.status).to.be.equal("success");

      const application = await ApplicationModel.getApplicationById(testApplicationId);
      expect(application.status).to.be.equal("rejected");
      expect(application.feedback.length).to.be.equal(1);
      expect(application.feedback[0].status).to.be.equal("rejected");
    });

    it("should successfully add feedback with status changes_requested", async function () {
      const feedbackText = "Please update your skills section";
      const result = await ApplicationModel.addApplicationFeedback({
        applicationId: testApplicationId,
        status: "changes_requested",
        feedback: feedbackText,
        reviewerName,
      });

      expect(result.status).to.be.equal("success");

      const application = await ApplicationModel.getApplicationById(testApplicationId);
      expect(application.status).to.be.equal("changes_requested");
      expect(application.feedback.length).to.be.equal(1);
      expect(application.feedback[0].status).to.be.equal("changes_requested");
      expect(application.feedback[0].feedback).to.be.equal(feedbackText);
    });

    it("should successfully add feedback with feedback text for accepted status", async function () {
      const feedbackText = "Great application!";
      const result = await ApplicationModel.addApplicationFeedback({
        applicationId: testApplicationId,
        status: "accepted",
        feedback: feedbackText,
        reviewerName,
      });

      expect(result.status).to.be.equal("success");

      const application = await ApplicationModel.getApplicationById(testApplicationId);
      expect(application.feedback[0].feedback).to.be.equal(feedbackText);
    });

    it("should trim whitespace from feedback text", async function () {
      const feedbackText = "  Please update your skills  ";
      const result = await ApplicationModel.addApplicationFeedback({
        applicationId: testApplicationId,
        status: "changes_requested",
        feedback: feedbackText,
        reviewerName,
      });

      expect(result.status).to.be.equal("success");

      const application = await ApplicationModel.getApplicationById(testApplicationId);
      expect(application.feedback[0].feedback).to.be.equal("Please update your skills");
    });

    it("should append feedback to existing feedback array", async function () {
      // Add first feedback
      await ApplicationModel.addApplicationFeedback({
        applicationId: testApplicationId,
        status: "changes_requested",
        feedback: "First feedback",
        reviewerName: "reviewer1",
      });

      const result = await ApplicationModel.addApplicationFeedback({
        applicationId: testApplicationId,
        status: "accepted",
        feedback: "Second feedback",
        reviewerName: "reviewer2",
      });

      expect(result.status).to.be.equal("success");

      const application = await ApplicationModel.getApplicationById(testApplicationId);
      expect(application.feedback.length).to.be.equal(2);
      expect(application.feedback[0].status).to.be.equal("changes_requested");
      expect(application.feedback[0].reviewerName).to.be.equal("reviewer1");
      expect(application.feedback[1].status).to.be.equal("accepted");
      expect(application.feedback[1].reviewerName).to.be.equal("reviewer2");
      expect(application.status).to.be.equal("accepted");
    });

    it("should handle application with no existing feedback array", async function () {
      const result = await ApplicationModel.addApplicationFeedback({
        applicationId: testApplicationId,
        status: "accepted",
        reviewerName,
      });

      expect(result.status).to.be.equal("success");

      const application = await ApplicationModel.getApplicationById(testApplicationId);
      expect(application.feedback).to.be.a("array");
      expect(application.feedback.length).to.be.equal(1);
    });

    it("should not include feedback field when feedback is empty string", async function () {
      const result = await ApplicationModel.addApplicationFeedback({
        applicationId: testApplicationId,
        status: "accepted",
        feedback: "",
        reviewerName,
      });

      expect(result.status).to.be.equal("success");

      const application = await ApplicationModel.getApplicationById(testApplicationId);
      expect(application.feedback[0]).to.not.have.property("feedback");
    });

    it("should not include feedback field when feedback is only whitespace", async function () {
      const result = await ApplicationModel.addApplicationFeedback({
        applicationId: testApplicationId,
        status: "accepted",
        feedback: "   ",
        reviewerName,
      });

      expect(result.status).to.be.equal("success");

      const application = await ApplicationModel.getApplicationById(testApplicationId);
      expect(application.feedback[0]).to.not.have.property("feedback");
    });

    it("should return notFound status when application does not exist", async function () {
      const result = await ApplicationModel.addApplicationFeedback({
        applicationId: "non-existent-id",
        status: "accepted",
        reviewerName,
      });

      expect(result.status).to.be.equal("notFound");
    });

    it("should include createdAt timestamp in feedback item", async function () {
      const beforeTime = new Date().toISOString();
      const result = await ApplicationModel.addApplicationFeedback({
        applicationId: testApplicationId,
        status: "accepted",
        reviewerName,
      });
      const afterTime = new Date().toISOString();

      expect(result.status).to.be.equal("success");

      const application = await ApplicationModel.getApplicationById(testApplicationId);
      expect(application.feedback[0].createdAt).to.exist;
      expect(application.feedback[0].createdAt).to.be.a("string");
      expect(application.feedback[0].createdAt >= beforeTime).to.be.true;
      expect(application.feedback[0].createdAt <= afterTime).to.be.true;
    });
  });
});
