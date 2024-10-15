const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const firestore = require("../../utils/firestore");
const profileDiffsModel = firestore.collection("profileDiffs");
const obfuscate = require("../../utils/obfuscate");

const app = require("../../server");
const authService = require("../../services/authService");
const profileDiffsQuery = require("../../models/profileDiffs");

const addUser = require("../utils/addUser");

const userData = require("../fixtures/user/user")();
const newUser = userData[3];
const superUser = userData[4];

const config = require("config");
const addProfileDiffs = require("../utils/addProfileDiffs");
const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe("Profile Diffs API Behind Feature Flag", function () {
  let newUserId;
  let newUserAuthToken;
  let superUserId;
  let superUserAuthToken;

  before(async function () {
    newUserId = await addUser(newUser);
    newUserAuthToken = authService.generateAuthToken({ userId: newUserId });

    superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });

    await addProfileDiffs(newUserId);
  });

  describe("GET /profileDiffs", function () {
    it("Should return pending profileDiffs with obfuscated email and phone, using authorized user (super_user)", async function () {
      const response = await chai
        .request(app)
        .get("/profileDiffs?dev=true")
        .set("cookie", `${cookieName}=${superUserAuthToken}`);

      expect(response).to.have.status(200);
      expect(response.body.message).to.equal("Profile Diffs returned successfully!");
      expect(response.body).to.have.property("next");

      const profileDiffs = response.body.profileDiffs;
      expect(profileDiffs).to.be.an("array");

      for (const profileDiff of profileDiffs) {
        const { id, email, phone } = profileDiff;
        const originalProfileDiffDoc = await profileDiffsModel.doc(id).get();
        const originalProfileDiff = originalProfileDiffDoc.data();

        if (originalProfileDiff?.email) {
          const expectedObfuscatedEmail = obfuscate.obfuscateMail(originalProfileDiff.email);
          expect(email).to.equal(expectedObfuscatedEmail);
        }
        if (originalProfileDiff?.phone) {
          const expectedObfuscatedPhone = obfuscate.obfuscatePhone(originalProfileDiff.phone);
          expect(phone).to.equal(expectedObfuscatedPhone);
        }
      }
    });

    it("Should return unauthorized error when not authorized", function (done) {
      chai
        .request(app)
        .get("/profileDiffs?dev=true")
        .set("cookie", `${cookieName}=${newUserAuthToken}`)
        .end((error, response) => {
          expect(response).to.have.status(401);
          expect(response.body.error).to.equal("Unauthorized");
          expect(response.body.message).to.equal("You are not authorized for this action.");
          done(error);
        });
    });

    it("Should handle query parameters correctly and obfuscate email and phone", async function () {
      const profileDiffsSnapshot = await profileDiffsModel.where("approval", "==", "APPROVED").limit(1).get();

      const res = await chai
        .request(app)
        .get(
          `/profileDiffs?dev=true&status=APPROVED&order=asc&size=1&username=${newUser.username}&cursor=${profileDiffsSnapshot.docs[0].id}`
        )
        .set("cookie", `${cookieName}=${superUserAuthToken}`);
      expect(res).to.have.status(200);
      expect(res.body.message).to.equal("Profile Diffs returned successfully!");
      expect(res.body).to.have.property("next");

      const profileDiffs = res.body.profileDiffs;
      expect(profileDiffs).to.be.an("array");

      profileDiffs.forEach(async (profileDiff) => {
        const { id, email, phone } = profileDiff;
        const originalProfileDiffDoc = await profileDiffsModel.doc(id).get();
        const originalProfileDiff = originalProfileDiffDoc.data();

        if (originalProfileDiff?.email) {
          const obfuscatedEmail = obfuscate.obfuscateMail(originalProfileDiff.email);
          expect(email).to.equal(obfuscatedEmail);
        }
        if (originalProfileDiff?.phone) {
          const obfuscatedPhone = obfuscate.obfuscatePhone(originalProfileDiff.phone);
          expect(phone).to.equal(obfuscatedPhone);
        }
      });
    });

    it("Should handle server errors", function (done) {
      const stub = sinon.stub(profileDiffsQuery, "fetchProfileDiffsWithPagination").throws(new Error("Database error"));

      chai
        .request(app)
        .get("/profileDiffs?dev=true")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((error, response) => {
          expect(response).to.have.status(503);
          expect(response.body.message).to.equal("Something went wrong. Please try again or contact admin");
          stub.restore();
          done(error);
        });
    });
  });

  describe("GET /profileDiffs/:id", function () {
    it("Should return a specific profile diff with obfuscated email and phone for authorized user", async function () {
      const profileDiffsSnapshot = await profileDiffsModel.where("approval", "==", "PENDING").limit(1).get();

      const response = await chai
        .request(app)
        .get(`/profileDiffs/${profileDiffsSnapshot.docs[0].id}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`);
      expect(response).to.have.status(200);
      expect(response.body.message).to.equal("Profile Diff returned successfully!");
      expect(response.body.profileDiff).to.be.an("object");

      const { email, phone } = response.body.profileDiff;
      const originalProfileDiff = profileDiffsSnapshot.docs[0].data();
      if (originalProfileDiff?.email) {
        const obfuscatedEmail = obfuscate.obfuscateMail(originalProfileDiff.email);
        expect(email).to.equal(obfuscatedEmail);
      }
      if (originalProfileDiff?.phone) {
        const obfuscatedPhone = obfuscate.obfuscatePhone(originalProfileDiff.phone);
        expect(phone).to.equal(obfuscatedPhone);
      }
    });

    it("Should return not found for non-existent profile diff", function (done) {
      const nonExistentId = "nonExistentId";

      chai
        .request(app)
        .get(`/profileDiffs/${nonExistentId}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((error, response) => {
          expect(response).to.have.status(404);
          expect(response.body.message).to.equal("Profile Diff doesn't exist");
          done(error);
        });
    });

    it("Should handle server errors for specific profile diff", function (done) {
      const fakeId = "fakeProfileDiffId";
      const stub = sinon.stub(profileDiffsQuery, "fetchProfileDiff").throws(new Error("Database error"));

      chai
        .request(app)
        .get(`/profileDiffs/${fakeId}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((error, response) => {
          expect(response).to.have.status(503);
          expect(response.body.message).to.equal("Something went wrong. Please try again or contact admin");
          stub.restore();
          done(error);
        });
    });
  });
});
