import * as chai from "chai";
import chaiHttp from "chai-http";
import { expect } from "chai";
import { generateAuthToken, verifyAuthToken, decodeAuthToken } from "../../../services/authService.js";

chai.use(chaiHttp);

describe("authService", function () {
  it("should validate the generated JWT", function (done) {
    const payload = { userId: 1 };
    const jwt = generateAuthToken(payload);
    const decodedValue = verifyAuthToken(jwt);

    expect(decodedValue).to.have.all.keys("userId", "iat", "exp");
    expect(decodedValue.userId).to.equal(payload.userId);

    return done();
  });

  it("should decode the generated JWT", function (done) {
    const payload = { userId: 1 };
    const jwt = generateAuthToken(payload);
    const decodedValue = decodeAuthToken(jwt);

    expect(decodedValue).to.have.all.keys("userId", "iat", "exp");
    expect(decodedValue.userId).to.equal(payload.userId);

    return done();
  });
});
