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

export function useCookieState(cookieName: string, defaultValue: any) {
  // Get the initial value from cookie or default
  const getInitialValue = () => {
    if (typeof window === "undefined") return defaultValue;
    const value = document.cookie.replace(new RegExp(`(?:(?:^|.*;\\s*)${cookieName}\\s*\\=\\s*([^;]*).*$)|^.*$`), "$1");
    return value ? JSON.parse(value) : defaultValue;
  };

  const [value, setValue] = useState(getInitialValue);

  // Update cookie when value changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    document.cookie = `${cookieName}=${JSON.stringify(value)}; expires=${date.toUTCString()}; path=/`;
  }, [value]);

  return [value, setValue];
}
