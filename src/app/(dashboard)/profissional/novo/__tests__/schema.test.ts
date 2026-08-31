import { novoEncaminhamentoSchema } from "../schema";

describe("novoEncaminhamentoSchema", () => {
  const validData = {
    patientName: "João Silva",
    patientBirthDate: "15/01/1990",
    patientPhone: "11987654321",
    patientDocument: "123.456.789-00",
    systemicDiseases: "",
    clinicalNotes: "",
    nucleusId: "glaucoma",
    clinicId: "clinic-id-123",
    status: "Encaminhado" as const,
    justificativaBloqueio: "",
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

  it("should require justificativa when status is Bloqueado", () => {
    const result = novoEncaminhamentoSchema.safeParse({
      ...validData,
      status: "Bloqueado",
      justificativaBloqueio: "",
    });
    expect(result.success).toBe(false);
  });

  it("should accept Bloqueado with justificativa", () => {
    const result = novoEncaminhamentoSchema.safeParse({
      ...validData,
      status: "Bloqueado",
      justificativaBloqueio: "Cliente ainda não decidiu horário",
    });
    expect(result.success).toBe(true);
  });

  it("should accept birth date as dd/mm/aaaa", () => {
    const result = novoEncaminhamentoSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject ISO birth date in the form", () => {
    const result = novoEncaminhamentoSchema.safeParse({
      ...validData,
      patientBirthDate: "1990-01-15",
    });
    expect(result.success).toBe(false);
  });

  it("should reject a partial birth date", () => {
    const result = novoEncaminhamentoSchema.safeParse({
      ...validData,
      patientBirthDate: "10",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.patientBirthDate).toContain(
        "errors.birthDateInvalid",
      );
    }
  });
});
