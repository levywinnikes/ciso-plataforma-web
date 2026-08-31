import {
  birthDateSchema,
  isValidBirthDateInput,
  maskBirthDateInput,
  parseBirthDate,
  parseBirthDateOrNull,
  toBirthDateInputValue,
} from "../birth-date";

describe("birth-date", () => {
  it("masks digits as dd/mm/aaaa", () => {
    expect(maskBirthDateInput("1")).toBe("1");
    expect(maskBirthDateInput("15")).toBe("15");
    expect(maskBirthDateInput("1501")).toBe("15/01");
    expect(maskBirthDateInput("15011990")).toBe("15/01/1990");
    expect(maskBirthDateInput("15/01/1990extra")).toBe("15/01/1990");
  });

  it("accepts a real calendar date", () => {
    expect(isValidBirthDateInput("15/01/1990")).toBe(true);
    expect(isValidBirthDateInput("29/02/2020")).toBe(true);
  });

  it("rejects invalid or future dates", () => {
    expect(isValidBirthDateInput("32/01/1990")).toBe(false);
    expect(isValidBirthDateInput("29/02/2019")).toBe(false);
    expect(isValidBirthDateInput("15/01/1899")).toBe(false);
    expect(isValidBirthDateInput("01/01/2099")).toBe(false);
    expect(isValidBirthDateInput("1990-01-15")).toBe(false);
    expect(isValidBirthDateInput("15/01/")).toBe(false);
    expect(isValidBirthDateInput("10")).toBe(false);
    expect(isValidBirthDateInput("10/01")).toBe(false);
  });

  it("rejects incomplete typed dates in the schema", () => {
    expect(birthDateSchema.safeParse("10").success).toBe(false);
    expect(birthDateSchema.safeParse("10/01").success).toBe(false);
    expect(birthDateSchema.safeParse("15/01/1990").success).toBe(true);
  });

  it("converts ISO from the API to the form value", () => {
    expect(toBirthDateInputValue("1990-01-15")).toBe("15/01/1990");
    expect(toBirthDateInputValue("15/01/1990")).toBe("15/01/1990");
    expect(toBirthDateInputValue("")).toBe("");
  });

  it("parses typed dates for persistence", () => {
    const date = parseBirthDate("15/01/1990");
    expect(date.getFullYear()).toBe(1990);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(15);
  });

  it("does not persist a partial date", () => {
    expect(parseBirthDateOrNull("10")).toBeNull();
    expect(parseBirthDateOrNull("10/01")).toBeNull();
    expect(parseBirthDateOrNull("15/01/1990")?.getFullYear()).toBe(1990);
    expect(parseBirthDateOrNull("1990-01-15")?.getDate()).toBe(15);
  });
});
