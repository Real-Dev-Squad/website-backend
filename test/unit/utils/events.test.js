const { expect } = require("chai");
const { removeUnwantedProperties } = require("../../../utils/events");

describe("removeUnwantedProperties", function () {
  it("should remove unwanted properties from an object", function () {
    const propertiesToRemove = ["property2", "property4"];
    const data = {
      property1: "value1",
      property2: "value2",
      property3: "value3",
      property4: "value4",
    };

    const cleanData = removeUnwantedProperties(propertiesToRemove, data);

    expect(cleanData).to.deep.equal({
      property1: "value1",
      property3: "value3",
    });
  });

  it("should remove unwanted properties from an array of objects", function () {
    const propertiesToRemove = ["property2", "property4"];
    const data = [
      {
        property1: "value1",
        property2: "value2",
        property3: "value3",
        property4: "value4",
      },
      {
        property1: "value5",
        property2: "value6",
        property3: "value7",
        property4: "value8",
      },
    ];

    const cleanData = removeUnwantedProperties(propertiesToRemove, data);

    expect(cleanData).to.deep.equal([
      {
        property1: "value1",
        property3: "value3",
      },
      {
        property1: "value5",
        property3: "value7",
      },
    ]);
  });

  it("should return empty object if data is not an object or array", function () {
    const propertiesToRemove = ["property2"];
    const data = "not an object or array";

    const cleanData = removeUnwantedProperties(propertiesToRemove, data);

    expect(cleanData).to.deep.equal({});
  });
});
