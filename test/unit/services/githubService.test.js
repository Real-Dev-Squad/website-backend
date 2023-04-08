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

  describe("fetchOpenPRs", function () {
    it("Should generate the correct url to fetch open PRs", async function () {
      const response = await githubService.fetchOpenPRs();
      expect(response).to.be.equal(
        "https://api.github.com/search/issues?q=org%3AReal-Dev-Squad+type%3Apr+is%3Aopen&sort=created&per_page=100&page=1"
      );
    });
  });

  describe("fetchPRsByUser", function () {
    it("Should generate the correct url to fetch PRs by given user", async function () {
      await addUser();
      const response = await githubService.fetchPRsByUser(githubUserInfo[0].username);
      expect(response).to.be.equal(
        `https://api.github.com/search/issues?q=org%3AReal-Dev-Squad+author%3A${githubUserInfo[0].username}+type%3Apr`
      );
    });
  });

  describe("fetchMergedPRs", function () {
    it("Should generate the correct url to fetch merged Prs", async function () {
      const response = await githubService.fetchMergedPRs();
      expect(response).to.be.equal(
        "https://api.github.com/search/issues?q=org%3AReal-Dev-Squad+type%3Apr+is%3Amerged&sort=updated&per_page=100&page=1"
      );
    });
  });

  describe("fetchOpenIssues", function () {
    it("Should generate the correct url to fetch open issues", async function () {
      const response = await githubService.fetchOpenIssues();
      expect(response).to.be.equal(
        "https://api.github.com/search/issues?q=org%3AReal-Dev-Squad+type%3Aissue+is%3Aopen&sort=created&per_page=100&page=1"
      );
    });
  });

  describe("fetchClosedIssues", function () {
    it("Should generate the correct url to fetch closed issues", async function () {
      const response = await githubService.fetchClosedIssues();
      expect(response).to.be.equal(
        "https://api.github.com/search/issues?q=org%3AReal-Dev-Squad+type%3Aissue+is%3Aclosed&sort=updated&per_page=100&page=1"
      );
    });
  });
});
