// Same-origin proxy for frame images, used only if the storage host blocks CORS.
export async function GET(req) {
  const url = new URL(req.url).searchParams.get("url") || "";
  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (!host.endsWith(".blob.vercel-storage.com")) return new Response("forbidden", { status: 403 });
  const r = await fetch(url);
  if (!r.ok) return new Response("not found", { status: 404 });
  return new Response(r.body, {
    headers: {
      "content-type": r.headers.get("content-type") || "image/png",
      "cache-control": "public, max-age=86400",
    },
  });
}
