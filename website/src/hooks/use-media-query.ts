"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query.
 *
 * The server has no viewport, so the server render and hydration both read
 * `false`, and the real answer lands in the commit straight after. Callers must
 * therefore treat `false` as "not yet known", which is why every use of this
 * reads as "the expensive path is the default and the cheap one is opted into"
 * rather than the reverse.
 *
 * Only hydration pays that second render, though. It used to be a `useState`
 * settled in an effect, which made every mount — including a client-side
 * navigation, long after the query could have been read — render once with the
 * wrong answer and again with the right one. On the catalogue that meant every
 * card built its observers with the desktop margins, tore them down, and built
 * them again, in the same frames as the page's entrance. An external store is
 * read synchronously wherever there is a `window` to read it from.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * A phone or tablet, by input device rather than by width.
 *
 * Width alone misreads a narrow desktop window as a phone and a large tablet as
 * a desktop; `pointer: coarse` is asking the question we actually care about —
 * is this a touch device with a mobile GPU and a mobile compositor. The width
 * bound catches touchscreen laptops, which have the pointer but not the budget
 * problem.
 */
/**
 * Kept in step with the `.progressive-blur-*` query in `globals.css`, which
 * asks the same question in CSS because it needs the answer at first paint
 * rather than after hydration.
 */
export const COARSE_POINTER = "(pointer: coarse), (max-width: 767px)";

export function useIsMobileDevice() {
  return useMediaQuery(COARSE_POINTER);
}
