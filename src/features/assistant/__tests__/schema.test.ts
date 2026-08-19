import { assistantChatFormSchema } from "../schema";

describe("assistantChatFormSchema", () => {
  it("accepts a normal question", () => {
    const result = assistantChatFormSchema.safeParse({
      message: "Como marco um encaminhamento como atendido?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty question", () => {
    const result = assistantChatFormSchema.safeParse({ message: "   " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.message).toContain(
        "errors.required",
      );
    }
  });
});
