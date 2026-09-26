import { isAdmin } from "@/lib/auth";
import AdminPanel from "@/components/AdminPanel";
import AdminLogin from "@/components/AdminLogin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Frames" };

export default async function AdminPage() {
  const ok = await isAdmin();
  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <div>
            <h1>Admin Panel</h1>
            <p>Create campaigns, upload frames, share links.</p>
          </div>
          <a className="btn sm" href="/">View site</a>
        </div>
      </header>
      <main className="wrap" style={{ padding: "24px 16px 56px" }}>
        {ok ? (
          <AdminPanel blobReady={!!process.env.BLOB_READ_WRITE_TOKEN} />
        ) : (
          <AdminLogin configured={!!process.env.ADMIN_PASSWORD} />
        )}
      </main>
    </>
  );
}
