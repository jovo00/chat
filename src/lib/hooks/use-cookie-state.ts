"use client";

import { useEffect, useState } from "react";

export function useCookieState(cookieName: string, defaultValue: any) {
  const getInitialValue = () => {
    if (typeof window === "undefined") return defaultValue;
    const value = document.cookie.replace(new RegExp(`(?:(?:^|.*;\\s*)${cookieName}\\s*\\=\\s*([^;]*).*$)|^.*$`), "$1");
    return value ? JSON.parse(value) : defaultValue;
  };

  const [value, setValue] = useState(getInitialValue);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    document.cookie = `${cookieName}=${JSON.stringify(value)}; expires=${date.toUTCString()}; path=/`;
  }, [value]);

  return [value, setValue];
}
