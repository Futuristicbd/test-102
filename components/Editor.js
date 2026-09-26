"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SIZE = 1080; // output is always 1080 x 1080 (1:1)
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5;

function loadImage(src, cors) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function loadFrame(url) {
  return loadImage(url, url.startsWith("http"));
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export default function Editor({ campaign }) {
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const photoRef = useRef(null);
  const frameRef = useRef(null);
  const view = useRef({ x: SIZE / 2, y: SIZE / 2, scale: 1, base: 1, rot: 0 });
  const pointers = useRef(new Map());
  const pinch = useRef(null);

  const [frameIdx, setFrameIdx] = useState(0);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  const toastTimer = useRef(null);
  const flash = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);
    const p = photoRef.current;
    if (p) {
      const v = view.current;
      ctx.save();
      ctx.translate(v.x, v.y);
      ctx.rotate((v.rot * Math.PI) / 180);
      const s = v.base * v.scale;
      ctx.drawImage(p, (-p.width * s) / 2, (-p.height * s) / 2, p.width * s, p.height * s);
      ctx.restore();
    } else {
      ctx.fillStyle = "#e9e9e9";
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = "#888";
      ctx.font = "600 44px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Upload your photo", SIZE / 2, SIZE / 2);
    }
    if (frameRef.current) ctx.drawImage(frameRef.current, 0, 0, SIZE, SIZE);
  }, []);

  // Load the selected frame.
  useEffect(() => {
    let alive = true;
    const url = campaign.frames[frameIdx]?.url;
    if (!url) return;
    loadFrame(url)
      .then((img) => {
        if (!alive) return;
        frameRef.current = img;
        draw();
      })
      .catch(() => flash("Could not load frame"));
    return () => {
      alive = false;
    };
  }, [campaign, frameIdx, draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  const setScale = (s) => {
    const v = view.current;
    v.scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s));
    setZoom(v.scale);
    draw();
  };

  const resetView = () => {
    const p = photoRef.current;
    if (!p) return;
    view.current = { x: SIZE / 2, y: SIZE / 2, scale: 1, base: Math.max(SIZE / p.width, SIZE / p.height), rot: 0 };
    setZoom(1);
    draw();
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url, false);
      photoRef.current = img;
      setHasPhoto(true);
      resetView();
    } catch {
      flash("This image format is not supported");
    }
  };

  // Canvas-space factor: CSS pixels -> 1080 canvas pixels.
  const factor = () => SIZE / canvasRef.current.getBoundingClientRect().width;

  const onPointerDown = (e) => {
    if (!photoRef.current) {
      fileRef.current?.click();
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: view.current.scale };
    }
  };

  const onPointerMove = (e) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);
    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      setScale((pinch.current.scale * d) / pinch.current.dist);
      return;
    }
    const f = factor();
    view.current.x += (cur.x - prev.x) * f;
    view.current.y += (cur.y - prev.y) * f;
    draw();
  };

  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  // Mouse wheel zoom (non-passive so the page doesn't scroll).
  useEffect(() => {
    const cv = canvasRef.current;
    const onWheel = (e) => {
      if (!photoRef.current) return;
      e.preventDefault();
      setScale(view.current.scale * (e.deltaY < 0 ? 1.06 : 1 / 1.06));
    };
    cv.addEventListener("wheel", onWheel, { passive: false });
    return () => cv.removeEventListener("wheel", onWheel);
  });

  const rotate = (deg) => {
    view.current.rot = (view.current.rot + deg) % 360;
    draw();
  };

  const download = async () => {
    if (!photoRef.current) {
      flash("Upload your photo first");
      return;
    }
    setBusy(true);
    try {
      draw();
      const blob = await new Promise((res) => canvasRef.current.toBlob(res, "image/png"));
      if (!blob) throw new Error("export failed");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${campaign.slug}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      if (campaign.captions[0] && (await copyText(campaign.captions[0]))) {
        flash("Downloaded! Caption copied ✓");
      } else {
        flash("Downloaded!");
      }
    } catch {
      flash("Download failed, please try again");
    } finally {
      setBusy(false);
    }
  };

  const shareLink = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: campaign.title, url });
        return;
      } catch {}
    }
    if (await copyText(url)) flash("Link copied ✓");
  };

  return (
    <div className="editor">
      <div>
        <div
          className="stage"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <canvas ref={canvasRef} width={SIZE} height={SIZE} />
          {hasPhoto && <div className="hint">Drag to move · pinch / scroll to zoom</div>}
        </div>

        {hasPhoto && (
          <>
            <div className="controls">
              <button className="btn icon-btn" onClick={() => setScale(view.current.scale * 1.15)} aria-label="Zoom in">＋</button>
              <button className="btn icon-btn" onClick={() => setScale(view.current.scale / 1.15)} aria-label="Zoom out">－</button>
              <span className="sep" />
              <button className="btn icon-btn" onClick={() => rotate(-90)} aria-label="Rotate left">↺</button>
              <button className="btn icon-btn" onClick={() => rotate(90)} aria-label="Rotate right">↻</button>
              <span className="sep" />
              <button className="btn sm" onClick={resetView}>Reset</button>
            </div>
            <div className="zoom">
              <span>Zoom</span>
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step="0.01"
                value={zoom}
                onChange={(e) => setScale(parseFloat(e.target.value))}
              />
            </div>
          </>
        )}
      </div>

      <div className="side">
        {campaign.frames.length > 1 && (
          <div className="card">
            <h3>Choose frame</h3>
            <div className="frames">
              {campaign.frames.map((f, i) => (
                <button
                  key={f.id || f.url}
                  className={i === frameIdx ? "active" : ""}
                  style={{ backgroundImage: `url(${f.url})` }}
                  onClick={() => setFrameIdx(i)}
                  aria-label={`Frame ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {campaign.captions.length > 0 && (
          <div className="card">
            <h3>Caption</h3>
            {campaign.captions.map((c, i) => (
              <div className="caption-row" key={i}>
                <p className="caption">{c}</p>
                <button className="btn sm" onClick={async () => (await copyText(c)) && flash("Caption copied ✓")}>
                  Copy caption
                </button>
              </div>
            ))}
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        <button className="btn big" onClick={() => fileRef.current?.click()}>
          📷 {hasPhoto ? "Change Photo" : "Upload Photo"}
        </button>
        <button className="btn primary big" onClick={download} disabled={busy}>
          {busy ? "Preparing…" : "Download"}
        </button>
        <button className="btn" onClick={shareLink}>🔗 Share this frame link</button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
