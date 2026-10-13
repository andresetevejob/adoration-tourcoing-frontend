import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIsMobileViewport } from "./useIsMobileViewport";

type ChangeHandler = (event: MediaQueryListEvent) => void;

function mockMatchMedia(initialMatches: boolean): { capturedHandler: ChangeHandler | null } {
  const state = { capturedHandler: null as ChangeHandler | null };
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: initialMatches,
        media: query,
        onchange: null,
        addEventListener: vi.fn((_event: string, handler: ChangeHandler) => {
          state.capturedHandler = handler;
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
  return state;
}

describe("useIsMobileViewport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retourne false (desktop) quand matchMedia().matches est false au montage", () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useIsMobileViewport());

    expect(result.current).toBe(false);
  });

  it("retourne true (mobile) quand matchMedia().matches est true au montage", () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => useIsMobileViewport());

    expect(result.current).toBe(true);
  });

  it("devient réactif : repasse à true quand l'écouteur 'change' est déclenché", () => {
    const state = mockMatchMedia(false);

    const { result } = renderHook(() => useIsMobileViewport());

    expect(result.current).toBe(false);
    expect(state.capturedHandler).not.toBeNull();

    act(() => {
      state.capturedHandler?.({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  it("nettoie l'écouteur 'change' au démontage", () => {
    const removeEventListener = vi.fn();
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener,
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const { unmount } = renderHook(() => useIsMobileViewport());
    unmount();

    expect(removeEventListener).toHaveBeenCalledTimes(1);
    expect(removeEventListener.mock.calls[0][0]).toBe("change");
  });
});
