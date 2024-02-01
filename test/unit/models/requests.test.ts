import { expect } from "chai";
import cleanDb from "../../utils/cleanDb";
import { createOooRequest } from "../../../models/oooRequests";
import { createOooStatusRequests } from "./../../fixtures/oooRequest/oooRequest";

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
});