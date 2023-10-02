const { expect } = require("chai");
const { removeObjectField } = require("../../../utils/data-access");

describe("removeObjectField", function () {
  it("should remove a field from a nested object", function () {
    const obj = {
      a: {
        b: {
          c: 42,
          d: "hello",
        },
      },
    };

    removeObjectField("a.b.c", obj);

    expect(obj).to.deep.equal({
      a: {
        b: {
          d: "hello",
        },
      },
    });
  });

  it("should remove a field from an array of objects", function () {
    const arr = [
      { id: 1, a: "abc" },
      { id: 2, a: "def" },
      { id: 3, b: "ghi" },
    ];

    removeObjectField("*.a", arr);

    expect(arr).to.deep.equal([{ id: 1 }, { id: 2 }, { id: 3, b: "ghi" }]);
  });

  it("should remove a field from nested array of objects", function () {
    const arr = [
      {
        id: 1,
        a: "abc",
        z: [
          { a: "abc", b: "def" },
          { a: "def", b: "def" },
        ],
      },
      {
        id: 2,
        a: "def",
        z: [
          { a: "abc", b: "def" },
          { a: "def", b: "def" },
        ],
      },
      {
        id: 3,
        b: "ghi",
        z: [
          { a: "abc", b: "def" },
          { a: "def", b: "def" },
        ],
      },
    ];

    removeObjectField("*.z.*.a", arr);

    expect(arr).to.deep.equal([
      {
        id: 1,
        a: "abc",
        z: [{ b: "def" }, { b: "def" }],
      },
      {
        id: 2,
        a: "def",
        z: [{ b: "def" }, { b: "def" }],
      },
      {
        id: 3,
        b: "ghi",
        z: [{ b: "def" }, { b: "def" }],
      },
    ]);
  });
  it("should handle wildcard at the root level", function () {
    const obj = {
      a: {
        b: {
          c: 42,
          d: "hello",
        },
      },
    };

    removeObjectField("*", obj);

    expect(obj).to.deep.equal({});
  });

  it("should not modify the object if the path does not exist", function () {
    const obj = {
      b: {
        c: 42,
        d: "hello",
      },
    };

    removeObjectField("x.y.z", obj);

    expect(obj).to.deep.equal({
      b: {
        c: 42,
        d: "hello",
      },
    });
  });

  it("should handle an empty object gracefully", function () {
    const obj = {};

    removeObjectField("a.b.c", obj);

    expect(obj).to.deep.equal({});
  });

  it("should handle falsy value as object", function () {
    const obj = undefined;

    removeObjectField("a.b.c", obj);

    expect(obj).to.deep.equal(undefined);
  });
});
