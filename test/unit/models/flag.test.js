const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const addUser = require("../../utils/addUser");
const cleanDb = require("../../utils/cleanDb");

const flagModel = require("../../../models/flag");
const firestore = require("../../../utils/firestore");
const flagFirestore = firestore.collection("featureFlags");

chai.use(chaiHttp);

describe("flags", function () {
  beforeEach(async function () {
    await addUser();
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("add feature flag", function () {
    it("Should return flag Id", async function () {
      const flagData = {
        title: "dark - mode",
        enabled: true,
        roles: ["members", "no_role", "super_user"],
        users: {
          "pallab id": true,
          "rohit id": false,
        },
      };
      const flagId = await flagModel.addFlag(flagData);
      const data = (await flagFirestore.doc(flagId).get()).data();
      Object.keys(flagData).forEach((key) => {
        expect(flagData[key]).to.deep.equal(data[key]);
      });
      expect(data.title).to.be.a("string");
      expect(data.enabled).to.be.a("boolean");
      expect(data.roles).to.be.a("array");
      expect(data.users).to.be.a("object");
    });
  });
});
