"use client";

import { useState } from "react";

export default function AdminLogin({ configured }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setBusy(false);
    if (r.ok) window.location.reload();
    else setErr((await r.json().catch(() => ({}))).error || "Login failed");
  };

  return (
    <form className="card" style={{ maxWidth: 420, margin: "40px auto" }} onSubmit={submit}>
      <h3>Admin login</h3>
      {!configured && (
        <p className="error">
          ADMIN_PASSWORD environment variable is not set. Add it in Vercel → Project → Settings → Environment
          Variables, then redeploy.
        </p>
      )}
      <label>Password</label>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
      {err && <p className="error">{err}</p>}
      <button className="btn primary" style={{ marginTop: 16, width: "100%" }} disabled={busy || !pw}>
        {busy ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
