import { useState, useEffect, useRef } from "react";

// ── Data ─────────────────────────────────────────────────────────────────────
const PROJECT_TYPES = {
  "Brand Identity": {
    icon: "◈", color: "#FF6B35", description: "Logos, marks, wordmarks",
    exports: [
      { format: "SVG",  category: "Vector", dimensions: "Scalable",     usage: "Master file, web use",    required: true,  tip: "Infinitely scalable vector. The source of truth for your logo. Used in web, apps, and as the base for all other exports. Never loses quality at any size." },
      { format: "PDF",  category: "Vector", dimensions: "Scalable",     usage: "Print-ready",             required: true,  tip: "Vector PDF for print bureaus and packaging vendors. Embeds fonts and colour profiles. Always request a proof before final print runs." },
      { format: "PNG",  category: "Raster", dimensions: "1000×1000px",  usage: "White bg, general use",   required: true,  tip: "The everyday logo on white. Safe to paste into Word docs, email footers, presentations, and anywhere the background is white." },
      { format: "PNG",  category: "Raster", dimensions: "1000×1000px",  usage: "Transparent bg",          required: true,  tip: "Same size, but the background is transparent (alpha channel). Use this whenever the logo needs to sit on a coloured or image background." },
      { format: "PNG",  category: "Raster", dimensions: "500×500px",    usage: "Favicon source",          required: false, tip: "A square crop of the mark at 500px — used as the source file to generate ICO and Apple touch icons. Keep it simple: just the symbol, no wordmark." },
      { format: "JPG",  category: "Raster", dimensions: "2000×2000px",  usage: "Email signatures",        required: false, tip: "High-res JPG for embedding in email signatures. Most email clients block PNGs with transparency, so a white-bg JPG is safer and loads faster." },
      { format: "EPS",  category: "Vector", dimensions: "Scalable",     usage: "Legacy print vendors",    required: false, tip: "Older print shops and embroidery/sign vendors often only accept EPS. It's a legacy format but still widely required in physical production workflows." },
      { format: "ICO",  category: "Icon",   dimensions: "32×32px",      usage: "Browser favicon",         required: false, tip: "The tiny icon that appears in browser tabs and bookmarks. ICO format bundles multiple sizes (16×16, 32×32) into one file. Place it at the root of your site." },
    ],
  },
  "Social Media Pack": {
    icon: "◉", color: "#00D4FF", description: "Posts, stories, banners",
    exports: [
      { format: "PNG", category: "Instagram", dimensions: "1080×1080px",  usage: "Feed post (square)",    required: true,  tip: "Instagram's standard square format. Works for carousel posts and single images. Safe zone: keep text and logos 14% away from the edges." },
      { format: "PNG", category: "Instagram", dimensions: "1080×1350px",  usage: "Feed post (portrait)",  required: true,  tip: "The portrait crop takes up more vertical space in the feed — higher engagement than square. Ideal for product shots, editorial, and announcements." },
      { format: "PNG", category: "Instagram", dimensions: "1080×1920px",  usage: "Story / Reels",         required: true,  tip: "Full-bleed vertical format for Stories and Reels covers. Keep interactive elements (stickers, CTAs) in the middle 1080×1420px safe zone to avoid UI overlap." },
      { format: "PNG", category: "Facebook",  dimensions: "1200×630px",   usage: "Link share preview",    required: true,  tip: "The image Facebook and most platforms pull when a URL is shared. Set this in your og:image meta tag. Text should stay within the centre 80% to avoid cropping." },
      { format: "PNG", category: "Facebook",  dimensions: "820×312px",    usage: "Cover photo",           required: false, tip: "The wide banner at the top of your Facebook page. Crops to 640×360px on mobile, so keep the logo and key info in the centre-right area." },
      { format: "PNG", category: "Twitter/X", dimensions: "1600×900px",   usage: "Post image",            required: true,  tip: "X displays this at 16:9 in the feed. High-contrast images with minimal text perform best. Faces and objects in the centre survive the auto-crop algorithm." },
      { format: "PNG", category: "Twitter/X", dimensions: "1500×500px",   usage: "Header banner",         required: false, tip: "The profile header on X. It gets cropped heavily on mobile, so treat the outer thirds as unsafe zones. Place the key visual in the centre." },
      { format: "PNG", category: "LinkedIn",  dimensions: "1200×627px",   usage: "Post image",            required: true,  tip: "LinkedIn feed images appear at roughly 1.91:1 ratio. Text-forward designs with clear hierarchy perform well — this is a professional audience." },
      { format: "PNG", category: "LinkedIn",  dimensions: "1584×396px",   usage: "Banner",                required: false, tip: "LinkedIn company page banner. Very wide and short — best used for brand messaging, taglines, or abstract imagery. Avoid putting faces in the far edges." },
      { format: "PNG", category: "YouTube",   dimensions: "2560×1440px",  usage: "Channel art",           required: false, tip: "YouTube channel banner. Only the central 1546×423px is visible on all devices. The outer areas appear on TV screens only — treat them as bonus space." },
      { format: "PNG", category: "YouTube",   dimensions: "1280×720px",   usage: "Thumbnail",             required: false, tip: "Custom thumbnails are the single biggest driver of click-through rate on YouTube. High contrast, bold text, and expressive faces are proven to perform best." },
    ],
  },
  "Print Campaign": {
    icon: "▣", color: "#A78BFA", description: "Posters, flyers, brochures",
    exports: [
      { format: "PDF",     category: "Print-Ready", dimensions: "With 3mm bleed", usage: "Press-ready (CMYK)",    required: true,  tip: "The master print file. The 3mm bleed means your artwork extends beyond the trim line — the printer cuts into this zone so there's no white edge. Must be CMYK colour space, not RGB." },
      { format: "PDF",     category: "Print-Ready", dimensions: "No bleed",       usage: "Digital distribution",  required: true,  tip: "A clean PDF trimmed to exact size, for emailing to clients or sharing digitally. No bleed needed since it'll never be printed and cut." },
      { format: "JPG",     category: "Preview",     dimensions: "300 DPI",        usage: "Client approval",       required: true,  tip: "A high-res JPEG rendered at 300 DPI — good enough for clients to zoom in and check details. Share this before sending print-ready files to avoid costly reprints." },
      { format: "PNG",     category: "Preview",     dimensions: "72 DPI",         usage: "Email preview",         required: true,  tip: "A low-res screen-optimised PNG for quick approval via email or chat. Small file size, loads fast. Not for printing." },
      { format: "TIFF",    category: "Archive",     dimensions: "300 DPI",        usage: "Archival master",       required: false, tip: "Lossless high-res archive format. TIFF preserves every pixel without compression artefacts — the gold standard for long-term asset storage and future reprints." },
      { format: "PDF/X-1a",category: "Press",       dimensions: "With marks",     usage: "Commercial printer",    required: false, tip: "A strict PDF standard specifically for commercial printing. Includes crop marks, registration marks, and bleed info. Required by many offset print vendors and magazines." },
    ],
  },
  "Web / UI Design": {
    icon: "⬡", color: "#34D399", description: "Websites, apps, dashboards",
    exports: [
      { format: "SVG",  category: "Icons",   dimensions: "Scalable",       usage: "All UI icons",           required: true,  tip: "SVG icons stay crisp at every screen resolution and can be styled with CSS. Export each icon on a consistent grid (e.g. 24×24 or 16×16) with 1–2px padding inside the artboard." },
      { format: "PNG",  category: "Assets",  dimensions: "1× + 2× + 3×",  usage: "Images & illustrations", required: true,  tip: "Raster images need three sizes: 1× for standard screens, 2× for Retina, 3× for high-DPI mobile. Reference them in HTML using srcset or in CSS with image-set()." },
      { format: "WebP", category: "Assets",  dimensions: "1× + 2×",        usage: "Optimized web images",   required: true,  tip: "WebP is ~30% smaller than PNG/JPG with equal or better quality. Use it as the primary format for web with a PNG fallback for older browsers via the <picture> element." },
      { format: "PNG",  category: "OG Image",dimensions: "1200×630px",     usage: "Social share preview",   required: true,  tip: "This image appears when your site is shared on social media or in iMessage. Set it via the og:image meta tag. Keep it bold and legible at thumbnail size — around 250px wide." },
      { format: "ICO",  category: "Favicon", dimensions: "32×32px",        usage: "Browser tab",            required: true,  tip: "The browser tab icon. Place favicon.ico at the root of your domain (/favicon.ico) — browsers request it automatically. Include both 16×16 and 32×32 inside the ICO container." },
      { format: "PNG",  category: "Favicon", dimensions: "180×180px",      usage: "Apple touch icon",       required: true,  tip: "Used when someone saves your site to their iPhone home screen. Reference it with <link rel=\"apple-touch-icon\">. Should be the logo on a solid colour background — no transparency." },
      { format: "PNG",  category: "Favicon", dimensions: "512×512px",      usage: "PWA icon",               required: false, tip: "Required for Progressive Web Apps (PWAs). Listed in the web app manifest JSON. Used as the app icon when users install your site to their home screen on Android." },
      { format: "PDF",  category: "Handoff", dimensions: "Artboard size",  usage: "Developer specs",        required: false, tip: "A flat PDF export of your design for clients or stakeholders who don't have Figma access. Not for development — use Figma inspect or Zeplin for actual developer handoff." },
    ],
  },
  "Presentation": {
    icon: "◧", color: "#FBBF24", description: "Decks, pitches, keynotes",
    exports: [
      { format: "PDF",  category: "Slides",  dimensions: "1920×1080px",   usage: "Client distribution",    required: true,  tip: "A locked, non-editable version of your deck for sharing with clients. Fonts are embedded so it looks identical on any device. Use this for final deliverables and email attachments." },
      { format: "PPTX", category: "Slides",  dimensions: "Widescreen 16:9",usage: "Editable version",      required: true,  tip: "The editable PowerPoint file your client can update themselves. Make sure all fonts are embedded or substituted with system fonts. Test it in PowerPoint, not just Keynote." },
      { format: "JPG",  category: "Preview", dimensions: "1920×1080px",   usage: "Thumbnail / preview",    required: true,  tip: "A flat image of the first or hero slide. Use it as the deck preview image in proposals, Notion pages, or emails before the recipient opens the full file." },
      { format: "PNG",  category: "Assets",  dimensions: "2× retina",     usage: "Slide graphics export",  required: false, tip: "Exports of individual slide graphics (charts, diagrams, icons) at 2× resolution. Clients often want to reuse these in other documents or social posts." },
      { format: "MP4",  category: "Video",   dimensions: "1920×1080px",   usage: "Animated slides",        required: false, tip: "Export animated or auto-advancing slides as MP4. Useful for trade show loops, digital signage, or LinkedIn video posts where you can't embed a live deck." },
    ],
  },
  "Motion / Animation": {
    icon: "◈", color: "#F472B6", description: "GIFs, videos, animations",
    exports: [
      { format: "MP4",  category: "Video",     dimensions: "1920×1080px H.264",  usage: "Web / social playback", required: true,  tip: "H.264 MP4 is the universal playback format — works everywhere: browsers, social media, video players. Aim for 8–15 Mbps bitrate for web delivery. Keep under 50MB for social uploads." },
      { format: "MOV",  category: "Video",     dimensions: "ProRes 4444",         usage: "Client master file",    required: true,  tip: "The lossless master file you hand off to the client for archiving and future use. ProRes 4444 preserves alpha channels (transparency). Large file size — deliver via WeTransfer or Drive." },
      { format: "GIF",  category: "Animation", dimensions: "800×800px max",       usage: "Email / Slack embeds",  required: true,  tip: "GIF is the only animation format that works inline in emails and Slack without needing to click play. Keep it under 1MB and under 10 seconds. Reduce colours to 64–128 to control file size." },
      { format: "WebM", category: "Animation", dimensions: "1080×1080px",         usage: "Web looping video",     required: false, tip: "WebM with the VP9 codec is 40–50% smaller than an equivalent GIF and plays natively in Chrome/Firefox. Use it as a GIF replacement with the <video autoplay loop muted> pattern." },
      { format: "PNG",  category: "Still",     dimensions: "1920×1080px",         usage: "Poster / thumbnail",    required: true,  tip: "A single freeze-frame of the animation — used as the video poster image (shown before the video loads) and as a thumbnail in video hosting platforms." },
      { format: "MP4",  category: "Social",    dimensions: "1080×1920px vertical",usage: "Stories / Reels",       required: false, tip: "Vertical 9:16 format for Instagram Reels, TikTok, and YouTube Shorts. Keep critical content in the middle 1080×1420px safe zone to avoid UI overlays at top and bottom." },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateFilename(projectName, format, category, dimensions) {
  const clean = s => s.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const dimSlug = dimensions.replace(/[^0-9x×]/gi, "").toLowerCase().replace("×", "x") || "scalable";
  const proj = clean(projectName || "project");
  const cat = clean(category);
  const ext = format.toLowerCase().split("/")[0];
  return `${proj}_${cat}_${format.toLowerCase().replace(/[^a-z0-9]/g, "")}${dimSlug !== "scalable" ? `_${dimSlug}` : ""}.${ext}`;
}

function parseDims(dimStr) {
  const m = dimStr.match(/(\d+)[×x](\d+)/i);
  if (m) return [parseInt(m[1]), parseInt(m[2])];
  return [800, 800];
}

function buildSVG(w, h, format, usage, accentColor, projName) {
  const esc = s => s.replace(/[<>&'"]/g, c => ({ "<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;" }[c]));
  const fs1 = Math.max(24, Math.min(w * 0.07, 72));
  const fs2 = Math.max(12, Math.min(w * 0.025, 22));
  const fs3 = Math.max(10, Math.min(w * 0.02, 18));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="#0D0D0D"/>
  <rect x="4" y="4" width="${w-8}" height="${h-8}" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.3"/>
  <!-- grid -->
  <g stroke="#1A1A1A" stroke-width="1" opacity="0.8">
    ${Array.from({length:Math.floor(w/80)},(_,i)=>`<line x1="${(i+1)*80}" y1="0" x2="${(i+1)*80}" y2="${h}"/>`).join('')}
    ${Array.from({length:Math.floor(h/80)},(_,i)=>`<line x1="0" y1="${(i+1)*80}" x2="${w}" y2="${(i+1)*80}"/>`).join('')}
  </g>
  <!-- corner marks -->
  <g stroke="${accentColor}" stroke-width="1.5" fill="none">
    <path d="M8,28 L8,8 L28,8"/>
    <path d="M${w-28},8 L${w-8},8 L${w-8},28"/>
    <path d="M8,${h-28} L8,${h-8} L28,${h-8}"/>
    <path d="M${w-28},${h-8} L${w-8},${h-8} L${w-8},${h-28}"/>
  </g>
  <!-- crosshair -->
  <g stroke="${accentColor}" stroke-width="1" opacity="0.2">
    <line x1="${w*0.44}" y1="${h/2}" x2="${w*0.56}" y2="${h/2}"/>
    <line x1="${w/2}" y1="${h*0.44}" x2="${w/2}" y2="${h*0.56}"/>
  </g>
  <text x="${w/2}" y="${h/2 - fs1*0.5}" font-family="AuxMono, Courier New, monospace" font-size="${fs1}" font-weight="bold" fill="${accentColor}" text-anchor="middle">${esc(format)}</text>
  <text x="${w/2}" y="${h/2 + fs2*0.8}" font-family="AuxMono, Courier New, monospace" font-size="${fs2}" fill="#777" text-anchor="middle">${w}×${h}</text>
  <text x="${w/2}" y="${h/2 + fs2*2.2}" font-family="AuxMono, Courier New, monospace" font-size="${fs3}" fill="#555" text-anchor="middle">${esc(usage)}</text>
  ${projName ? `<text x="${w/2}" y="${h-14}" font-family="AuxMono, Courier New, monospace" font-size="${Math.max(9,fs3*0.8)}" fill="#2A2A2A" text-anchor="middle">${esc(projName)}</text>` : ""}
</svg>`;
}

function buildPDF(usage, dimensions, projectName) {
  const esc = s => (s || "").replace(/[()\\]/g, "\\$&").substring(0, 60);
  const lines = [
    `PLACEHOLDER FILE`,
    `Usage: ${esc(usage)}`,
    `Dimensions: ${esc(dimensions)}`,
    `Project: ${esc(projectName || "untitled")}`,
    ``,
    `Replace with your actual export.`,
    `Generated by Studio Export Planner.`,
  ];
  const streamContent = lines.map((l, i) =>
    `BT /F1 11 Tf 50 ${720 - i * 22} Td (${l}) Tj ET`
  ).join("\n");

  const o1 = `1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n`;
  const o2 = `2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n`;
  const o3 = `3 0 obj\n<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 5 0 R/Resources<</Font<</F1 4 0 R>>>>>>\nendobj\n`;
  const o4 = `4 0 obj\n<</Type/Font/Subtype/Type1/BaseFont/Courier>>\nendobj\n`;
  const o5 = `5 0 obj\n<</Length ${streamContent.length}>>\nstream\n${streamContent}\nendstream\nendobj\n`;
  const header = `%PDF-1.4\n`;
  const objs = [o1, o2, o3, o4, o5];
  const pad = n => String(n).padStart(10, "0");
  let off = header.length;
  const offsets = objs.map(o => { const p = off; off += o.length; return p; });
  const xrefPos = off;
  const xref = `xref\n0 6\n0000000000 65535 f \n` + offsets.map(o => `${pad(o)} 00000 n \n`).join("");
  const trailer = `trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return header + objs.join("") + xref + trailer;
}

function buildEPS(usage, w, h, projName) {
  const bw = w || 595, bh = h || 595;
  return `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 ${bw} ${bh}
%%Title: ${projName || "untitled"} - ${usage}
%%Creator: Studio Export Planner
%%EndComments
/Courier findfont 12 scalefont setfont
${Math.round(bw * 0.08)} ${Math.round(bh * 0.6)} moveto (PLACEHOLDER — ${usage}) show
${Math.round(bw * 0.08)} ${Math.round(bh * 0.55)} moveto (Replace with your actual EPS export.) show
${Math.round(bw * 0.08)} ${Math.round(bh * 0.5)} moveto (Project: ${projName || "untitled"}) show
%%EOF`;
}

function buildStub(format, usage, dimensions, projectName) {
  return `PLACEHOLDER FILE
================
Format:     ${format}
Usage:      ${usage}
Dimensions: ${dimensions}
Project:    ${projectName || "untitled"}

This is a placeholder generated by Studio Export Planner.
Replace this file with your actual ${format} export.

Generated: ${new Date().toLocaleDateString()}`;
}

function buildReadme(projectType, projectName, exports) {
  const lines = [
    `DISPATCH — Export Package`,
    `=========================`,
    `Project: ${projectName || "untitled"}`,
    `Type:    ${projectType}`,
    `Files:   ${exports.length} placeholders`,
    `Generated: ${new Date().toLocaleString()}`,
    ``,
    `FILE MANIFEST`,
    `─────────────`,
  ];
  exports.forEach((exp, i) => {
    const fname = generateFilename(projectName, exp.format, exp.category, exp.dimensions);
    lines.push(`${String(i + 1).padStart(2, " ")}. [${exp.category}] ${fname}`);
    lines.push(`    ${exp.usage} — ${exp.dimensions}${exp.required ? " (REQUIRED)" : ""}`);
  });
  lines.push(``, `NOTES`, `─────`,
    `• All files are PLACEHOLDERS. Replace each with your actual design export.`,
    `• Image files (PNG/JPG/WebP) are canvas-rendered at correct pixel dimensions.`,
    `• SVG files are properly structured SVG XML.`,
    `• PDF files are minimal valid PDF documents.`,
    `• Video/binary formats (MP4/MOV/PPTX etc.) are text stubs with correct filenames.`,
    `• Naming convention: {project}_{category}_{format}_{dimensions}.{ext}`,
    ``, `Engineered by CurioLabs`,
  );
  return lines.join("\n");
}

async function loadJSZip() {
  if (window.JSZip) return window.JSZip;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    s.onload = () => resolve(window.JSZip);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function renderCanvasBlob(w, h, format, usage, accentColor, projName, mimeType) {
  const MAX = 1400;
  const scale = Math.min(1, MAX / Math.max(w, h, 1));
  const cw = Math.max(2, Math.round(w * scale));
  const ch = Math.max(2, Math.round(h * scale));
  const c = document.createElement("canvas");
  c.width = cw; c.height = ch;
  const ctx = c.getContext("2d");

  // Background
  ctx.fillStyle = "#0D0D0D";
  ctx.fillRect(0, 0, cw, ch);

  // Grid
  const gs = Math.max(16, Math.min(50, Math.min(cw, ch) / 10));
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 1;
  for (let x = gs; x < cw; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke(); }
  for (let y = gs; y < ch; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke(); }

  // Border
  ctx.strokeStyle = accentColor + "44";
  ctx.lineWidth = Math.max(1, cw * 0.003);
  ctx.strokeRect(4, 4, cw - 8, ch - 8);

  // Corner marks
  const cm = Math.max(10, Math.min(22, cw * 0.04));
  const mg = 8;
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  [[mg,mg],[cw-mg,mg],[mg,ch-mg],[cw-mg,ch-mg]].forEach(([x, y]) => {
    const dx = x < cw/2 ? 1 : -1, dy = y < ch/2 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx*cm, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + dy*cm); ctx.stroke();
  });

  // Crosshair
  const cx = cw/2, cy = ch/2, cl = Math.min(cw,ch)*0.07;
  ctx.strokeStyle = accentColor + "30";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-cl,cy); ctx.lineTo(cx+cl,cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,cy-cl); ctx.lineTo(cx,cy+cl); ctx.stroke();

  // Format label
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fmtSz = Math.max(12, Math.min(cw*0.1, 60));
  ctx.font = `bold ${fmtSz}px "AuxMono", "Courier New", monospace`;
  ctx.fillStyle = accentColor;
  ctx.fillText(format, cx, cy - fmtSz*0.65);

  // Dimensions
  const dimSz = Math.max(9, Math.min(cw*0.032, 18));
  ctx.font = `${dimSz}px "AuxMono", "Courier New", monospace`;
  ctx.fillStyle = "#777";
  ctx.fillText(`${w}×${h}`, cx, cy + fmtSz*0.1);

  // Usage
  const usgSz = Math.max(8, Math.min(cw*0.026, 14));
  ctx.font = `${usgSz}px "AuxMono", "Courier New", monospace`;
  ctx.fillStyle = "#555";
  const usg = usage.length > 36 ? usage.slice(0,34)+"…" : usage;
  ctx.fillText(usg, cx, cy + fmtSz*0.82);

  // Project name
  if (projName) {
    const pSz = Math.max(7, Math.min(cw*0.02, 11));
    ctx.font = `${pSz}px "AuxMono", "Courier New", monospace`;
    ctx.fillStyle = "#2A2A2A";
    ctx.fillText(projName, cx, ch - pSz - 6);
  }

  return new Promise(resolve =>
    c.toBlob(blob => {
      if (blob) resolve(blob);
      else c.toBlob(resolve, "image/png");
    }, mimeType, 0.92)
  );
}

async function generateZip(projectType, projectName, onProgress) {
  const JSZip = await loadJSZip();
  const zip = new JSZip();
  const data = PROJECT_TYPES[projectType];
  const { color: accentColor, exports } = data;

  zip.file("README.txt", buildReadme(projectType, projectName, exports));

  for (let i = 0; i < exports.length; i++) {
    const exp = exports[i];
    onProgress({ current: i, total: exports.length, label: exp.usage });

    const fname = generateFilename(projectName, exp.format, exp.category, exp.dimensions);
    const safecat = exp.category.replace(/[/\\:*?"<>|]/g, "-");
    const folder = zip.folder(safecat);
    const fmt = exp.format.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const [w, h] = parseDims(exp.dimensions);

    if (["PNG","JPG","JPEG","WEBP","GIF","ICO","TIFF"].includes(fmt)) {
      const mime = fmt === "JPG" || fmt === "JPEG" ? "image/jpeg"
                 : fmt === "WEBP" ? "image/webp"
                 : "image/png";
      const blob = await renderCanvasBlob(w, h, exp.format, exp.usage, accentColor, projectName, mime);
      folder.file(fname, blob);
    } else if (fmt === "SVG") {
      folder.file(fname, buildSVG(w, h, exp.format, exp.usage, accentColor, projectName));
    } else if (fmt === "PDF" || fmt === "PDFX1A") {
      folder.file(fname, buildPDF(exp.usage, exp.dimensions, projectName));
    } else if (fmt === "EPS") {
      folder.file(fname, buildEPS(exp.usage, w, h, projectName));
    } else {
      // MP4, MOV, WebM, PPTX, etc. — text stub with correct filename
      folder.file(fname, buildStub(exp.format, exp.usage, exp.dimensions, projectName));
    }
  }

  onProgress({ current: exports.length, total: exports.length, label: "Compressing…" });
  return await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 3 } });
}

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 768);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ tip, accentColor, isMobile }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, align: "left" });
  const btnRef = useRef(null);
  const tipRef = useRef(null);

  const calcPos = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const tipW = Math.min(280, vw - 32);
    const left = r.left + r.width / 2;
    const align = left + tipW / 2 > vw - 12 ? "right"
                : left - tipW / 2 < 12 ? "left"
                : "center";
    setPos({ top: r.bottom + 8, left, align, tipW });
  };

  const show = () => { calcPos(); setOpen(true); };
  const hide = () => setOpen(false);
  const toggle = (e) => { e.stopPropagation(); open ? hide() : show(); };

  useEffect(() => {
    if (!open) return;
    const close = () => hide();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [open]);

  const translateX = pos.align === "right" ? "calc(-100% + 16px)"
                   : pos.align === "center" ? "translateX(-50%)"
                   : "-8px";

  return (
    <>
      <button
        ref={btnRef}
        onClick={isMobile ? toggle : undefined}
        onMouseEnter={!isMobile ? show : undefined}
        onMouseLeave={!isMobile ? hide : undefined}
        style={{
          width: "16px", height: "16px", borderRadius: "50%",
          border: `1px solid ${open ? accentColor : "#2A2A2A"}`,
          background: open ? `${accentColor}18` : "transparent",
          color: open ? accentColor : "#3A3A3A",
          fontSize: "9px", fontWeight: "bold",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
          fontFamily: "inherit",
          transition: "all 0.15s",
          WebkitTapHighlightColor: "transparent",
          lineHeight: 1,
        }}
        aria-label="More info"
      >
        ?
      </button>

      {open && (
        <div
          ref={tipRef}
          onMouseEnter={!isMobile ? show : undefined}
          onMouseLeave={!isMobile ? hide : undefined}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.align === "right" ? "auto" : pos.left,
            right: pos.align === "right" ? (window.innerWidth - pos.left) : "auto",
            transform: pos.align === "center" ? "translateX(-50%)" : "none",
            width: pos.tipW || 280,
            background: "#161616",
            border: `1px solid ${accentColor}33`,
            borderRadius: "6px",
            padding: "10px 12px",
            zIndex: 9999,
            pointerEvents: isMobile ? "none" : "auto",
            boxShadow: `0 8px 32px #00000088, 0 0 0 1px ${accentColor}11`,
          }}
        >
          <div style={{ fontSize: "11px", color: "#999", lineHeight: 1.7, fontFamily: "'AuxMono', 'Courier New', monospace" }}>
            {tip}
          </div>
          {/* Arrow */}
          <div style={{
            position: "absolute", top: "-5px",
            left: pos.align === "center" ? "50%" : pos.align === "right" ? "auto" : "16px",
            right: pos.align === "right" ? "16px" : "auto",
            transform: pos.align === "center" ? "translateX(-50%) rotate(45deg)" : "rotate(45deg)",
            width: "8px", height: "8px",
            background: "#161616",
            borderTop: `1px solid ${accentColor}33`,
            borderLeft: `1px solid ${accentColor}33`,
          }} />
        </div>
      )}
    </>
  );
}

// ── Step 1 ────────────────────────────────────────────────────────────────────
function ProjectPicker({ onSelect, isMobile }) {
  return (
    <div style={{ padding: isMobile ? "20px 16px 32px" : "40px" }}>
      <div style={{ marginBottom: isMobile ? "20px" : "32px" }}>
        <div style={{ fontSize: isMobile ? "18px" : "22px", fontWeight: "bold", color: "#E8E4DC", marginBottom: "6px" }}>
          What are you exporting?
        </div>
        <div style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Select a project type to generate your dispatch
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: isMobile ? "10px" : "12px" }}>
        {Object.entries(PROJECT_TYPES).map(([name, data]) => (
          <button key={name} onClick={() => onSelect(name)} style={{
            background: "#111", border: "1px solid #1E1E1E", borderRadius: "8px",
            padding: isMobile ? "16px 12px" : "20px 16px", cursor: "pointer", textAlign: "left",
            transition: "all 0.18s ease", display: "flex", flexDirection: "column", gap: "8px",
            minHeight: isMobile ? "96px" : "100px", WebkitTapHighlightColor: "transparent",
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor = data.color; e.currentTarget.style.background = `${data.color}0D`; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "#1E1E1E"; e.currentTarget.style.background = "#111"; }}
          >
            <span style={{ fontSize: isMobile ? "20px" : "22px", color: data.color }}>{data.icon}</span>
            <div>
              <div style={{ fontSize: isMobile ? "12px" : "13px", color: "#E8E4DC", fontWeight: "bold", lineHeight: 1.3 }}>{name}</div>
              <div style={{ fontSize: "11px", color: "#666", marginTop: "3px", lineHeight: 1.4 }}>{data.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step 2 ────────────────────────────────────────────────────────────────────
function NameStep({ selected, projectName, setProjectName, onContinue, onBack, isMobile }) {
  const data = PROJECT_TYPES[selected];
  const inputRef = useRef(null);
  useEffect(() => { const t = setTimeout(() => inputRef.current?.focus(), 150); return () => clearTimeout(t); }, []);
  return (
    <div style={{ padding: isMobile ? "24px 16px" : "60px 40px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "480px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontFamily: "inherit", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: 0, display: "flex", alignItems: "center", gap: "6px", width: "fit-content" }}>
        ← Back
      </button>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: `${data.color}12`, border: `1px solid ${data.color}30`, borderRadius: "8px", padding: "12px 16px", width: "fit-content" }}>
        <span style={{ color: data.color, fontSize: "18px" }}>{data.icon}</span>
        <span style={{ color: data.color, fontSize: "13px", fontWeight: "bold" }}>{selected}</span>
        <span style={{ fontSize: "10px", color: `${data.color}88`, marginLeft: "4px" }}>{PROJECT_TYPES[selected].exports.length} exports</span>
      </div>
      <div>
        <div style={{ fontSize: isMobile ? "20px" : "24px", fontWeight: "bold", color: "#E8E4DC", marginBottom: "6px" }}>Name your project</div>
        <div style={{ fontSize: "10px", color: "#555", letterSpacing: "0.1em" }}>Used to auto-generate filenames — you can skip this</div>
      </div>
      <input ref={inputRef} value={projectName} onChange={e => setProjectName(e.target.value)} onKeyDown={e => e.key === "Enter" && onContinue()}
        placeholder="e.g. acme-rebrand"
        style={{ background: "#111", border: "1px solid #2A2A2A", borderRadius: "8px", padding: "16px", color: "#E8E4DC", fontFamily: "inherit", fontSize: "16px", width: "100%", boxSizing: "border-box", outline: "none", transition: "border-color 0.15s", WebkitAppearance: "none" }}
        onFocus={e => e.target.style.borderColor = data.color}
        onBlur={e => e.target.style.borderColor = "#2A2A2A"}
      />
      <button onClick={onContinue} style={{ background: data.color, border: "none", borderRadius: "8px", padding: "16px", color: "#000", fontFamily: "inherit", fontSize: "12px", fontWeight: "bold", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", width: "100%", transition: "opacity 0.15s", WebkitTapHighlightColor: "transparent" }}
        onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
        onMouseOut={e => e.currentTarget.style.opacity = "1"}
      >
        Generate Dispatch →
      </button>
    </div>
  );
}

// ── ZIP Progress Modal ────────────────────────────────────────────────────────
function ZipModal({ progress, accentColor }) {
  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000CC", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#111", border: `1px solid ${accentColor}33`, borderRadius: "12px", padding: "32px 36px", width: "min(340px, 90vw)", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: "20px" }}>
          Building Dispatch
        </div>
        {/* Animated icon */}
        <div style={{ fontSize: "32px", color: accentColor, marginBottom: "20px", animation: "spin 1.2s linear infinite", display: "inline-block" }}>
          ◈
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        {/* Progress bar */}
        <div style={{ height: "3px", background: "#1A1A1A", borderRadius: "2px", marginBottom: "12px", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: accentColor, borderRadius: "2px", transition: "width 0.3s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <span style={{ fontSize: "10px", color: "#444" }}>{progress.current} of {progress.total} files</span>
          <span style={{ fontSize: "10px", color: accentColor, fontWeight: "bold" }}>{pct}%</span>
        </div>
        <div style={{ fontSize: "10px", color: "#444", fontFamily: "monospace", height: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {progress.label || "…"}
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Checklist ─────────────────────────────────────────────────────────
function Checklist({ selected, projectName, onBack, isMobile }) {
  const [checked, setChecked] = useState({});
  const [showNames, setShowNames] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [zipState, setZipState] = useState("idle"); // idle | generating | done | error
  const [zipProgress, setZipProgress] = useState({ current: 0, total: 0, label: "" });

  const data = PROJECT_TYPES[selected];
  const exports = data.exports;
  const accentColor = data.color;
  const categories = ["All", ...new Set(exports.map(e => e.category))];
  const filtered = exports.filter(e => filterCat === "All" || e.category === filterCat);
  const required = exports.filter(e => e.required).length;
  const total = exports.length;
  const done = Object.values(checked).filter(Boolean).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const allDone = done === total && total > 0;

  const toggle = i => setChecked(c => ({ ...c, [i]: !c[i] }));
  const markAll = () => { const a = {}; exports.forEach((_, i) => { a[i] = true; }); setChecked(a); };
  const clearAll = () => setChecked({});

  const handleDownloadZip = async () => {
    if (zipState === "generating") return;
    setZipState("generating");
    setZipProgress({ current: 0, total: exports.length, label: "Starting…" });
    try {
      const blob = await generateZip(selected, projectName, (p) => setZipProgress(p));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(projectName || "export-pack").toLowerCase().replace(/[^a-z0-9]/g, "-")}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setZipState("done");
      setTimeout(() => setZipState("idle"), 3000);
    } catch (err) {
      console.error(err);
      setZipState("error");
      setTimeout(() => setZipState("idle"), 4000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {zipState === "generating" && <ZipModal progress={zipProgress} accentColor={accentColor} />}

      {/* Header */}
      <div style={{ padding: isMobile ? "12px 16px 0" : "18px 40px 0", background: "#111", borderBottom: "1px solid #1A1A1A", flexShrink: 0 }}>
        {/* Row 1: back + title + controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontFamily: "inherit", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 0", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>
            ← Back
          </button>
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ color: accentColor, flexShrink: 0 }}>{data.icon}</span>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#E8E4DC", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected}</span>
            {projectName && <span style={{ fontSize: "10px", color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 1 }}>· {projectName}</span>}
          </div>
          {/* Utility buttons */}
          <button onClick={markAll} style={{ background: "transparent", border: `1px solid ${accentColor}44`, color: accentColor, padding: "5px 9px", cursor: "pointer", fontFamily: "inherit", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "4px", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>All</button>
          <button onClick={clearAll} style={{ background: "transparent", border: "1px solid #252525", color: "#555", padding: "5px 9px", cursor: "pointer", fontFamily: "inherit", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "4px", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>Clear</button>
        </div>

        {/* Row 2: progress bar */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
            <div style={{ display: "flex", gap: "14px" }}>
              <span style={{ fontSize: "10px", color: "#444" }}><span style={{ color: accentColor }}>{required}</span> required</span>
              <span style={{ fontSize: "10px", color: "#444" }}>{total - required} optional</span>
            </div>
            <span style={{ fontSize: "11px", color: allDone ? "#34D399" : accentColor, fontWeight: "bold" }}>{done}/{total}{allDone ? " ✓" : ""}</span>
          </div>
          <div style={{ height: "3px", background: "#1A1A1A", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: allDone ? "#34D399" : accentColor, borderRadius: "2px", transition: "width 0.35s ease" }} />
          </div>
        </div>

        {/* Row 3: filters + names toggle + ZIP button */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", paddingBottom: "12px" }}>
          <div style={{ display: "flex", gap: "5px", flex: 1, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)} style={{
                background: filterCat === cat ? accentColor : "transparent",
                border: `1px solid ${filterCat === cat ? accentColor : "#252525"}`,
                color: filterCat === cat ? "#000" : "#666",
                padding: "4px 11px", cursor: "pointer", fontFamily: "inherit", fontSize: "9px",
                letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "20px",
                fontWeight: filterCat === cat ? "bold" : "normal", whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s", WebkitTapHighlightColor: "transparent",
              }}>{cat}</button>
            ))}
          </div>
          <button onClick={() => setShowNames(n => !n)} style={{
            background: showNames ? `${accentColor}18` : "transparent",
            border: `1px solid ${showNames ? accentColor : "#252525"}`,
            color: showNames ? accentColor : "#555",
            padding: "4px 10px", cursor: "pointer", fontFamily: "inherit", fontSize: "9px",
            letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "4px",
            flexShrink: 0, WebkitTapHighlightColor: "transparent", whiteSpace: "nowrap",
          }}>
            {showNames ? "Names ×" : "Names"}
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "10px 16px" : "16px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {filtered.map((exp) => {
            const gi = exports.indexOf(exp);
            const isDone = checked[gi];
            return (
              <div key={gi} onClick={() => toggle(gi)} style={{
                background: isDone ? "#0C180E" : "#0F0F0F",
                border: `1px solid ${isDone ? "#1A3A1E" : "#1A1A1A"}`,
                borderRadius: "8px", padding: isMobile ? "12px 14px" : "13px 16px",
                cursor: "pointer", transition: "border-color 0.15s, background 0.15s, opacity 0.15s",
                display: "flex", gap: "12px", alignItems: "flex-start",
                opacity: isDone ? 0.6 : 1, userSelect: "none", WebkitTapHighlightColor: "transparent", minHeight: "52px",
              }}>
                <div style={{ width: "22px", height: "22px", border: `1.5px solid ${isDone ? "#34D399" : "#2A2A2A"}`, borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? "#34D399" : "transparent", flexShrink: 0, marginTop: "1px", transition: "all 0.15s" }}>
                  {isDone && <span style={{ color: "#000", fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>✓</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px", flexWrap: "wrap" }}>
                    <span style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}35`, color: accentColor, padding: "1px 7px", borderRadius: "3px", fontSize: "10px", fontWeight: "bold", letterSpacing: "0.06em", flexShrink: 0 }}>{exp.format}</span>
                    <span style={{ fontSize: "13.5px", color: isDone ? "#666" : "#D4D0C8", flex: 1, minWidth: 0 }}>{exp.usage}</span>
                    {exp.required && <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: accentColor, flexShrink: 0, opacity: 0.6, marginTop: "1px" }} />}
                    {exp.tip && (
                      <span onClick={e => e.stopPropagation()}>
                        <Tooltip tip={exp.tip} accentColor={accentColor} isMobile={isMobile} />
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{ fontSize: "10px", color: "#444" }}>{exp.category}</span>
                    <span style={{ fontSize: "10px", color: "#383838", fontFamily: "monospace" }}>{exp.dimensions}</span>
                  </div>
                  {showNames && (
                    <div style={{ marginTop: "7px", fontSize: "9px", color: "#444", fontFamily: "monospace", background: "#0A0A0A", padding: "5px 8px", borderRadius: "4px", border: "1px solid #161616", wordBreak: "break-all", lineHeight: 1.6 }}>
                      {generateFilename(projectName, exp.format, exp.category, exp.dimensions)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend + ZIP download */}
        <div style={{ marginTop: "16px", display: "flex", gap: "10px", alignItems: "stretch", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: accentColor, display: "inline-block", opacity: 0.6 }} />
              <span style={{ fontSize: "10px", color: "#4A4A4A", textTransform: "uppercase", letterSpacing: "0.1em" }}>Required</span>
            </div>
            <span style={{ fontSize: "10px", color: "#3A3A3A", textTransform: "uppercase", letterSpacing: "0.1em" }}>Tap row to check</span>
          </div>

          {/* ZIP button */}
          <button
            onClick={handleDownloadZip}
            disabled={zipState === "generating"}
            style={{
              background: zipState === "done" ? "#34D39922"
                        : zipState === "error" ? "#FF444422"
                        : `${accentColor}18`,
              border: `1px solid ${zipState === "done" ? "#34D399"
                                 : zipState === "error" ? "#FF4444"
                                 : accentColor}`,
              color: zipState === "done" ? "#34D399"
                   : zipState === "error" ? "#FF4444"
                   : accentColor,
              padding: "10px 18px",
              borderRadius: "6px",
              cursor: zipState === "generating" ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontSize: "10px",
              fontWeight: "bold",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
              opacity: zipState === "generating" ? 0.6 : 1,
              WebkitTapHighlightColor: "transparent",
              flexShrink: 0,
            }}
            onMouseOver={e => { if (zipState !== "generating") e.currentTarget.style.background = `${accentColor}28`; }}
            onMouseOut={e => { if (zipState !== "generating" && zipState !== "done" && zipState !== "error") e.currentTarget.style.background = `${accentColor}18`; }}
          >
            <span style={{ fontSize: "14px" }}>
              {zipState === "done" ? "✓" : zipState === "error" ? "✕" : "↓"}
            </span>
            <span>
              {zipState === "done"  ? "Downloaded!"
             : zipState === "error" ? "Error — retry"
             : `Dispatch ZIP  (${total} files)`}
            </span>
          </button>
        </div>

        {/* ZIP explainer */}
        <div style={{ marginTop: "8px", padding: "10px 14px", background: "#0A0A0A", border: "1px solid #141414", borderRadius: "6px" }}>
          <div style={{ fontSize: "9px", color: "#383838", lineHeight: 1.7 }}>
            <span style={{ color: "#4A4A4A" }}>Dispatch includes</span> · Canvas-rendered PNG/JPG/WebP at correct pixel dimensions
            · Structured SVG files · Minimal valid PDFs · Text stubs for video/binary formats
            · Category folders · README with full manifest
          </div>
        </div>

        <div style={{ height: "24px" }} />
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function ExportPlanner() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [projectName, setProjectName] = useState("");
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 700;
  const accentColor = selected ? PROJECT_TYPES[selected].color : "#FF6B35";

  // Font + global styles handled in index.html

  const handleSelectProject = n => { setSelected(n); setProjectName(""); setStep(2); };
  const handleContinue = () => setStep(3);
  const handleBack = () => {
    if (step === 3) setStep(2);
    else { setStep(1); setSelected(null); }
  };

  return (
    <div style={{ height: "100vh", background: "#0D0D0D", fontFamily: "'AuxMono', 'Courier New', monospace", color: "#E8E4DC", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ background: "#111", borderBottom: "1px solid #1A1A1A", padding: isMobile ? "11px 16px" : "14px 40px", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <span style={{ fontSize: "11px", letterSpacing: "0.18em", color: "#444", textTransform: "uppercase" }}>
          DISPATCH
        </span>
        <span style={{ fontSize: "10px", color: "#2A2A2A" }}>by CurioLabs</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ width: s === step ? "18px" : "5px", height: "5px", borderRadius: "3px", background: s === step ? accentColor : s < step ? `${accentColor}44` : "#1E1E1E", transition: "all 0.3s ease" }} />
          ))}
        </div>
        <span style={{ fontSize: "9px", color: "#383838", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {step === 1 ? "Pick type" : step === 2 ? "Name it" : "Check off"}
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: step === 3 ? "hidden" : "auto", display: "flex", flexDirection: "column" }}>
        {step === 1 && <ProjectPicker onSelect={handleSelectProject} isMobile={isMobile} />}
        {step === 2 && selected && <NameStep selected={selected} projectName={projectName} setProjectName={setProjectName} onContinue={handleContinue} onBack={handleBack} isMobile={isMobile} />}
        {step === 3 && selected && <Checklist selected={selected} projectName={projectName} onBack={handleBack} isMobile={isMobile} />}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid #141414",
        padding: "8px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0A0A0A",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#444", textTransform: "uppercase" }}>
          Engineered by CurioLabs
        </span>
      </div>
    </div>
  );
}
