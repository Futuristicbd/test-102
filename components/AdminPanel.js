"use client";

import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";

const EMPTY = { isNew: true, title: "", slug: "", description: "", captions: [""], frames: [] };

export default function AdminPanel({ blobReady }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const refresh = async () => {
    const r = await fetch("/api/campaigns", { cache: "no-store" });
    setList(await r.json());
  };
  useEffect(() => {
    refresh();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const onFrames = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    if (!files.length) return;
    setErr("");
    for (const file of files) {
      if (!/image\/(png|webp)/.test(file.type)) {
        setErr("Frames must be PNG (or WebP) with a transparent area for the photo.");
        continue;
      }
      setBusy(`Uploading ${file.name}…`);
      try {
        const blob = await upload(`frames/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        setForm((f) => ({ ...f, frames: [...f.frames, { id: blob.pathname, url: blob.url }] }));
      } catch (ex) {
        setErr("Upload failed: " + ex.message);
      }
    }
    setBusy("");
  };

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy("Saving…");
    const r = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) return setErr(data.error || "Save failed");
    setMsg(`Saved! Share link: ${origin}/c/${data.slug}`);
    setForm(EMPTY);
    refresh();
  };

  const edit = (c) => {
    setForm({ ...c, isNew: false, captions: c.captions.length ? c.captions : [""] });
    setMsg("");
    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (c) => {
    if (!confirm(`Delete "${c.title}" and its frames? This cannot be undone.`)) return;
    await fetch(`/api/campaigns?slug=${encodeURIComponent(c.slug)}`, { method: "DELETE" });
    refresh();
  };

  const copy = async (text) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setMsg("Copied: " + text);
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.reload();
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {!blobReady && (
        <div className="card error">
          Storage is not connected yet. In Vercel open this project → Storage → Create → Blob, connect it to the
          project, then redeploy. Until then only the built-in demo frame is available.
        </div>
      )}

      <form className="card" onSubmit={save}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>{form.isNew ? "New campaign" : `Edit: ${form.title}`}</h3>
          <div className="row">
            {!form.isNew && (
              <button type="button" className="btn sm" onClick={() => setForm(EMPTY)}>Cancel edit</button>
            )}
            <button type="button" className="btn sm" onClick={logout}>Log out</button>
          </div>
        </div>

        <label>Title *</label>
        <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} required />

        <label>Link slug (optional — auto from title)</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder="e.g. royal-cement-2026"
          disabled={!form.isNew}
        />
        <p className="muted" style={{ fontSize: 13, margin: "6px 0 0" }}>
          Link: <code>{origin}/c/{form.slug || "your-slug"}</code>
        </p>

        <label>Description</label>
        <input type="text" value={form.description} onChange={(e) => set("description", e.target.value)} />

        <label>Frames * (PNG 1080×1080 with transparent photo area — select several for multiple frames)</label>
        <div className="row" style={{ gap: 16 }}>
          {form.frames.map((f, i) => (
            <div key={f.url} className="frame-edit" style={{ backgroundImage: `url(${f.url})` }}>
              <button
                type="button"
                aria-label="Remove frame"
                onClick={() => set("frames", form.frames.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </div>
          ))}
          <label className="btn" style={{ margin: 0, color: "var(--text)" }}>
            + Add frame
            <input type="file" accept="image/png,image/webp" multiple hidden onChange={onFrames} disabled={!blobReady} />
          </label>
        </div>

        <label>Captions (users can copy these)</label>
        {form.captions.map((c, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <textarea
              value={c}
              onChange={(e) => set("captions", form.captions.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder="Write the caption with hashtags…"
            />
            {form.captions.length > 1 && (
              <button
                type="button"
                className="btn sm danger"
                onClick={() => set("captions", form.captions.filter((_, j) => j !== i))}
              >
                Remove caption
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn sm" onClick={() => set("captions", [...form.captions, ""])}>
          + Add another caption
        </button>

        {err && <p className="error">{err}</p>}
        {msg && <p style={{ color: "var(--accent)", wordBreak: "break-all" }}>{msg}</p>}
        <div style={{ marginTop: 18 }}>
          <button className="btn primary" disabled={!!busy || !blobReady}>
            {busy || (form.isNew ? "Create campaign" : "Save changes")}
          </button>
        </div>
      </form>

      <div className="card admin-list">
        <h3>Campaigns</h3>
        {list.map((c) => {
          const link = `${origin}/c/${c.slug}`;
          const demo = c.slug === "demo" && c.createdAt === 0;
          return (
            <div className="item" key={c.slug}>
              <img src={c.frames[0]?.url} alt="" />
              <div className="grow">
                <b>{c.title}</b>
                <div>
                  <code>{link}</code>
                </div>
              </div>
              <div className="row">
                <button className="btn sm" onClick={() => copy(link)}>Copy link</button>
                <a className="btn sm" href={`/c/${c.slug}`} target="_blank">Open</a>
                {!demo && <button className="btn sm" onClick={() => edit(c)}>Edit</button>}
                {!demo && <button className="btn sm danger" onClick={() => remove(c)}>Delete</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
