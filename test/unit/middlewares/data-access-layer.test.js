const { expect } = require("chai");
const sinon = require("sinon");
const { dataAccessMiddleware } = require("../../../utils/data-access");
const { SUPERUSER } = require("../../../constants/roles");

describe("dataAccessMiddleware", function () {
  it("should remove sensitive fields from the response body based if the user does not have access", function () {
    const req = { userData: {} };

    const res = {
      send: (body) => {
        expect(body).to.deep.equal({
          publicField: "publicValue",
        });
      },
    };

    const next = sinon.spy();
    const rules = [
      {
        allowedRoles: [SUPERUSER],
        keyPath: "privateField",
      },
      {
        allowedRoles: [SUPERUSER],
        keyPath: "privateField2",
      },
    ];

    const middleware = dataAccessMiddleware({ rules });

    middleware(req, res, next);

    res.send({ privateField: "privateValue", privateField2: "privateValue", publicField: "publicValue" });
  });

  it("should not remove sensitive fields from the response body if the user has access", function () {
    const req = { userData: { roles: { super_user: true } } };

    const res = {
      send: (body) => {
        expect(body).to.deep.equal({ privateField: "privateValue", publicField: "publicValue" });
      },
    };

    const next = sinon.spy();
    const rules = [
      {
        allowedRoles: [SUPERUSER],
        keyPath: "privateField",
      },
    ];

    const middleware = dataAccessMiddleware({ rules });

    middleware(req, res, next);

    res.send({ privateField: "privateValue", publicField: "publicValue" });
  });
});
