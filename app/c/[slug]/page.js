import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/campaigns";
import Editor from "@/components/Editor";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const c = await getCampaign(slug);
  if (!c) return { title: "Not found" };
  const img = c.frames[0]?.url;
  return {
    title: c.title,
    description: c.description || "Add this frame to your photo",
    openGraph: { title: c.title, description: c.description, images: img?.startsWith("http") ? [img] : [] },
  };
}

export default async function CampaignPage({ params }) {
  const { slug } = await params;
  const campaign = await getCampaign(slug);
  if (!campaign) notFound();
  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <div>
            <h1>{campaign.title}</h1>
            {campaign.description && <p>{campaign.description}</p>}
          </div>
        </div>
      </header>
      <main className="wrap">
        <Editor campaign={campaign} />
      </main>
    </>
  );
}
