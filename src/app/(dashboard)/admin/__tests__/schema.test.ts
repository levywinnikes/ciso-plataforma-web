import { nucleusSchema, serviceSchema } from "../schema";

describe("serviceSchema", () => {
  it("should accept valid service", () => {
    const result = serviceSchema.safeParse({ name: "Tonometria", price: 70 });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = serviceSchema.safeParse({ name: "", price: 70 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain(
        "Nome é obrigatório",
      );
    }
  });

  it("should reject zero price", () => {
    const result = serviceSchema.safeParse({ name: "Exame", price: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject negative price", () => {
    const result = serviceSchema.safeParse({ name: "Exame", price: -10 });
    expect(result.success).toBe(false);
  });

  it("should reject NaN price", () => {
    const result = serviceSchema.safeParse({ name: "Exame", price: NaN });
    expect(result.success).toBe(false);
  });
});

describe("nucleusSchema", () => {
  const validNucleus = {
    name: "Nucleo Glaucoma",
    description: "Avaliação para glaucoma",
    price: 650,
  };

  it("should accept valid nucleus", () => {
    const result = nucleusSchema.safeParse(validNucleus);
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = nucleusSchema.safeParse({ ...validNucleus, name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject empty description", () => {
    const result = nucleusSchema.safeParse({
      ...validNucleus,
      description: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.description).toContain(
        "Descrição é obrigatória",
      );
    }
  });

  it("should reject zero price", () => {
    const result = nucleusSchema.safeParse({ ...validNucleus, price: 0 });
    expect(result.success).toBe(false);
  });
});
