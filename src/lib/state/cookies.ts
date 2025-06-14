import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@gen/api";
import { Id } from "@gen/dataModel";
import { fetchQuery } from "convex/nextjs";
import { cookies } from "next/headers";

export async function getLastSidebarState() {
  return (await cookies()).get("sidebarState")?.value === "true";
}

export async function getLastDeviceState() {
  return JSON.parse((await cookies()).get("deviceState")?.value ?? '"desktop"') === "mobile" ? "mobile" : "desktop";
}

export async function getLastModelState() {
  const modelId = (await cookies()).get("modelId")?.value as Id<"models"> | undefined;
  if (!modelId) return undefined;

  try {
    const id = JSON.parse(modelId);
    const model = await fetchQuery(api.models.get.one, { model: id }, { token: await convexAuthNextjsToken() });
    return model;
  } catch (e) {
    return undefined;
  }
}
