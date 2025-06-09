import Root from "@/components/layout/root";
import type { ReactNode } from "react";

export default function Decorated({ children }: { children: ReactNode }) {
  return <Root>{children}</Root>;
}
