import { scheduleSchema } from "../schema";

describe("scheduleSchema", () => {
  it("should accept valid schedule", () => {
    const result = scheduleSchema.safeParse({
      doctor: "Dr. Fernando Silva",
      scheduleDate: "2026-05-10T14:00",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty doctor", () => {
    const result = scheduleSchema.safeParse({
      doctor: "",
      scheduleDate: "2026-05-10T14:00",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.doctor).toContain(
        "errors.doctorRequired",
      );
    }
  });

  it("should reject empty scheduleDate", () => {
    const result = scheduleSchema.safeParse({
      doctor: "Dr. Fernando Silva",
      scheduleDate: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.scheduleDate).toContain(
        "errors.dateRequired",
      );
    }
  });
});
