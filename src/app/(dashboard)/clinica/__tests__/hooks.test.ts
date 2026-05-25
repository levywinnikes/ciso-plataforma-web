import { act, renderHook, waitFor } from "@testing-library/react";

import { useClinicaPageModel } from "../hooks";

const mockReferrals = [
  {
    id: "r1",
    patientName: "João",
    status: "Encaminhado",
    doctor: "",
    appointmentDate: "",
  },
];

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockReferrals),
    } as Response),
  ) as jest.Mock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useClinicaPageModel", () => {
  it("should initialize with referrals", async () => {
    const { result } = renderHook(() => useClinicaPageModel());
    await waitFor(() =>
      expect(result.current.referrals.length).toBeGreaterThan(0),
    );
    expect(Array.isArray(result.current.referrals)).toBe(true);
  });

  it("should compute status counts correctly", async () => {
    const { result } = renderHook(() => useClinicaPageModel());
    await waitFor(() =>
      expect(result.current.referrals.length).toBeGreaterThan(0),
    );
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

  it("should start with no selected referral", async () => {
    const { result } = renderHook(() => useClinicaPageModel());
    await waitFor(() =>
      expect(result.current.referrals.length).toBeGreaterThan(0),
    );
    expect(result.current.selectedReferral).toBeNull();
  });

  it("should set selected referral and reset schedule form on handleOpenTriage", async () => {
    const { result } = renderHook(() => useClinicaPageModel());
    await waitFor(() =>
      expect(result.current.referrals.length).toBeGreaterThan(0),
    );
    const referral = result.current.referrals[0];

    act(() => {
      result.current.handleOpenTriage(referral);
    });

    expect(result.current.selectedReferral).toEqual(referral);
  });

  it("should clear selected referral via setSelectedReferral", async () => {
    const { result } = renderHook(() => useClinicaPageModel());
    await waitFor(() =>
      expect(result.current.referrals.length).toBeGreaterThan(0),
    );

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
