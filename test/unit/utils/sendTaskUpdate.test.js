import chai from "chai";
import sinon from "sinon";
import { sendTaskUpdate } from "../../../utils/sendTaskUpdate";
const { expect } = chai;

describe("sendTaskUpdate function", function () {
  let fetchMock;

  beforeEach(function () {
    fetchMock = sinon.stub(global, "fetch");
  });

  afterEach(function () {
    fetchMock.restore();
  });

  it("should send task update successfully", async function () {
    fetchMock.resolves({ ok: true });

    const result = await sendTaskUpdate("Task completed", "No blockers", "Plan for the next phase");
    expect(result).to.equal(undefined);
  });

  it("should throw an error if fails", async function () {
    const error = new Error("Error");
    fetchMock.rejects(error);
    try {
      await sendTaskUpdate("Task completed", "No blockers", "Plan for the next phase");
    } catch (err) {
      expect(err).to.be.equal(error);
    }
  });
});
