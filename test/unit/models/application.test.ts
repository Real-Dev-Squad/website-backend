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
    it("should return all the user applications", async function () {
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
    it("should return applications with the status provided in the param and the lastDocId", async function () {
      const { applications, lastDocId } = await ApplicationModel.getApplicationsBasedOnStatus("rejected", 5);

      expect(applications).to.be.a("array");
      expect(applications.length).to.be.equal(4);
      applications.forEach((application) => {
        expect(application.status).to.be.equal("rejected");
      });
      expect(lastDocId).to.exist;
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

  describe("batchUpdateApplications", function () {
    it("should add createdAt null to all existing application docs", async function () {
      const operationStats = await ApplicationModel.batchUpdateApplications();
      expect(operationStats.totalApplicationUpdates).to.be.equal(6);
    });
  });
});
