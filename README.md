# Royal Cement Frames

A simple Twibbon-style frame platform (Next.js + Vercel Blob).

- **User page** `/c/<slug>` — upload photo, drag / pinch / scroll to adjust, zoom & rotate, switch frame, copy caption, download 1080×1080 PNG (download also copies the first caption).
- **Admin panel** `/admin` — password login, create / edit / delete campaigns, upload one or more frame PNGs, add captions, copy the share link.
- A built-in demo campaign lives at `/c/demo`.

## Deploy on Vercel (3 steps)

1. Import this GitHub repo in Vercel (framework: Next.js, no settings needed).
2. Project → **Settings → Environment Variables** → add `ADMIN_PASSWORD` (your admin password).
3. Project → **Storage → Create → Blob** → connect it to the project (this adds `BLOB_READ_WRITE_TOKEN`), then **Redeploy**.

Then open `https://<your-app>.vercel.app/admin`, log in, create a campaign and share the link.

## Frame tips

Upload a **square PNG (1080×1080)** where the photo area is **transparent**. The user photo is drawn behind the frame.

## Local dev

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD and BLOB_READ_WRITE_TOKEN
npm run dev
```
