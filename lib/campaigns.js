import { get, put, list, del } from "@vercel/blob";

// Built-in demo campaign so the app works before any upload.
export const DEMO = {
  slug: "demo",
  title: "Royal Cement — Demo Frame",
  description: "Upload your photo, adjust it, copy the caption and download.",
  captions: [
    "Proud to be part of Royal Cement! 💪 #RoyalCement #StrongerTogether",
  ],
  frames: [{ id: "demo", url: "/sample-frame.png" }],
  createdAt: 0,
};

const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const path = (slug) => `campaigns/${slug}.json`;

export async function getCampaign(slug) {
  if (hasBlob()) {
    try {
      const res = await get(path(slug), { access: "public", useCache: false });
      if (res) return await new Response(res.stream).json();
    } catch {}
  }
  return slug === DEMO.slug ? DEMO : null;
}

export async function listCampaigns() {
  if (!hasBlob()) return [DEMO];
  const { blobs } = await list({ prefix: "campaigns/" });
  const items = await Promise.all(
    blobs.map((b) => getCampaign(b.pathname.replace(/^campaigns\/|\.json$/g, "")))
  );
  const out = items.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt);
  if (!out.some((c) => c.slug === DEMO.slug)) out.push(DEMO);
  return out;
}

export async function saveCampaign(c) {
  await put(path(c.slug), JSON.stringify(c), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
}

export async function deleteCampaign(slug) {
  const c = await getCampaign(slug);
  const urls = (c?.frames || []).map((f) => f.url).filter((u) => u.startsWith("http"));
  await del([path(slug), ...urls]);
}

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
