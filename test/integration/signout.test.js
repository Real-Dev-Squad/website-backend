const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const app = require("../../server");

chai.use(chaiHttp);

describe("GET /signout", function () {
  it("Should clear the session cookies", function (done) {
    chai
      .request(app)
      .get("/signout")
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res).to.have.status(200);
        expect(res.body).to.be.a("object");
        expect(res.body.message).to.equal("Cookies deleted Succesfully");
        expect(res.body.deletedCookies).to.be.a("array");

        return done();
      });
  });
});
