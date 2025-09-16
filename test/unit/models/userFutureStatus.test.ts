import { createUserFutureStatus, getUserFutureStatus } from "../../../models/userFutureStatus.js";
import { expect } from "chai";
import cleanDb from "../../utils/cleanDb.js";
import { UserFutureStatusType } from "../../../types/userFutureStatus.js";
import { userFutureStatusData } from "../../fixtures/userFutureStatus/userFutureStatusData.js";

describe("models/userFutureStatus", () => {
  afterEach(async () => {
    await cleanDb();
  });

  describe("createUserFutureStatus ", () => {
    it("should successfully create a new user future status", async () => {
      const userFutureStatus = await createUserFutureStatus(userFutureStatusData as UserFutureStatusType);
      expect(userFutureStatus).to.not.be.null;
      expect(userFutureStatus).to.have.property("id");
      expect(userFutureStatus).to.have.property("userId");
    });
  });

  describe("getUserFutureStatus", () => {
    it("should successfully get user future status", async () => {
      await createUserFutureStatus(userFutureStatusData as UserFutureStatusType);
      const userFutureStatus = await getUserFutureStatus(
        userFutureStatusData.userId,
        userFutureStatusData.status,
        userFutureStatusData.state
      );
      expect(userFutureStatus).to.not.be.null;
      expect(userFutureStatus).to.be.an("array");
      expect(userFutureStatus).to.have.length(1);
    });
  });
});
