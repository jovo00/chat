import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";

export const uploadAction = httpAction(async (ctx, request) => {
  const blob = await request.blob();
  const storageId = await ctx.storage.store(blob);

  const name = new URL(request.url).searchParams.get("name");
  const file = await ctx.runMutation(internal.files.create.one, { storage: storageId, name: name ?? "" });

  return new Response(JSON.stringify(file), {
    status: 200,
    headers: new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.SITE_URL!,
      Vary: "origin",
    }),
  });
});
