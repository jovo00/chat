import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { getUser } from "./users/get";
import { uploadAction, uploadPreflight } from "./files/upload_action";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/upload-file",
  method: "POST",
  handler: uploadAction,
});

// http.route({
//   path: "/get-file",
//   method: "GET",
//   handler: httpAction(async (ctx, request) => {
//     const { searchParams } = new URL(request.url);
//     const storageId = searchParams.get("storageId")! as Id<"_storage">;
//     const blob = await ctx.storage.get(storageId);
//     if (blob === null) {
//       return new Response("Image not found", {
//         status: 404,
//       });
//     }
//     return new Response(blob);
//   }),
// });

// Pre-flight request for /sendImage
http.route({
  path: "/upload-file",
  method: "OPTIONS",
  handler: uploadPreflight,
});

export default http;
