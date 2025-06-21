import { expect } from "chai";
import cleanDb from "../../utils/cleanDb";
import * as impersonationModel from "../../../models/impersonationRequests";
import {
  impersonationRequestsBodyData,
  updateImpersonationRequestApproved,
  updateImpersonationRequestRejected,
} from "../../fixtures/impersonation-requests/impersonationRequests";
import { REQUEST_STATE, ERROR_WHILE_UPDATING_REQUEST} from "../../../constants/requests";
import addUser from "../../utils/addUser";
import userDataFixture from "./../../fixtures/user/user";
import sinon from "sinon";
import { UpdateImpersonationRequestStatusBody } from "../../../types/impersonationRequest";
import { Timestamp } from "firebase-admin/firestore";
const userData = userDataFixture();
import firestore from "../../../utils/firestore";
const logger = require("../../../utils/logger");

describe("models/impersonationRequests", () => {
  let impersonationRequest;
  let testUserId: string;


  beforeEach(async () => {
    await cleanDb();
    testUserId = await addUser(userData[16]);
  });

  afterEach(async () => {
    sinon.restore();
    await cleanDb();
  });

    describe("updateImpersonationRequest", () => {
    beforeEach(async () => {
      impersonationRequest = await impersonationModel.createImpersonationRequest(impersonationRequestsBodyData[0]);
    });

    afterEach(async () => {
      sinon.restore();
      await cleanDb();
    });

    it("should approve an impersonation request", async () => {
      const updatedRequest = await impersonationModel.updateImpersonationRequest({
        id: impersonationRequest.id,
        updatingBody: updateImpersonationRequestApproved,
        lastModifiedBy: impersonationRequest.impersonatedUserId,
      }) as UpdateImpersonationRequestStatusBody;
      expect(updatedRequest.status).to.equal(REQUEST_STATE.APPROVED);
    });

    it("should reject an impersonation request", async () => {
      const updatedRequest = await impersonationModel.updateImpersonationRequest({
        id: impersonationRequest.id,
        updatingBody: updateImpersonationRequestRejected,
        lastModifiedBy: impersonationRequest.impersonatedUserId,
      }) as UpdateImpersonationRequestStatusBody;
      expect(updatedRequest.status).to.equal(REQUEST_STATE.REJECTED);
    });

    it("should change the startedAt,endedAt and isImpersonationFinished fields on update", async () => {
      const updatedBody = {
        isImpersonationFinished: true,
        startedAt: Timestamp.fromDate(new Date(Date.now())),
        endedAt: Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000)),
      };
      const updatedRequest = await impersonationModel.updateImpersonationRequest({
        id: impersonationRequest.id,
        updatingBody: updatedBody,
        lastModifiedBy: impersonationRequest.userId,
      });
      const result = await impersonationModel.getImpersonationRequestById(impersonationRequest.id);
      expect(result.isImpersonationFinished).to.be.true;
      expect(Number(result.startedAt)).to.be.greaterThan(0);
      expect(Number(result.endedAt)).to.be.greaterThan(Number(result.startedAt));
    });

    it("should change updatedAt timestamp on update", async () => {
      const before = Number(impersonationRequest.updatedAt);
      const updated = await impersonationModel.updateImpersonationRequest({
        id: impersonationRequest.id,
        updatingBody: updateImpersonationRequestApproved,
        lastModifiedBy: impersonationRequest.impersonatedUserId,
      });
      const result = await impersonationModel.getImpersonationRequestById(impersonationRequest.id);
      expect(result).to.not.be.null;
      expect(Number(result.updatedAt)).to.be.greaterThan(before);
    });

    it("should log and throw error if Firestore update fails in updateImpersonationRequest", async () => {
      const error = new Error(ERROR_WHILE_UPDATING_REQUEST);
      const loggerStub = sinon.stub(logger, "error");
      const docUpdateStub = sinon.stub().rejects(error);
      const docStub = sinon.stub().returns({ update: docUpdateStub });
      sinon.stub(firestore.collection("impersonationRequests"), "doc").callsFake(docStub);
      try {
        await impersonationModel.updateImpersonationRequest({
          id: "impersonationRequest.id",
          updatingBody: { status: "APPROVED" },
          lastModifiedBy: impersonationRequest.impersonatedUserId,
        });
        expect.fail("Should throw error");
      } catch (err) {
        expect(loggerStub.calledWith(ERROR_WHILE_UPDATING_REQUEST, err)).to.be.true;
      }
    });
  });
});