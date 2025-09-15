import { expect } from "chai";
import Sinon from "sinon";
import cleanDb from "../../utils/cleanDb.js";
import { addLog  } from "../../../services/logService.js";
import { INTERNAL_SERVER_ERROR  } from "../../../constants/errorMessages.js";

describe("Logs services", function () {
    beforeEach(function () {
      Sinon.restore();
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should successfully add a log", async function () {
      const type = "TEST_LOG";
      const meta = {
        userId: "test-user-123",
        action: "test-action"
      };
      const body = {
        details: "test details",
        status: "success"
      };

      const result = await addLog(type, meta, body);

      expect(result).to.have.property('id');
      expect(typeof result.id).to.equal('string');
      expect(result.id).to.not.be.empty;
    });

    it("should handle errors when adding log fails", async function () {
      
      const type = "TEST_LOG";
      const meta = { userId: "test-user-123" };
      const body = { details: "test details" };

      try {
        await addLog(type, meta, body);
        expect.fail(INTERNAL_SERVER_ERROR);
      } catch (error) {
        expect(error.message).to.equal(INTERNAL_SERVER_ERROR);
      }
    });
});
