import { hasBlob, putBlob, getBlob, del, list } from "./blob";

// Built-in demo campaign so the app works before any upload.
export const DEMO = {
  slug: "demo",
  title: "Royal Cement — Demo Frame",
  description: "Upload your photo, adjust it, copy the caption and download.",
  captions: ["Proud to be part of Royal Cement! 💪 #RoyalCement #StrongerTogether"],
  frames: [{ id: "demo", url: "/sample-frame.png" }],
  createdAt: 0,
};

const path = (slug) => `campaigns/${slug}.json`;

export async function getCampaign(slug) {
  if (hasBlob()) {
    try {
      const res = await getBlob(path(slug), false);
      if (res?.stream) return await new Response(res.stream).json();
    } catch {}
  }
  return slug === DEMO.slug ? DEMO : null;
}

export async function listCampaigns() {
  if (!hasBlob()) return [DEMO];
  let blobs = [];
  try {
    ({ blobs } = await list({ prefix: "campaigns/" }));
  } catch {}
  const items = await Promise.all(
    blobs.map((b) => getCampaign(b.pathname.replace(/^campaigns\/|\.json$/g, "")))
  );
  const out = items.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt);
  if (!out.some((c) => c.slug === DEMO.slug)) out.push(DEMO);
  return out;
}

export async function saveCampaign(c) {
  await putBlob(path(c.slug), JSON.stringify(c), {
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
}

export const framePaths = (frames) =>
  (frames || []).map((f) => f.id).filter((id) => id && id.startsWith("frames/"));

export async function deleteCampaign(slug) {
  const c = await getCampaign(slug);
  await del([path(slug), ...framePaths(c?.frames)]);
}

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
