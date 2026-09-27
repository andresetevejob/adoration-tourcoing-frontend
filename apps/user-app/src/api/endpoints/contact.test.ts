import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendContactMessage, type ContactMessageDto } from "./contact";

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));

vi.mock("../client", () => ({
  apiClient: {
    get: vi.fn(),
    post: postMock,
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("api/endpoints/contact (user-app)", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("sendContactMessage() effectue un POST /contact avec le dto fourni", async () => {
    postMock.mockResolvedValueOnce(undefined);
    const dto: ContactMessageDto = { nom: "Jean", email: "jean@test.fr", sujet: "info", message: "Bonjour" };

    await sendContactMessage(dto);

    expect(postMock).toHaveBeenCalledWith("/contact", dto);
  });
});
