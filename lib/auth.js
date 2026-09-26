import { createHash } from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "frame_admin";

export function adminToken() {
  const pw = process.env.ADMIN_PASSWORD || "";
  return createHash("sha256").update("frame-admin:" + pw).digest("hex");
}

export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const store = await cookies();
  return store.get(COOKIE)?.value === adminToken();
}
