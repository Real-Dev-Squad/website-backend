const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");
import { sendTaskUpdate } from "../../../utils/sendTaskUpdate";

describe("sendTaskUpdate function", () => {
  const completed = "Task completed";
  const planned = "Plan for the next phase";
  const blockers = "No blockers";
  let fetchMock;

  beforeEach(() => {
    fetchMock = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it("should send task update successfully", async () => {
    const expectedUrl = `${DISCORD_BASE_URL}/task/update`;
    const expectedBody = {
      content: {
        completed,
        planned,
        blockers,
      },
    };
    const expectedHeaders = {
      "Content-Type": "application/json",
    };
    const expectedResponse = {};
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(expectedResponse),
    });
    await sendTaskUpdate(completed, planned, blockers);
    expect(fetchMock).toHaveBeenCalledWith(expectedUrl, {
      method: "POST",
      headers: expectedHeaders,
      body: JSON.stringify(expectedBody),
    });
  });

  it("should throw an error if fetch fails", async () => {
    const error = new Error("Failed to fetch");
    fetchMock.mockRejectedValue(error);
    await expect(sendTaskUpdate(completed, planned, blockers)).rejects.toThrowError(error);
  });
});
