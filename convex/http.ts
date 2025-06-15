import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { upload } from "./files/actions";
import { completeChat } from "./chat/generate";
import { postPreflight } from "./preflight";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/upload-file",
  method: "POST",
  handler: upload,
});

http.route({
  path: "/upload-file",
  method: "OPTIONS",
  handler: postPreflight,
});

http.route({
  path: "/chat",
  method: "POST",
  handler: completeChat,
});

http.route({
  path: "/chat",
  method: "OPTIONS",
  handler: postPreflight,
});

export default http;
