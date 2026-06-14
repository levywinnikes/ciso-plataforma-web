import { editSurgerySchema } from "../schema";

describe("editSurgerySchema", () => {
  it("should accept valid surgery input", () => {
    const result = editSurgerySchema.safeParse({
      name: "Catarata",
      defaultPrice: 3000,
      active: true,
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = editSurgerySchema.safeParse({
      name: "",
      defaultPrice: 3000,
      active: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain(
        "errors.nameRequired",
      );
    }
  });

  it("should reject zero price", () => {
    const result = editSurgerySchema.safeParse({
      name: "Catarata",
      defaultPrice: 0,
      active: true,
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative price", () => {
    const result = editSurgerySchema.safeParse({
      name: "Catarata",
      defaultPrice: -500,
      active: true,
    });
    expect(result.success).toBe(false);
  });
});
