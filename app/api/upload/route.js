import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { hasBlob, putBlob } from "@/lib/blob";

export async function POST(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasBlob()) return NextResponse.json({ error: "Storage not connected" }, { status: 500 });
  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!/^image\/(png|webp)$/.test(file.type)) {
    return NextResponse.json({ error: "Frame must be PNG or WebP" }, { status: 400 });
  }
  const ext = file.type === "image/webp" ? "webp" : "png";
  const blob = await putBlob(`frames/frame.${ext}`, file, {
    contentType: file.type,
    addRandomSuffix: true,
  });
  return NextResponse.json({ id: blob.pathname, url: `/api/file/${blob.pathname}` });
}
