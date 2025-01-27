import { 
    INVALID_REQUEST_DEADLINE, 
    INVALID_REQUEST_TYPE, 
    PENDING_REQUEST_UPDATED, 
    REQUEST_DOES_NOT_EXIST, 
    REQUEST_STATE, 
    REQUEST_TYPE, 
    UNAUTHORIZED_TO_UPDATE_REQUEST 
} from "../../../constants/requests"
import { 
    updateOnboardingExtensionRequest, 
    validateOnboardingExtensionUpdateRequest 
} from "../../../services/onboardingExtension"
import { expect } from "chai"
import firestore from "../../../utils/firestore";
import { convertDaysToMilliseconds } from "../../../utils/time";
import cleanDb from "../../utils/cleanDb";
const requestModel = firestore.collection("requests");
import * as logService from "../../../services/logService";
import sinon from "sinon";

describe("Test Onboarding Extension Service", () => {
    let validExtensionRequest;
    let validExtensionRequestDoc;
    const userId = "11111";
    const errorMessage = "Unexpected error occured";

    beforeEach(async ()=>{
        validExtensionRequest = await requestModel.add({
            type: REQUEST_TYPE.ONBOARDING,
            oldEndsOn: Date.now() - convertDaysToMilliseconds(2),
            state: REQUEST_STATE.PENDING,
            userId,
        })
        validExtensionRequestDoc = await requestModel.doc(validExtensionRequest.id).get();
    })

    afterEach(async ()=>{
        await cleanDb();
        sinon.restore();
    })

    describe("validateOnboardingExtensionUpdateRequest", () => {  
        let invalidTypeRequest;
        let invalidTypeRequestDoc;
        let invalidStateRequest;
        let invalidStateRequestDoc;
        let invalidDeadlineRequest;
        let invalidDeadlineRequestDoc;
        
        beforeEach(async ()=>{
            invalidTypeRequest = await requestModel.add({
                type: REQUEST_TYPE.OOO,
                userId,
            });
            invalidTypeRequestDoc = await requestModel.doc(invalidTypeRequest.id).get();
            invalidStateRequest = await requestModel.add({
                state: REQUEST_STATE.APPROVED,
                userId,
                type: REQUEST_TYPE.ONBOARDING,
            })
            invalidStateRequestDoc = await requestModel.doc(invalidStateRequest.id).get();
            invalidDeadlineRequest = await requestModel.add({
                type: REQUEST_TYPE.ONBOARDING,
                state: REQUEST_STATE.PENDING,
                oldEndsOn: Date.now() + convertDaysToMilliseconds(2),
                userId,
            })
            invalidDeadlineRequestDoc = await requestModel.doc(invalidDeadlineRequest.id).get();
        })

        afterEach(async ()=>{
            await cleanDb();
            sinon.restore();
        })

        it("should return undefined when all validation checks passes", async () => {
            const response = await validateOnboardingExtensionUpdateRequest(
                validExtensionRequestDoc,
                validExtensionRequest.id,
                true,
                userId,
                Date.now()
            )
            expect(response).to.be.undefined;
        });

        it("should return REQUEST_DOES_NOT_EXIST error", async () => {
            const response = await validateOnboardingExtensionUpdateRequest(
                false,
                "23345",
                false,
                "2341",
                Date.now(),
            );
            expect(response).to.not.be.undefined;
            expect(response.error).to.equal(REQUEST_DOES_NOT_EXIST)
        });

        it("shoud return UNAUTHORIZED_TO_UPDATE_REQUEST error when super user and request owner are not updating request", async () => {
            const response = await validateOnboardingExtensionUpdateRequest(
                validExtensionRequestDoc,
                validExtensionRequest.id,
                false,
                "2333",
                Date.now()
            );
            expect(response).to.be.not.undefined;
            expect(response.error).to.equal(UNAUTHORIZED_TO_UPDATE_REQUEST);
        });

        it("should return INVALID_REQUEST_TYPE error", async () => {
            const response = await validateOnboardingExtensionUpdateRequest(
                invalidTypeRequestDoc,
                invalidTypeRequest.id,
                true,
                userId,
                Date.now()
            )
            expect(response).to.be.not.undefined;
            expect(response.error).to.equal(INVALID_REQUEST_TYPE);
        });

        it("should return PENDING_REQUEST_UPDATED error", async () => {
            const response = await validateOnboardingExtensionUpdateRequest(
                invalidStateRequestDoc,
                invalidStateRequest.id,
                true,
                userId,
                Date.now()
            )
            expect(response).to.be.not.undefined;
            expect(response.error).to.equal(PENDING_REQUEST_UPDATED);
        });

        it("should return INVALID_REQUEST_DEADLINE error", async () => {
            const response = await validateOnboardingExtensionUpdateRequest(
                invalidDeadlineRequestDoc,
                invalidDeadlineRequest.id,
                true,
                userId,
                Date.now(),
            )
            expect(response).to.be.not.undefined;
            expect(response.error).to.equal(INVALID_REQUEST_DEADLINE);
        });

        it("should throw error", async () => {
            sinon.stub(logService, "addLog").throws(new Error(errorMessage));
            try{
                await validateOnboardingExtensionUpdateRequest(
                    validExtensionRequestDoc,
                    validExtensionRequest.id,
                    false,
                    "1111",
                    Date.now(),
                )
            }catch(error){
                expect(error.message).to.equal(errorMessage);
            }
        })
    });

    describe("updateOnboardingExtensionRequest", () => {
        it("should update request", async () => {
            const newDate =  Date.now();
            const response = await updateOnboardingExtensionRequest(
                validExtensionRequest.id,
                {   
                    reason:"test-reason",
                    newEndsOn: newDate,
                    type: REQUEST_TYPE.ONBOARDING,
                },
                userId,
            );
            expect(response).to.be.not.undefined;
            expect(response.lastModifiedBy).to.equal(userId);
            expect(response.newEndsOn).to.equal(newDate);
            expect(response.reason).to.equal("test-reason");
            expect(new Date(response.updatedAt).toDateString()).to.equal(new Date(newDate).toDateString());
        });

        it("should throw error", async () => {
            sinon.stub(logService, "addLog").throws(new Error(errorMessage));
            try{
                await updateOnboardingExtensionRequest(
                    validExtensionRequest.id,
                    {   
                        reason:"test-reason",
                        newEndsOn: Date.now(),
                        type: REQUEST_TYPE.ONBOARDING,
                    },
                    userId,
                );
            }catch(error){
                expect(error.message).to.equal(errorMessage);
            }
        });
    })
})