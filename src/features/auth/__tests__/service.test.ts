import { canAccessPath, resolveRolePath } from "../service";
import type { UserRole } from "../types";

describe("resolveRolePath", () => {
  const cases: Array<[UserRole, string]> = [
    ["ADMINISTRATIVO", "/admin"],
    ["MEDICO", "/medico"],
    ["PROFISSIONAL", "/profissional"],
  ];

  it.each(cases)("role %s should resolve to %s", (role, expected) => {
    expect(resolveRolePath(role)).toBe(expected);
  });
});

describe("canAccessPath", () => {
  describe("ADMINISTRATIVO", () => {
    it("can access /admin", () => {
      expect(canAccessPath("ADMINISTRATIVO", "/admin")).toBe(true);
    });

    it("can access /admin/financeiro", () => {
      expect(canAccessPath("ADMINISTRATIVO", "/admin/financeiro")).toBe(true);
    });

    it("cannot access /medico", () => {
      expect(canAccessPath("ADMINISTRATIVO", "/medico")).toBe(false);
    });

    it("cannot access /profissional", () => {
      expect(canAccessPath("ADMINISTRATIVO", "/profissional")).toBe(false);
    });
  });

  describe("MEDICO", () => {
    it("can access /medico", () => {
      expect(canAccessPath("MEDICO", "/medico")).toBe(true);
    });

    it("cannot access /admin", () => {
      expect(canAccessPath("MEDICO", "/admin")).toBe(false);
    });

    it("cannot access /profissional", () => {
      expect(canAccessPath("MEDICO", "/profissional")).toBe(false);
    });
  });

  describe("PROFISSIONAL", () => {
    it("can access /profissional", () => {
      expect(canAccessPath("PROFISSIONAL", "/profissional")).toBe(true);
    });

    it("can access /profissional/novo", () => {
      expect(canAccessPath("PROFISSIONAL", "/profissional/novo")).toBe(true);
    });

    it("cannot access /admin", () => {
      expect(canAccessPath("PROFISSIONAL", "/admin")).toBe(false);
    });
  });

  describe("public paths (any role)", () => {
    it("any role can access /login", () => {
      const roles: UserRole[] = ["ADMINISTRATIVO", "MEDICO", "PROFISSIONAL"];
      for (const role of roles) {
        expect(canAccessPath(role, "/login")).toBe(true);
      }
    });

    it("any role can access /", () => {
      const roles: UserRole[] = ["ADMINISTRATIVO", "MEDICO", "PROFISSIONAL"];
      for (const role of roles) {
        expect(canAccessPath(role, "/")).toBe(true);
      }
    });
  });

  describe("case insensitivity", () => {
    it("handles uppercase path segments", () => {
      expect(canAccessPath("ADMINISTRATIVO", "/ADMIN")).toBe(true);
    });

    it("handles mixed case path segments", () => {
      expect(canAccessPath("MEDICO", "/Medico")).toBe(true);
    });
  });
});
