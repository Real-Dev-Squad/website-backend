import { createInviteLinkModel, getInviteLinkModel } from "../../../models/invites";
import { inviteData, InviteBodyData } from "../../fixtures/invites/invitesData";
import { InviteBody, Invite } from "../../../types/invites";

import Sinon from "sinon";
import { expect } from "chai";

const cleanDb = require("../../utils/cleanDb");

describe("invites/moodel", function () {
  afterEach(async function () {
    await cleanDb();
    Sinon.restore();
  });
  describe("createInviteLinkModel", function () {
    it("should create a invite link in db with the given data", async function () {
  const createdInviteLink = await createInviteLinkModel({...InviteBodyData, inviteLink: "https://discord.gg/invite_1"});
      expect(createdInviteLink).to.be.a("object");
    });
  });

  it("should throw error invitelink is already created", async function () {
    await createInviteLinkModel({...InviteBodyData, inviteLink: "https://discord.gg/invite_1"});
    try {
      await createInviteLinkModel({...InviteBodyData, inviteLink: "https://discord.gg/invite_1"});
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal("Invite link is already created");
    }
  });

  describe("getInviteLinkModel", function () {
    it("should get invite link from db with the given data", async function () {
      await createInviteLinkModel({...InviteBodyData, inviteLink: "https://discord.gg/invite_1"});
      const inviteLink = await getInviteLinkModel(InviteBodyData.userId);
      expect(inviteLink).to.be.a("object");
      expect(inviteLink.userId).to.equal(InviteBodyData.userId);
      expect(inviteLink.purpose).to.equal(InviteBodyData.purpose);
      expect(inviteLink.inviteLink).to.equal("https://discord.gg/invite_1");
      expect(inviteLink.createdAt).to.be.a("number");
    });
  });

  it("should reutrn error not found if invite link is not created", async function () {
    try {
      await getInviteLinkModel(InviteBodyData.userId);
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal("Invite link not found");
    }
  });
});
