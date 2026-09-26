import { get, put, del, list } from "@vercel/blob";

// Works with both auth styles: BLOB_READ_WRITE_TOKEN, or OIDC (BLOB_STORE_ID on Vercel).
export const hasBlob = () => !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

// Store may be public or private; detect once and remember.
let access = process.env.BLOB_ACCESS || null;
const order = () => (access ? [access] : ["public", "private"]);

export async function putBlob(pathname, body, opts = {}) {
  let lastErr;
  for (const a of order()) {
    try {
      const r = await put(pathname, body, { ...opts, access: a });
      access = a;
      return r;
    } catch (e) {
      lastErr = e;
      if (!/access|private|public/i.test(e.message || "")) throw e;
    }
  }
  throw lastErr;
}

export async function getBlob(pathname, useCache = true) {
  let lastErr;
  for (const a of order()) {
    try {
      const r = await get(pathname, { access: a, useCache });
      access = a;
      return r;
    } catch (e) {
      lastErr = e;
      if (!/access|private|public/i.test(e.message || "")) throw e;
    }
  }
  if (lastErr) throw lastErr;
  return null;
}

export { del, list };
