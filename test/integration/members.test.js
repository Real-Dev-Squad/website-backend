const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");

// Import fixtures
const userData = require("../fixtures/user/user")();

const config = require("config");
const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

const superUser = userData[4];
const userAlreadyMember = userData[0];
const userToBeMadeMember = userData[1];
const nonSuperUser = userData[0];
const userDoesNotExists = userData[1];
const userToBeArchived = userData[3];
const userAlreadyArchived = userData[5];
const userArchivedRoleFalse = userData[6];

const archivedUsersGithubIds = [userAlreadyArchived.github_id];
const unarchivedUsersGithubIds = [userArchivedRoleFalse.github_id];

describe("Members", function () {
  let jwt;

  beforeEach(async function () {
    await cleanDb();
  });

  describe("GET /members", function () {
    it("Should return an empty array if no user is found", function (done) {
      chai
        .request(app)
        .get("/members")
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("No member found");
          expect(res.body.members).to.eql([]);

          return done();
        });
    });

    it("Should return 400 for showArchived query param value other than true/false", function (done) {
      chai
        .request(app)
        .get("/members?showArchived=xyz")
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal('"showArchived" must be a boolean');

          return done();
        });
    });

    describe("When the users collection is not empty", function () {
      beforeEach(async function () {
        await Promise.all([addUser(userArchivedRoleFalse), addUser(userAlreadyArchived)]);
      });

      it("Should return all the unarchived users in the database", function (done) {
        chai
          .request(app)
          .get("/members")
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(200);
            expect(res.body).to.be.a("object");
            expect(res.body.message).to.equal("Members returned successfully!");
            expect(res.body.members).to.be.a("array");
            expect(res.body.members.length).to.be.equal(unarchivedUsersGithubIds.length);
            const memberGithubIds = res.body.members.map((member) => member.github_id);
            expect(memberGithubIds).to.include.all.members(unarchivedUsersGithubIds);
            expect(memberGithubIds).to.not.include.any.members(archivedUsersGithubIds);
            return done();
          });
      });

      it("Should return all the users in the database (including archived)", function (done) {
        chai
          .request(app)
          .get("/members?showArchived=true")
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            const totalUsersCount = unarchivedUsersGithubIds.length + archivedUsersGithubIds.length;
            expect(res).to.have.status(200);
            expect(res.body).to.be.a("object");
            expect(res.body.message).to.equal("Members returned successfully!");
            expect(res.body.members).to.be.a("array");
            expect(res.body.members.length).to.be.equal(totalUsersCount);
            const memberGithubIds = res.body.members.map((member) => member.github_id);
            expect(memberGithubIds).to.include.all.members([...unarchivedUsersGithubIds, ...archivedUsersGithubIds]);
            return done();
          });
      });
    });
  });

  describe("GET /members/idle", function () {
    it("Should return an empty array if no idle member is found", function (done) {
      chai
        .request(app)
        .get("/members/idle")
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("No idle member found");
          expect(res.body.idleMemberUserNames).to.eql([]);

          return done();
        });
    });

    it("Should return all the idle members", function (done) {
      addUser().then(() => {
        chai
          .request(app)
          .get("/members/idle")
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(200);
            expect(res.body).to.be.a("object");
            expect(res.body.message).to.equal("Idle members returned successfully!");
            expect(res.body.idleMemberUserNames).to.be.a("array");
            expect(res.body.idleMemberUserNames[0]).to.be.a("string");

            return done();
          });
      });
    });
  });

  describe("PATCH /members/moveToMembers/:username", function () {
    beforeEach(async function () {
      const superUserId = await addUser(superUser);
      jwt = authService.generateAuthToken({ userId: superUserId });
    });

    it("Should return 404 if user doesn't exist", function (done) {
      chai
        .request(app)
        .patch(`/members/moveToMembers/${userToBeMadeMember.username}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User doesn't exist");

          return done();
        });
    });

    it("Should make the user a member", function (done) {
      addUser(userToBeMadeMember).then(() => {
        chai
          .request(app)
          .patch(`/members/moveToMembers/${userToBeMadeMember.username}`)
          .set("cookie", `${cookieName}=${jwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(204);
            /* eslint-disable no-unused-expressions */
            expect(res.body).to.be.a("object").to.be.empty;

            return done();
          });
      });
    });

    it("Should return 400 if user is already a member", function (done) {
      addUser(userAlreadyMember).then(() => {
        chai
          .request(app)
          .patch(`/members/moveToMembers/${userAlreadyMember.username}`)
          .set("cookie", `${cookieName}=${jwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(400);
            expect(res.body).to.be.a("object");
            expect(res.body.message).to.equal("User is already a member");

            return done();
          });
      });
    });

    it("Should return 401 if user is not a super_user", function (done) {
      addUser(nonSuperUser).then((nonSuperUserId) => {
        const nonSuperUserJwt = authService.generateAuthToken({ userId: nonSuperUserId });
        chai
          .request(app)
          .patch(`/members/moveToMembers/${nonSuperUser.username}`)
          .set("cookie", `${cookieName}=${nonSuperUserJwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(401);
            expect(res.body).to.be.a("object");
            expect(res.body.message).to.equal("You are not authorized for this action.");

            return done();
          });
      });
    });
  });

  describe("PATCH /members/archiveMembers/:username", function () {
    beforeEach(async function () {
      const superUserId = await addUser(superUser);
      jwt = authService.generateAuthToken({ userId: superUserId });
    });

    it("Should return 404 if user doesn't exist", function (done) {
      chai
        .request(app)
        .patch(`/members/archiveMembers/${userDoesNotExists.username}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User doesn't exist");
          return done();
        });
    });

    it("Should archive the user", function (done) {
      addUser(userToBeArchived).then(() => {
        chai
          .request(app)
          .patch(`/members/archiveMembers/${userToBeArchived.username}`)
          .set("cookie", `${cookieName}=${jwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(204);
            /* eslint-disable no-unused-expressions */
            expect(res.body).to.be.a("object").to.be.empty;

            return done();
          });
      });
    });

    it("Should return 400 if user is already archived", function (done) {
      addUser(userAlreadyArchived).then(() => {
        chai
          .request(app)
          .patch(`/members/archiveMembers/${userAlreadyArchived.username}`)
          .set("cookie", `${cookieName}=${jwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(400);
            expect(res.body).to.be.a("object");
            expect(res.body.message).to.equal("User is already archived");

            return done();
          });
      });
    });

    it("Should return 401 if user is not a super user", function (done) {
      addUser(nonSuperUser).then((nonSuperUserId) => {
        const nonSuperUserJwt = authService.generateAuthToken({ userId: nonSuperUserId });
        chai
          .request(app)
          .patch(`/members/moveToMembers/${nonSuperUser.username}`)
          .set("cookie", `${cookieName}=${nonSuperUserJwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(401);
            expect(res.body).to.be.a("object");
            expect(res.body.message).to.equal("You are not authorized for this action.");

            return done();
          });
      });
    });
  });
});
