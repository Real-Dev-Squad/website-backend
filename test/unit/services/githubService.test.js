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

  describe("fetchOpenPRs with additional params", function () {
    it("Should generate the correct url to fetch open PRs", async function () {
      const params = {
        searchParams: {
          created: "2023-01-01..2023-02-01",
        },
        resultOptions: {
          order: "desc",
        },
      };
      const response = await githubService.fetchOpenPRs(params);
      expect(response).to.be.equal(
        "https://api.github.com/search/issues?q=org%3AReal-Dev-Squad+type%3Apr+is%3Aopen+created%3A2023-01-01..2023-02-01&sort=created&order=desc&per_page=100&page=1"
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

  describe("fetchMergedPRs with additional params", function () {
    it("Should generate the correct url to fetch merged Prs", async function () {
      const params = {
        searchParams: {
          merged: "<=2023-01-01",
        },
        resultOptions: {
          order: "asc",
        },
      };
      const response = await githubService.fetchMergedPRs(params);
      expect(response).to.be.equal(
        "https://api.github.com/search/issues?q=org%3AReal-Dev-Squad+type%3Apr+is%3Amerged+merged%3A%3C%3D2023-01-01&sort=updated&order=asc&per_page=100&page=1"
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

  describe("fetchOpenIssues with additional params", function () {
    it("Should generate the correct url to fetch open issues", async function () {
      const params = {
        searchParams: {
          created: ">=2023-01-01",
        },
        resultOptions: {
          order: "desc",
        },
      };
      const response = await githubService.fetchOpenIssues(params);
      expect(response).to.be.equal(
        "https://api.github.com/search/issues?q=org%3AReal-Dev-Squad+type%3Aissue+is%3Aopen+created%3A%3E%3D2023-01-01&sort=created&order=desc&per_page=100&page=1"
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

  describe("fetchClosedIssues with additional params", function () {
    it("Should generate the correct url to fetch closed issues", async function () {
      const params = {
        searchParams: {
          closed: "2023-01-01..2023-02-01",
        },
        resultOptions: {
          order: "desc",
        },
      };
      const response = await githubService.fetchClosedIssues(params);
      expect(response).to.be.equal(
        "https://api.github.com/search/issues?q=org%3AReal-Dev-Squad+type%3Aissue+is%3Aclosed+closed%3A2023-01-01..2023-02-01&sort=updated&order=desc&per_page=100&page=1"
      );
    });
  });

  describe("fetchIssues", function () {
    it("Should generate the correct url", async function () {
      const response = await githubService.fetchIssues();
      expect(response).to.be.equal(`https://api.github.com/orgs/Real-Dev-Squad/issues`);
    });
  });

  describe("fetchOpenIssues with search query param", function () {
    it("Should generate the correct url to fetch open issues with search param", async function () {
      const searchString = "website";
      const response = await githubService.fetchOpenIssues({
        searchString,
      });

      const baseURL = config.get("githubApi.baseUrl");
      const org = config.get("githubApi.org");
      const path = "search/issues";
      const searchParams = `org%3A${org}+type%3Aissue+is%3Aopen&sort=created&per_page=100&page=1`;

      const url = `${baseURL}/${path}?q=${searchString}+${searchParams}`;
      expect(response).to.be.equal(url);
    });
  });

  describe("fetchLastMergedPR", function () {
    it("Should generate the correct url to fetch last merged PR", async function () {
      const data = {
        items: [
          {
            pull_request: {
              merged_at: "2023-08-18T11:56:45Z",
            },
          },
        ],
      };
      const username = "sahsisunny";
      const stub = sinon.stub(githubService, "fetchLastMergedPR").returns(data);
      const response = await githubService.fetchLastMergedPR(username);
      expect(response).to.be.equal(data);
      stub.restore();
    });

    it("Should throw an error if no merged PRs found for user", async function () {
      const username = "hfghdgfh";
      const stub = sinon.stub(githubService, "fetchLastMergedPR").returns({
        items: [],
      });
      try {
        await githubService.fetchLastMergedPR(username);
      } catch (err) {
        expect(err.message).to.be.equal(`No merged PRs found for user ${username}`);
      }
      stub.restore();
    });
  });

  describe("isLastPRMergedWithinDays", function () {
    it("Should return true if last PR merged is within the last `days` days else false", async function () {
      const data = {
        items: [
          {
            pull_request: {
              merged_at: "2023-08-18T11:56:45Z",
            },
          },
        ],
      };
      const days = 20;
      const username = "sahsisunny";
      const stub = sinon.stub(githubService, "fetchLastMergedPR").returns(data);
      const stub2 = sinon.stub(githubService, "isLastPRMergedWithinDays").returns(true);
      const response = await githubService.isLastPRMergedWithinDays(username, days);
      expect(response).to.be.equal(true);
      stub.restore();
      stub2.restore();
    });

    it("Should return false if last PR merged is not within the last `days` days else false", async function () {
      const data = {
        items: [
          {
            pull_request: {
              merged_at: "2023-08-18T11:56:45Z",
            },
          },
        ],
      };
      const days = 10;
      const username = "sahsisunny";
      const stub = sinon.stub(githubService, "fetchLastMergedPR").returns(data);
      const stub2 = sinon.stub(githubService, "isLastPRMergedWithinDays").returns(false);
      const response = await githubService.isLastPRMergedWithinDays(username, days);
      expect(response).to.be.equal(false);
      stub.restore();
      stub2.restore();
    });

    it("Should throw an error while checking last PR merged", async function () {
      const days = 10;
      const username = "sahsisunny";
      const stub = sinon.stub(githubService, "fetchLastMergedPR").throws("Error");
      const stub2 = sinon.stub(githubService, "isLastPRMergedWithinDays").returns(false);
      try {
        await githubService.isLastPRMergedWithinDays(username, days);
      } catch (err) {
        expect(err.message).to.be.equal("Error while checking last PR merged: Error");
      }
      stub.restore();
      stub2.restore();
    });
  });
});
