import chai from "chai";
import sinon from "sinon";
import chaiHttp from "chai-http";

import app from "../../server.js";
import cleanDb from "../utils/cleanDb.js";
import githubService from "../../services/githubService.js";
import issuesMockData from "../fixtures/issues/issues.js";

const { expect } = chai;

chai.use(chaiHttp);

describe("Issues", function () {
  afterEach(async function () {
    sinon.restore();
    await cleanDb();
  });

  describe("GET /issues fetch github issues", function () {
    it("Should return issue when valid github page url is passed", async function () {
      const fetchIssuesByIdStub = sinon.stub(githubService, "fetchIssuesById").resolves(issuesMockData.issuesData);
      const res = await chai.request(app).get("/issues").query({ q: issuesMockData.issuesHtmlUrl });
      expect(res).to.have.status(200);
      expect(fetchIssuesByIdStub.calledOnce).to.be.equal(true);
      expect(res.body.message).to.equal("Issues returned successfully!");
      expect(res.body.issues).to.deep.equal([issuesMockData.issuesData]);
    });

    it("Should not call fetch issues by id function when random string is passed", async function () {
      const fetchIssuesByIdSpy = sinon.spy(githubService, "fetchIssuesById");
      await chai.request(app).get("/issues").query({ q: "abc+def" });
      expect(fetchIssuesByIdSpy.calledOnce).to.be.equal(false);
    });
  });
});
