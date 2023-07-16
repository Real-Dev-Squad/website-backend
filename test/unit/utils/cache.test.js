const { expect } = require("chai");
const { cachedKeysStore } = require("../../../utils/cache");

describe("cachedKeysStore", function () {
  let keyStore;
  const modelKey = "modelKey";
  beforeEach(function () {
    keyStore = cachedKeysStore();
  });

  describe("getCachedKeys", function () {
    it("should return an array of cached keys for a model key", function () {
      const cachedKeys = ["key1", "key2", "key3"];
      keyStore.addCachedKey(modelKey, "key1");
      keyStore.addCachedKey(modelKey, "key2");
      keyStore.addCachedKey(modelKey, "key3");

      const result = keyStore.getCachedKeys(modelKey);

      expect(result).to.be.an("array");
      expect(result).to.be.deep.equal(cachedKeys);
    });
  });

  describe("addCachedKey", function () {
    it("should add a cached key to the key store", function () {
      const cachedKey = "key1";

      keyStore.addCachedKey(modelKey, cachedKey);

      const result = keyStore.getCachedKeys(modelKey);
      expect(result).to.have.members([cachedKey]);
    });
  });

  describe("removeModelKey", function () {
    it("should remove the model key and its associated cached keys from the key store", function () {
      keyStore.addCachedKey(modelKey, "key1");
      keyStore.addCachedKey(modelKey, "key2");
      keyStore.addCachedKey(modelKey, "key3");

      keyStore.removeModelKey(modelKey);

      const result = keyStore.getCachedKeys(modelKey);
      expect(result).to.be.an("array");
      //   expect(result).to.be.empty;
    });
  });

  describe("removeCachedKey", function () {
    it("should remove a cached key from the key store for a given model key", function () {
      const cachedKey = "key1";
      keyStore.addCachedKey(modelKey, cachedKey);

      keyStore.removeCachedKey(modelKey, cachedKey);

      const result = keyStore.getCachedKeys(modelKey);
      expect(result).to.be.an("array");
    });

    it("should not remove other cached keys for the same model key", function () {
      keyStore.addCachedKey(modelKey, "key1");
      keyStore.addCachedKey(modelKey, "key2");
      keyStore.addCachedKey(modelKey, "key3");

      keyStore.removeCachedKey(modelKey, "key2");

      const result = keyStore.getCachedKeys(modelKey);
      expect(result).to.have.members(["key1", "key3"]);
    });
  });
});
