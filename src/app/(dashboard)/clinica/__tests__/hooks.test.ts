import { act, renderHook } from "@testing-library/react";

import { useClinicaPageModel } from "../hooks";

describe("useClinicaPageModel", () => {
  it("should initialize with referrals", () => {
    const { result } = renderHook(() => useClinicaPageModel());
    expect(Array.isArray(result.current.referrals)).toBe(true);
  });

  it("should compute status counts correctly", () => {
    const { result } = renderHook(() => useClinicaPageModel());
    const { referrals, pendingReferralsCount, agendadosCount, atendidosCount } =
      result.current;

    const expectedPending = referrals.filter(
      (r) => r.status === "Encaminhado",
    ).length;
    const expectedAgendados = referrals.filter(
      (r) => r.status === "Agendado",
    ).length;
    const expectedAtendidos = referrals.filter(
      (r) => r.status === "Atendido",
    ).length;

    expect(pendingReferralsCount).toBe(expectedPending);
    expect(agendadosCount).toBe(expectedAgendados);
    expect(atendidosCount).toBe(expectedAtendidos);
  });

  it("should start with no selected referral", () => {
    const { result } = renderHook(() => useClinicaPageModel());
    expect(result.current.selectedReferral).toBeNull();
  });

  it("should set selected referral and reset schedule form on handleOpenTriage", () => {
    const { result } = renderHook(() => useClinicaPageModel());
    const referral = result.current.referrals[0];

    act(() => {
      result.current.handleOpenTriage(referral);
    });

    expect(result.current.selectedReferral).toEqual(referral);
  });

  it("should clear selected referral via setSelectedReferral", () => {
    const { result } = renderHook(() => useClinicaPageModel());

    act(() => {
      result.current.setSelectedReferral(result.current.referrals[0]);
    });
    expect(result.current.selectedReferral).not.toBeNull();

    act(() => {
      result.current.setSelectedReferral(null);
    });
    expect(result.current.selectedReferral).toBeNull();
  });
});
