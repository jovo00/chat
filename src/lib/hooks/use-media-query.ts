"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string, callback?: (matches: boolean) => void) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
      callback?.(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);
    callback?.(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, [query]);

  return value;
}
