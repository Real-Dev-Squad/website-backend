import { expect } from "chai";
import cleanDb from "../../utils/cleanDb";
import { createRequest, getRequests, updateRequest, getRequestByKeyValues } from "../../../models/requests";
import {
  createOooRequests,
  createOooRequests2,
  createOooStatusRequests,
  updateOooApprovedRequests,
  updateOooRejectedRequests,
} from "./../../fixtures/oooRequest/oooRequest";
import { REQUEST_STATE, REQUEST_TYPE } from "../../../constants/requests";
import userDataFixture from "./../../fixtures/user/user";
import addUser from "../../utils/addUser";
const userData = userDataFixture();

let testUserId: string;
describe("models/oooRequests", () => {
  beforeEach(async () => {
    const userIdPromises = [addUser(userData[16])];
    const [userId] = await Promise.all(userIdPromises);
    testUserId = userId;
  });

  afterEach(async () => {
    await cleanDb();
  });

  describe("createRequest", () => {
    it("should successfully create a new OOO request", async () => {
      const oooRequest = await createRequest(createOooStatusRequests);
      expect(oooRequest).to.not.be.null;
      expect(oooRequest).to.have.property("id");
      expect(oooRequest).to.have.property("requestedBy");
    });

    it("should throw an error if the user already has an OOO request", async () => {
      await createRequest(createOooStatusRequests);
      try {
        await createRequest(createOooStatusRequests);
        expect.fail("User already has an OOO request");
      } catch (error) {
        expect(error.message).to.equal("User already has an OOO request");
      }
    });
  });

  describe("updateRequest", () => {
    it("should update an existing OOO request", async () => {
      const oooRequest: any = await createRequest(createOooStatusRequests);
      const updatedOooRequest: any = await updateRequest(
        oooRequest.id,
        updateOooApprovedRequests,
        updateOooApprovedRequests.lastModifiedBy
        , REQUEST_TYPE.OOO
      );
      expect(updatedOooRequest).to.not.be.null;
      expect(updatedOooRequest).to.have.property("state");
      expect(updatedOooRequest.state).to.equal(updateOooApprovedRequests.state);
    });

    it("should throw an error if the OOO request does not exist", async () => {
      try {
        await updateRequest("randomId", updateOooApprovedRequests, updateOooApprovedRequests.lastModifiedBy, REQUEST_TYPE.OOO);
        expect.fail("OOO request does not exist");
      } catch (error) {
        expect(error.message).to.equal("OOO request does not exist");
      }
    });

    it("should throw an error if the OOO request is already approved", async () => {
      const oooRequest: any = await createRequest(createOooStatusRequests);
      await updateRequest(oooRequest.id, updateOooApprovedRequests, updateOooApprovedRequests.lastModifiedBy, REQUEST_TYPE.OOO);
      try {
        await updateRequest(oooRequest.id, updateOooApprovedRequests, updateOooApprovedRequests.lastModifiedBy, REQUEST_TYPE.OOO);
        expect.fail("OOO request is already approved");
      } catch (error) {
        expect(error.message).to.equal("OOO request is already approved");
      }
    });

    it("should throw an error if the OOO request is already rejected", async () => {
      const oooRequest: any = await createRequest(createOooStatusRequests);
      await updateRequest(oooRequest.id, updateOooRejectedRequests, updateOooRejectedRequests.lastModifiedBy, REQUEST_TYPE.OOO);
      try {
        await updateRequest(oooRequest.id, updateOooApprovedRequests, updateOooApprovedRequests.lastModifiedBy, REQUEST_TYPE.OOO);
        expect.fail("OOO request is already rejected");
      } catch (error) {
        expect(error.message).to.equal("OOO request is already rejected");
      }
    });
  });

  describe("getRequests", () => {
    it("Should return the request with the specified ID", async () => {
      const oooRequest = await createRequest(createOooRequests2);
      const query = { id: oooRequest.id, dev: "true" };
      const oooRequestData: any = await getRequests(query);
      expect(oooRequestData.id).to.be.equal(oooRequest.id);
    });

    it("Should return null if the request with the specified ID does not exist", async () => {
      const query = { id: "randomId", dev: "true" };
      const oooRequestData = await getRequests(query);
      expect(oooRequestData).to.be.equal(null);
    });

    it("Should return a list of all the GET requests", async () => {
      await createRequest(createOooRequests);
      await createRequest(createOooRequests2);
      const query = { dev: "true" };
      const oooRequestData = await getRequests(query);
      expect(oooRequestData.allRequests).to.be.have.length(2);
    });

    it("Should return a list of all the requests with specified state - APPROVED", async () => {
      const oooRequest: any = await createRequest(createOooStatusRequests);
      await updateRequest(oooRequest.id, updateOooApprovedRequests, updateOooApprovedRequests.lastModifiedBy, REQUEST_TYPE.OOO)
      const query = { dev: "true", state: REQUEST_STATE.APPROVED };
      const oooRequestData = await getRequests(query);
      expect(oooRequestData.allRequests[0].state).to.be.equal(REQUEST_STATE.APPROVED);
    });

    it("Should return a list of all the requests with specified state - PENDING", async () => {
      await createRequest(createOooStatusRequests);
      const query = { dev: "true", state: REQUEST_STATE.PENDING };
      const oooRequestData = await getRequests(query);
      expect(oooRequestData.allRequests[0].state).to.be.equal(REQUEST_STATE.PENDING);
    });

    it("Should return a list of all the requests by specific user ", async () => {
      const oooRequestBodyData = { ...createOooRequests, requestedBy: testUserId };
      await createRequest(oooRequestBodyData);
      const query = { dev: "true", requestedBy: userData[16].username };
      const oooRequestData = await getRequests(query);
      expect(oooRequestData.allRequests).to.have.lengthOf(1);
      expect(oooRequestData.allRequests[0].requestedBy).to.be.equal(testUserId);
    });

    it("Should return a list of all the requests for specific type ", async () => {
      await createRequest(createOooRequests);
      const query = { dev: "true", type: REQUEST_TYPE.OOO };
      const oooRequestData = await getRequests(query);
      expect(oooRequestData.allRequests[0].type).to.be.equal(REQUEST_TYPE.OOO);
    });

    it("Should return empty array if no data is found", async () => {
      const query = { dev: "true", state: REQUEST_STATE.PENDING };
      const oooRequestData = await getRequests(query);
      expect(oooRequestData).to.be.equal(null);
    });

    it("Should return a list of all the requests by page ", async () => {
      await createRequest(createOooRequests);
      await createRequest(createOooRequests2);
      const query = { dev: "true", page: 1 };
      const oooRequestData = await getRequests(query);
      expect(oooRequestData.page).to.be.equal(2);
    });

    it("Should return a list of all the requests by size ", async () => {
      await createRequest(createOooRequests);
      await createRequest(createOooRequests2);
      const query = { dev: "true", size: 1 };
      const oooRequestData = await getRequests(query);
      expect(oooRequestData.allRequests).to.have.lengthOf(1);
    });
  });

  describe("getRequestByKeyValue", () => {
    it("Should return the request with the specified key value", async () => {
      const oooRequestObj = { ...createOooRequests2, requestedBy: testUserId };
      const oooRequest = await createRequest(oooRequestObj);
      const oooRequestData: any = await getRequestByKeyValues({ requestedBy: testUserId, type: REQUEST_TYPE.OOO });
      expect(oooRequestData.requestedBy).to.be.equal(oooRequest.requestedBy);
    });

    it("Should return null if the request with the specified key value does not exist", async () => {
      const oooRequestData = await getRequestByKeyValues({ requestedBy: "randomId", type: REQUEST_TYPE.OOO });
      expect(oooRequestData).to.be.equal(null);
    });
  });
});
