import { ConvexError } from "convex/values";
import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";

export const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10 MiB
export const ALLOWED_MIME_TYPES = ["image/jpg", "image/jpeg", "image/png", "image/webp", "application/pdf"];

export const upload = httpAction(async (ctx, request) => {
  const blob = await request.blob();
  const storageId = await ctx.storage.store(blob);

  const metadata = await ctx.runQuery(internal.files.get.getMetadata, { storageId });
  if (!metadata) {
    await ctx.storage.delete(storageId);
    throw new ConvexError("Upload not possible. Could not get file metadata");
  }

  if (!metadata.contentType || !ALLOWED_MIME_TYPES.includes(metadata.contentType)) {
    await ctx.storage.delete(storageId);
    throw new ConvexError("Invalid file type");
  }

  if (metadata.size > MAX_FILE_SIZE) {
    await ctx.storage.delete(storageId);
    throw new ConvexError("Max. File Size 10 MiB");
  }

  const name = new URL(request.url).searchParams.get("name");

  try {
    const file = await ctx.runMutation(internal.files.create.one, { storage: storageId, name: name ?? "" });
    return new Response(JSON.stringify(file), {
      status: 200,
      headers: new Headers({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.SITE_URL!,
        Vary: "origin",
      }),
    });
  } catch (err) {
    await ctx.storage.delete(storageId);
    throw err;
  }
});
