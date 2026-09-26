import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";
import { getCampaign, listCampaigns, saveCampaign, deleteCampaign, slugify, DEMO } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const noBlob = () =>
  NextResponse.json(
    { error: "Storage not connected. Add a Vercel Blob store to this project, then redeploy." },
    { status: 500 }
  );

export async function GET() {
  return NextResponse.json(await listCampaigns());
}

export async function POST(req) {
  if (!(await isAdmin())) return deny();
  if (!process.env.BLOB_READ_WRITE_TOKEN) return noBlob();
  const body = await req.json();
  const slug = slugify(body.slug || body.title);
  if (!slug) return NextResponse.json({ error: "Title/slug is required" }, { status: 400 });
  const frames = (body.frames || []).filter((f) => f && f.url);
  if (!frames.length) return NextResponse.json({ error: "Upload at least one frame" }, { status: 400 });

  const old = await getCampaign(slug);
  if (body.isNew && old && slug !== DEMO.slug) {
    return NextResponse.json({ error: `Link "/c/${slug}" already exists — pick another slug` }, { status: 409 });
  }
  const campaign = {
    slug,
    title: String(body.title || slug).slice(0, 120),
    description: String(body.description || "").slice(0, 500),
    captions: (body.captions || []).map((c) => String(c)).filter((c) => c.trim()),
    frames,
    createdAt: old?.createdAt || Date.now(),
  };
  await saveCampaign(campaign);

  // Remove frame files that were dropped during an edit.
  const keep = new Set(frames.map((f) => f.url));
  const removed = (old?.frames || []).map((f) => f.url).filter((u) => u.startsWith("http") && !keep.has(u));
  if (removed.length) await del(removed).catch(() => {});

  return NextResponse.json(campaign);
}

export async function DELETE(req) {
  if (!(await isAdmin())) return deny();
  if (!process.env.BLOB_READ_WRITE_TOKEN) return noBlob();
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  await deleteCampaign(slug);
  return NextResponse.json({ ok: true });
}
