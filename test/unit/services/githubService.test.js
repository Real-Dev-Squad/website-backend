const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const addUser = require("../../utils/addUser");
const axios = require("../../../utils/fetch");

const githubService = require("../../../services/githubService");
const githubUserInfo = require("../../fixtures/auth/githubUserInfo")();

describe("githubService", function () {
  beforeEach(async function () {
    sinon.stub(axios, "fetch").returnsArg(0);
  });
  afterEach(async function () {
    await cleanDb();
    sinon.restore();
  });
  describe("fetchStalePRs", function () {
    it("Should generate the correct url", async function () {
      const response = await githubService.fetchStalePRs();
      expect(response).to.be.equal(
        "https://api.github.com/search/issues?q=org%3AReal-Dev-Squad+type%3Apr+is%3Aopen&sort=created&order=asc&per_page=10&page=1"
      );
    });
  });

  describe("fetchOpenPRs", function () {
    it("Should generate the correct url", async function () {
      const response = await githubService.fetchOpenPRs();
      expect(response).to.be.equal(
        "https://api.github.com/search/issues?q=org%3AReal-Dev-Squad+type%3Apr+is%3Aopen&sort=created&order=desc&per_page=10&page=1"
      );
    });
  });

  describe("fetchPRsByUser", function () {
    it("Should generate the correct url", async function () {
      await addUser();
      const response = await githubService.fetchPRsByUser(githubUserInfo[0].username);
      expect(response).to.be.equal(
        `https://api.github.com/search/issues?q=org%3AReal-Dev-Squad+type%3Apr+author%3A${githubUserInfo[0].username}`
      );
    });
  });
});
