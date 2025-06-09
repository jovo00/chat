import { cookies } from "next/headers";

export async function getLastSidebarState() {
  return (await cookies()).get("sidebarState")?.value === "true";
}

export async function getLastDeviceState() {
  return JSON.parse((await cookies()).get("deviceState")?.value ?? '"desktop"') === "mobile" ? "mobile" : "desktop";
}
