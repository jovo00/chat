import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";

export const uploadAction = httpAction(async (ctx, request) => {
  const blob = await request.blob();
  const storageId = await ctx.storage.store(blob);

  const name = new URL(request.url).searchParams.get("name");
  const file = await ctx.runMutation(internal.files.create_files.one, { storage: storageId, name: name ?? "" });

  return new Response(JSON.stringify(file), {
    status: 200,
    headers: new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.SITE_URL!,
      Vary: "origin",
    }),
  });
});

export const uploadPreflight = httpAction(async (_, request) => {
  const headers = request.headers;
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ) {
    return new Response(null, {
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.SITE_URL!,
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Digest, Authorization, Accept",
        "Access-Control-Max-Age": "86400",
      }),
    });
  } else {
    return new Response();
  }
});
