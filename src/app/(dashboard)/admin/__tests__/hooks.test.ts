import { act, renderHook } from "@testing-library/react";

import { useAdminPageModel } from "../hooks";

describe("useAdminPageModel", () => {
  it("should initialize with CARE_NUCLEI data", () => {
    const { result } = renderHook(() => useAdminPageModel());
    expect(result.current.nuclei.length).toBeGreaterThan(0);
  });

  it("should initialize with deduped services list", () => {
    const { result } = renderHook(() => useAdminPageModel());
    expect(result.current.services.length).toBeGreaterThan(0);
  });

  it("should open and close the nucleus modal", () => {
    const { result } = renderHook(() => useAdminPageModel());
    expect(result.current.isNucleusModalOpen).toBe(false);

    act(() => {
      result.current.setIsNucleusModalOpen(true);
    });
    expect(result.current.isNucleusModalOpen).toBe(true);

    act(() => {
      result.current.setIsNucleusModalOpen(false);
    });
    expect(result.current.isNucleusModalOpen).toBe(false);
  });

  it("should toggle service selection", () => {
    const { result } = renderHook(() => useAdminPageModel());
    const firstServiceId = result.current.services[0].id;

    expect(result.current.selectedServiceIds).not.toContain(firstServiceId);

    act(() => {
      result.current.toggleService(firstServiceId);
    });
    expect(result.current.selectedServiceIds).toContain(firstServiceId);

    act(() => {
      result.current.toggleService(firstServiceId);
    });
    expect(result.current.selectedServiceIds).not.toContain(firstServiceId);
  });

  it("should compute selectedServicesFullPrice correctly", () => {
    const { result } = renderHook(() => useAdminPageModel());
    const firstService = result.current.services[0];

    act(() => {
      result.current.toggleService(firstService.id);
    });
    expect(result.current.selectedServicesFullPrice).toBe(
      firstService.basePrice,
    );
  });
});
