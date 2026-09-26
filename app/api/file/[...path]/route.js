import { getBlob } from "@/lib/blob";

// Serves stored frame images from the app's own domain (no CORS issues, works for private stores).
export async function GET(req, { params }) {
  const { path } = await params;
  const pathname = path.join("/");
  if (!pathname.startsWith("frames/")) return new Response("forbidden", { status: 403 });
  try {
    const r = await getBlob(pathname);
    if (!r?.stream) return new Response("not found", { status: 404 });
    return new Response(r.stream, {
      headers: {
        "content-type": r.blob?.contentType || "image/png",
        // Frame pathnames carry a random suffix, so they never change.
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
