import addUser from "../utils/addUser";
import chai from "chai";
const { expect } = chai;
import userDataFixture from "../fixtures/user/user";
import sinon from "sinon";
import chaiHttp from "chai-http";
import cleanDb from "../utils/cleanDb";
import app from "../../server";
import * as requestsQuery from "../../models/requests"
import { REQUEST_STATE, REQUEST_TYPE } from "../../constants/requests";
import { generateAuthToken } from "../../services/authService";
const { BAD_TOKEN } = require("../../constants/bot");
const userData = userDataFixture();
chai.use(chaiHttp);

describe("/requests Onboarding Extension", () => {
    describe("PUT /requests", () => {
        const body = {
            type: REQUEST_TYPE.ONBOARDING,
            state: REQUEST_STATE.APPROVED,
            reason: "test-reason"
        }
        let latestExtension;
        let userId: string;
        let putEndpoint: string;
        let authToken: string;
        let latestApprovedExtension;
        let latestRejectedExtension;

        beforeEach(async () => {
            userId = await addUser(userData[4])
            latestExtension =  await requestsQuery.createRequest({state: REQUEST_STATE.PENDING, type: REQUEST_TYPE.ONBOARDING, requestNumber: 1});
            latestApprovedExtension = await requestsQuery.createRequest({state: REQUEST_STATE.APPROVED, type: REQUEST_TYPE.ONBOARDING, requestNumber: 2});
            latestRejectedExtension = await requestsQuery.createRequest({state: REQUEST_STATE.REJECTED, type: REQUEST_TYPE.ONBOARDING, requestNumber: 2});
            putEndpoint = `/requests/${latestExtension.id}?dev=true`;
            authToken = generateAuthToken({userId});
        })
        afterEach(async () => {
            sinon.restore();
            await cleanDb();
        })

        it("should return Feature not implemented when dev is not true", (done) => {
            chai.request(app)
            .put(`/requests/1111?dev=false`)
            .send(body)
            .set("authorization", `Bearer ${authToken}`)
            .end((err, res)=>{
                if (err) return done(err);
                expect(res.statusCode).to.equal(501);
                expect(res.body.message).to.equal("Feature not implemented");
                done();
            })
        })

        it("should return Unauthenticated User when authorization header is missing", (done) => {
            chai
            .request(app)
            .put(putEndpoint)
            .set("authorization", "")
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(401);
                expect(res.body.message).to.equal("Unauthenticated User");
                done();
            })
        })

        it("should return Unauthenticated User for invalid token", (done) => {
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", `Bearer ${BAD_TOKEN}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(401);
                expect(res.body.message).to.equal("Unauthenticated User");
                done();
            })
        })

        it("should return 400 response for invalid value of state", (done) => {
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send({...body, state: REQUEST_STATE.PENDING})
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal("state must be APPROVED or REJECTED");
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 400 response for invalid extension id", (done) => {
            chai.request(app)
            .put(`/requests/1111?dev=true`)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal("Request does not exist");
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 400 response for invalid type", (done) => {
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send({...body, type: REQUEST_TYPE.OOO})
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal("Request does not exist");
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 400 response when extension state is approved", (done) => {
            chai.request(app)
            .put(`/requests/${latestApprovedExtension.id}?dev=true`)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal("Request already approved");
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 400 response when extension state is rejected", (done) => {
            chai.request(app)
            .put(`/requests/${latestRejectedExtension.id}?dev=true`)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal("Request already rejected");
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 200 for success response when request is approved", (done) => {
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(200);
                expect(res.body.message).to.equal("Request approved successfully");
                done();
            })
        })

        it("should return 200 for success response when request is rejected", (done) => {
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send({...body, state: REQUEST_STATE.REJECTED})
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(200);
                expect(res.body.message).to.equal("Request rejected successfully");
                done();
            })
        })

        it("should return 500 response when fails to update extension request", (done) => {
            sinon.stub(requestsQuery, "updateRequest")
            .throws("Error while creating extension request");
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res)=>{
                if (err) return done(err);
                expect(res.statusCode).to.equal(500);
                expect(res.body.message).to.equal("An internal server error occurred");
                expect(res.body.error).to.equal("Internal Server Error")
                done();
            })
        })
    })
})