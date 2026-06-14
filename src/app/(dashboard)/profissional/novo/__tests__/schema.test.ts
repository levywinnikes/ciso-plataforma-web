import { novoEncaminhamentoSchema } from "../schema";

describe("novoEncaminhamentoSchema", () => {
  const validData = {
    patientName: "João Silva",
    patientBirthDate: "1990-01-15",
    patientPhone: "11987654321",
    patientDocument: "123.456.789-00",
    systemicDiseases: "",
    clinicalNotes: "",
    nucleusId: "glaucoma",
    clinicId: "clinic-id-123",
  };

  it("should accept valid data", () => {
    const result = novoEncaminhamentoSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty patientName", () => {
    const result = novoEncaminhamentoSchema.safeParse({
      ...validData,
      patientName: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.patientName).toContain(
        "errors.patientNameRequired",
      );
    }
  });

  it("should reject phone shorter than 10 digits", () => {
    const result = novoEncaminhamentoSchema.safeParse({
      ...validData,
      patientPhone: "11987",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.patientPhone).toBeDefined();
    }
  });

  it("should reject non-numeric phone", () => {
    const result = novoEncaminhamentoSchema.safeParse({
      ...validData,
      patientPhone: "1198abcd321",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty nucleusId", () => {
    const result = novoEncaminhamentoSchema.safeParse({
      ...validData,
      nucleusId: "",
    });
    expect(result.success).toBe(false);
  });

  it("should allow optional fields to be empty strings", () => {
    const result = novoEncaminhamentoSchema.safeParse({
      ...validData,
      patientDocument: "",
      systemicDiseases: "",
      clinicalNotes: "",
    });
    expect(result.success).toBe(true);
  });
});
