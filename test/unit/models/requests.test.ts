import { expect } from "chai";
import cleanDb from "../../utils/cleanDb";
import { createOooRequest, updateOooRequest } from "../../../models/oooRequests";
import { createOooStatusRequests, updateOooApprovedRequests,updateOooRejectedRequests } from "./../../fixtures/oooRequest/oooRequest";

describe("models/oooRequests", () => {
    afterEach(async () => {
        await cleanDb();
    });

    describe("createOooRequest", () => {
        it("should add a new OOO request to the database", async () => {
            const oooRequest = await createOooRequest(createOooStatusRequests);
            expect(oooRequest).to.not.be.null;
            expect(oooRequest).to.have.property("id");
            expect(oooRequest).to.have.property("requestedBy");
        });

        it("should throw an error if the user already has an OOO request", async () => {
            await createOooRequest(createOooStatusRequests);
              try {
                await createOooRequest(createOooStatusRequests);
                expect.fail("User already has an OOO request");

              } catch (error) {
                expect(error.message).to.equal("User already has an OOO request");
              }
        });
    });

    describe("updateOooRequest", () => {
        it("should update an existing OOO request", async () => {
            const oooRequest :any= await createOooRequest(createOooStatusRequests);
            const updatedOooRequest:any = await updateOooRequest(oooRequest.id, updateOooApprovedRequests, updateOooApprovedRequests.lastModifiedBy);
            expect(updatedOooRequest).to.not.be.null;
            expect(updatedOooRequest).to.have.property("state");
            expect(updatedOooRequest.state).to.equal(updateOooApprovedRequests.state);
        });

        it("should throw an error if the OOO request does not exist", async () => {
            try {
                await updateOooRequest("randomId", updateOooApprovedRequests, updateOooApprovedRequests.lastModifiedBy);
                expect.fail("OOO request does not exist");
            } catch (error) {
                expect(error.message).to.equal("OOO request does not exist");
            }
        });

        it("should throw an error if the OOO request is already approved", async () => {
            const oooRequest :any= await createOooRequest(createOooStatusRequests);
            await updateOooRequest(oooRequest.id, updateOooApprovedRequests, updateOooApprovedRequests.lastModifiedBy);
            try {
                await updateOooRequest(oooRequest.id, updateOooApprovedRequests, updateOooApprovedRequests.lastModifiedBy);
                expect.fail("OOO request is already approved");
            } catch (error) {
                expect(error.message).to.equal("OOO request is already approved");
            }
        });

        it("should throw an error if the OOO request is already rejected", async () => {
            const oooRequest:any = await createOooRequest(createOooStatusRequests);
            await updateOooRequest(oooRequest.id, updateOooRejectedRequests, updateOooRejectedRequests.lastModifiedBy);
            try {
                await updateOooRequest(oooRequest.id, updateOooApprovedRequests, updateOooApprovedRequests.lastModifiedBy);
                expect.fail("OOO request is already rejected");
            } catch (error) {
                expect(error.message).to.equal("OOO request is already rejected");
            }
        });
    });
});