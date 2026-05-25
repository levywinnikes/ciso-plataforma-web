import { act, renderHook, waitFor } from "@testing-library/react";

import { useAdminPageModel } from "../hooks";

const mockNuclei = [
  {
    id: "n1",
    name: "Nucleus 1",
    description: "Desc 1",
    chargedPrice: 100,
    services: [{ id: "s1", name: "Service 1", basePrice: 80 }],
  },
];

const mockServices = [
  { id: "s1", name: "Service 1", basePrice: 80 },
  { id: "s2", name: "Service 2", basePrice: 50 },
];

beforeEach(() => {
  global.fetch = jest.fn((url: string) => {
    if (url.includes("/api/nuclei")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockNuclei),
      } as Response);
    }
    if (url.includes("/api/services")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockServices),
      } as Response);
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
  }) as jest.Mock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useAdminPageModel", () => {
  it("should initialize with nuclei data from API", async () => {
    const { result } = renderHook(() => useAdminPageModel());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.nuclei.length).toBeGreaterThan(0);
  });

  it("should initialize with services list from API", async () => {
    const { result } = renderHook(() => useAdminPageModel());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.services.length).toBeGreaterThan(0);
  });

  it("should open and close the nucleus modal", async () => {
    const { result } = renderHook(() => useAdminPageModel());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
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

  it("should toggle service selection", async () => {
    const { result } = renderHook(() => useAdminPageModel());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
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

  it("should compute selectedServicesFullPrice correctly", async () => {
    const { result } = renderHook(() => useAdminPageModel());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const firstService = result.current.services[0];

    act(() => {
      result.current.toggleService(firstService.id);
    });
    expect(result.current.selectedServicesFullPrice).toBe(
      firstService.basePrice,
    );
  });
});
