import { httpAction } from "./_generated/server";

export const postPreflight = httpAction(async (_, request) => {
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
