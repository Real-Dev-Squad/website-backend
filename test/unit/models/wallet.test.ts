import { expect } from "chai";
import firestore from "../../../utils/firestore.js";
import addUser from "../../utils/addUser.js";
import cleanDb from "../../utils/cleanDb.js";

import * as walletQuery from "../../../models/wallets.js";
import currencies from "../../fixtures/currencies/currencies.js";
import userDataArray from "../../fixtures/user/user.js";

const walletModel = firestore.collection("wallets");

describe("wallets", function () {
  let userId;
  let wallet;

  beforeEach(async function () {
    userId = await addUser();
    wallet = await walletQuery.createWallet(userId, currencies.default);
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("createWallet", function () {
    it("should add the wallet to collection and return the id and data", async function () {
      const data = (await walletModel.doc(wallet.id).get()).data();

      expect(data).to.be.a("Object");
      expect(data.isActive).to.be.equal(true);
      expect(data.userId).to.be.equal(userId);
      expect(data.currencies).to.deep.equal(currencies.default);

      expect(wallet.data.isActive).to.be.equal(true);
      expect(wallet.data.userId).to.be.equal(userId);
      expect(wallet.data.currencies).to.deep.equal(currencies.default);
    });
  });

  describe("fetchWallet", function () {
    it("should return the wallet when passing valid userId with wallet", async function () {
      const response = await walletQuery.fetchWallet(userId);

      expect(response).to.be.a("Object");
      expect(response.id).to.be.equal(wallet.id);
      expect(response.isActive).to.be.equal(true);
      expect(response.userId).to.be.equal(userId);
      expect(response.currencies).to.deep.equal(currencies.default);
    });

    it("should return null when passing invalid userId", async function () {
      const response = await walletQuery.fetchWallet("invalid");

      expect(response).to.be.equal(null);
    });
  });

  describe("updateWallet", function () {
    it("should return true and update the user's wallet", async function () {
      const response = await walletQuery.updateWallet(userId, currencies.modified);
      const data = (await walletModel.doc(wallet.id).get()).data();

      expect(data).to.be.a("Object");
      expect(data.isActive).to.be.equal(true);
      expect(data.userId).to.be.equal(userId);
      expect(data.currencies).to.deep.equal(currencies.modified);
      expect(response).to.be.equal(true);
    });

    it("should return true and create a wallet when passing new userId", async function () {
      const newUserId = await addUser(userDataArray[2]);
      const response = await walletQuery.updateWallet(newUserId, currencies.modified);
      const [walletRef] = (await walletModel.where("userId", "==", newUserId).limit(1).get()).docs;
      const data = walletRef.data();

      expect(data).to.be.a("Object");
      expect(data.isActive).to.be.equal(true);
      expect(data.userId).to.be.equal(newUserId);
      expect(data.currencies).to.deep.equal(currencies.modified);

      expect(response).to.be.equal(true);
    });
  });
});
