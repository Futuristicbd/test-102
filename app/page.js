import Link from "next/link";
import { listCampaigns } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

export default async function Home() {
  const campaigns = await listCampaigns();
  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <div>
            <h1>Royal Cement Frames</h1>
            <p>Pick a campaign, add your photo, download &amp; share.</p>
          </div>
          <Link className="btn sm" href="/admin">Admin</Link>
        </div>
      </header>
      <main className="wrap">
        <div className="grid">
          {campaigns.map((c) => (
            <Link key={c.slug} href={`/c/${c.slug}`} className="tile">
              <div className="thumb" style={{ backgroundImage: `url(${c.frames[0]?.url})` }} />
              <div className="body">
                <b>{c.title}</b>
                <span className="muted" style={{ fontSize: 13 }}>{c.frames.length} frame{c.frames.length > 1 ? "s" : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
