const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");

chai.use(chaiHttp);

describe("Badges", function () {
  describe("GET /badges", function () {
    it("Should get all the list of badges", function (done) {
      chai
        .request(app)
        .get("/badges")
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Badges returned successfully!");
          expect(res.body.badges).to.be.a("array");

          return done();
        });
    });
  });
});
