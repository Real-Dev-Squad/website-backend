/**
 * This eslint rule is disabled because of https://github.com/nodesecurity/eslint-plugin-security/issues/21
 * It gives linting errors in testing the DB data with keys from fixtures
 */
import { expect } from "chai";
import cleanDb from "../../utils/cleanDb.js";
import recruiters from "../../../models/recruiters.js";
import firestore from "../../../utils/firestore.js";
import { recruiterDataArray } from "../../fixtures/recruiter/recruiter.js";
import userDataArray from "../../fixtures/user/user.js";
import addUser from "../../utils/addUser.js";

const recruiterModel = firestore.collection("recruiters");

describe("Recruiters", function () {
  beforeEach(async function () {
    await addUser();
  });

  after(async function () {
    await cleanDb();
  });

  describe("addRecruiterInfo", function () {
    it("should add the recruiter data", async function () {
      const recruiterData = recruiterDataArray[0];
      recruiterData.timestamp = Date.now();
      const username = userDataArray[0].username;
      // Add recruiter data
      const { recruiterId, recruiterName, userInfo, timestamp } = await recruiters.addRecruiterInfo(
        recruiterData,
        username
      );
      const data = (await recruiterModel.doc(recruiterId).get()).data();

      Object.keys(recruiterData).forEach((key) => {
        expect(recruiterData[key]).to.deep.equal(data[key]);
      });
      expect(recruiterId).to.be.a("string");
      expect(recruiterName).to.be.a("string");
      expect(userInfo).to.be.a("string");
      expect(timestamp).to.be.a("number");
    });
  });
});
