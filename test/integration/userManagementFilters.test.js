const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
// Import fixtures
const userData = require("../fixtures/user/user")();
const { generateUserStatusData } = require("../fixtures/userStatus/userStatus");

const config = require("config");
const { updateUserStatus } = require("../../models/userStatus");
const { addTag } = require("../../models/tags");
const { addLevel } = require("../../models/levels");
const { addTagsToItem } = require("../../models/items");

const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe("UserManagement Filters", function () {
  let jwt;
  let userId = "";
  let oooUser;
  let idleUser;
  let activeUser;
  let tagIdFE;
  let tagIdBE;
  let levelId1;
  let levelId2;

  before(async function () {
    const updatedAtDate = Date.now();
    const untilDate = updatedAtDate + 16 * 24 * 60 * 60 * 1000;
    userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
    oooUser = await addUser(userData[0]);
    await updateUserStatus(oooUser, generateUserStatusData("OOO", updatedAtDate, untilDate));
    idleUser = await addUser(userData[1]);
    await updateUserStatus(idleUser, generateUserStatusData("IDLE", updatedAtDate, updatedAtDate));
    activeUser = await addUser(userData[8]);
    await updateUserStatus(activeUser, generateUserStatusData("ACTIVE", updatedAtDate, updatedAtDate));

    // creating tag and levels
    const { id: id1 } = await addTag({
      name: "Vue JS",
      type: "SKILL",
      reason: "Web Dev FE",
    });
    tagIdFE = id1;
    const { id2 } = await addTag({
      name: "Node JS",
      type: "SKILL",
      reason: "Web Dev BE",
    });
    tagIdBE = id2;
    const { id3 } = await addLevel({
      name: "level 1",
      value: 1,
    });
    levelId1 = id3;
    const { id4 } = await addLevel({
      name: "level 2",
      value: 2,
    });
    levelId2 = id4;

    // creating items
    addTagsToItem({
      itemId: oooUser,
      itemType: "USER",
      tagPayload: [
        {
          tagId: tagIdFE,
          levelId: levelId1,
        },
        {
          tagId: tagIdFE,
          levelId: levelId2,
        },
      ],
    });
    addTagsToItem({
      itemId: idleUser,
      itemType: "USER",
      tagPayload: [
        {
          tagId: tagIdBE,
          levelId: levelId1,
        },
        {
          tagId: tagIdBE,
          levelId: levelId2,
        },
      ],
    });
    addTagsToItem({
      itemId: activeUser,
      itemType: "USER",
      tagPayload: [
        {
          tagId: tagIdFE,
          levelId: levelId1,
        },
        {
          tagId: tagIdBE,
          levelId: levelId1,
        },
      ],
    });
  });

  after(async function () {
    await cleanDb();
  });

  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip("GET /users/filter", function () {
    it("Should filter users based on state", function (done) {
      chai
        .request(app)
        .get("/users/filter?state=OOO")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.count).to.be.a("number");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          expect(res.body.users.length).to.equal(1);
          expect(res.body.users).to.deep.include({
            id: oooUser,
          });
          return done();
        });
    });

    it("Should filter users based on Tag", function (done) {
      chai
        .request(app)
        .get("/users/filter?tagId=tagIdFE")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.count).to.be.a("number");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          expect(res.body.users.length).to.equal(2);
          expect(res.body.users).to.deep.include({
            id: oooUser,
          });
          expect(res.body.users).to.deep.include({
            id: activeUser,
          });
          return done();
        });
    });

    it("Should filter users based on multiple Tags", function (done) {
      chai
        .request(app)
        .get("/users/filter?tagId=tagIdFE&tagId=tagIdBE")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.count).to.be.a("number");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          expect(res.body.users.length).to.equal(3);
          expect(res.body.users).to.deep.include({
            id: idleUser,
          });
          expect(res.body.users).to.deep.include({
            id: activeUser,
          });
          expect(res.body.users).to.deep.include({
            id: oooUser,
          });
          return done();
        });
    });

    it("Should filter users based on multiple states", function (done) {
      chai
        .request(app)
        .get("/users/filter?state=OOO&state=IDLE")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.count).to.be.a("number");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          expect(res.body.users.length).to.equal(2);
          expect(res.body.users).to.deep.include({
            id: idleUser,
          });
          expect(res.body.users).to.deep.include({
            id: oooUser,
          });
          return done();
        });
    });

    it("Should filter users based on single tag and single state", function (done) {
      chai
        .request(app)
        .get("/users/filter?state=OOO&tagId=tagIdFE")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.count).to.be.a("number");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          expect(res.body.users.length).to.equal(1);
          expect(res.body.users).to.deep.include({
            id: oooUser,
          });
          return done();
        });
    });

    it("Should filter users based on single tag and multiple state", function (done) {
      chai
        .request(app)
        .get("/users/filter?state=OOO&state=ACTIVE&tagId=tagIdFE")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.count).to.be.a("number");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          expect(res.body.users.length).to.equal(2);
          expect(res.body.users).to.deep.include({
            id: oooUser,
          });
          expect(res.body.users).to.deep.include({
            id: activeUser,
          });
          return done();
        });
    });

    it("Should filter users based on multiple tag and single state", function (done) {
      chai
        .request(app)
        .get("/users/filter?state=OOO&tagId=tagIdFE&tagId=tagIdBE")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.count).to.be.a("number");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          expect(res.body.users.length).to.equal(1);
          expect(res.body.users).to.deep.include({
            id: oooUser,
          });
          return done();
        });
    });

    it("Should filter users based on multiple tag and multiple states", function (done) {
      chai
        .request(app)
        .get("/users/filter?state=OOO&state=ACTIVE&tagId=tagIdFE&tagId=tagIdBE")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.count).to.be.a("number");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          expect(res.body.users.length).to.equal(2);
          expect(res.body.users).to.deep.include({
            id: oooUser,
          });
          expect(res.body.users).to.deep.include({
            id: activeUser,
          });
          return done();
        });
    });
  });
});
