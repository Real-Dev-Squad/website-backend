import chai from "chai";
import Sinon from "sinon";
import { logType } from "../../../constants/logs";
import { addLog } from "../../../models/logs";
import firestore from "../../../utils/firestore";
import { addDiscordRoleToUser } from "../../../utils/addDiscordRoleToUser";
import discordServices from "../../../services/discordService";
import cleanDb from "../../utils/cleanDb";
const { expect } = chai;
const logsModel = firestore.collection("logs");

describe("addDiscordRoleToUser", function () {
    let discordId;
    let roleid;
    let addRoleToUserStub;

    beforeEach(async function () {
        discordId = "1234567890";
        roleid = "9876543210";
        addRoleToUserStub = Sinon.stub(discordServices, "addRoleToUser");
    });

    afterEach(async function () {
        await cleanDb();
        addRoleToUserStub.restore();
    });

    it("should add discord role successfully", async function () {
        await addLog(
            logType.ADD_ROLE_TO_USER_SUCCESS,
            { roleId: roleid, discordId: discordId },
            { message: "Developer role added successfully to user" }
        );

        addRoleToUserStub.returns(
            Promise.resolve({ success: true, message: "Role added successfully" })
        );

        const isDiscordRoleAdded = await addDiscordRoleToUser(discordId, roleid, "Developer");
        const successLog = await logsModel
            .where("type", "==", logType.ADD_ROLE_TO_USER_SUCCESS)
            .where("meta.roleId", "==", roleid)
            .where("meta.discordId", "==", discordId)
            .limit(1)
            .get();

        expect(isDiscordRoleAdded.success).to.be.equal(true);
        expect(isDiscordRoleAdded.message).to.be.equal("Developer role added successfully");
        expect(successLog.docs[0].data().body.message).to.be.equal("Developer role added successfully to user");
    });

    it("should return failure when discord service returns unsuccessful response", async function () {
        addRoleToUserStub.returns(
            Promise.resolve({ success: false, message: "Role not found" })
        );

        const isDiscordRoleAdded = await addDiscordRoleToUser(discordId, roleid, "New");
        const failedLog = await logsModel
            .where("type", "==", logType.ADD_ROLE_TO_USER_FAILED)
            .where("meta.roleId", "==", roleid)
            .where("meta.discordId", "==", discordId)
            .limit(1)
            .get();

        expect(isDiscordRoleAdded.success).to.be.equal(false);
        expect(isDiscordRoleAdded.message).to.include("Adding New role to discord failed");
        expect(failedLog.docs[0].data().body.message).to.include("Adding New role to discord failed");
    });

    it("should throw an error if adding role to discord failed", async function () {
        addRoleToUserStub.rejects(new Error("Discord API error"));

        const isDiscordRoleAdded = await addDiscordRoleToUser(discordId, roleid, "Developer");
        const failedLog = await logsModel
            .where("type", "==", logType.ADD_ROLE_TO_USER_FAILED)
            .where("meta.roleId", "==", roleid)
            .where("meta.discordId", "==", discordId)
            .limit(1)
            .get();

        expect(isDiscordRoleAdded.success).to.be.equal(false);
        expect(isDiscordRoleAdded.message).to.be.equal("Discord API error");
        expect(failedLog.docs[0].data().body.message).to.be.equal("Discord API error");
    });

    it("should handle unknown error response from discord service", async function () {
        addRoleToUserStub.returns(Promise.resolve({ success: false }));

        const isDiscordRoleAdded = await addDiscordRoleToUser(discordId, roleid, "Developer");
        const failedLog = await logsModel
            .where("type", "==", logType.ADD_ROLE_TO_USER_FAILED)
            .where("meta.roleId", "==", roleid)
            .where("meta.discordId", "==", discordId)
            .limit(1)
            .get();

        expect(isDiscordRoleAdded.success).to.be.equal(false);
        expect(isDiscordRoleAdded.message).to.include("Unknown error");
        expect(failedLog.docs[0].data().body.message).to.include("Unknown error");
    });
});
