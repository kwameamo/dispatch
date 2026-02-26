# DISPATCH
**File Export Automation Planner** — Engineered by CurioLabs

Stop the "Can I also get PNG?" chaos. DISPATCH generates export checklists,
correct dimensions, naming conventions, and a ready-to-fill ZIP for every
project type.

---

## Quick Start (localhost)

**Requirements:** Node.js 18+ and npm

```bash
# 1. Install dependencies
npm install

# 2. Start dev server → opens at http://localhost:3000
npm run dev
```

---

## Production Build

```bash
# Build optimised static files into /dist
npm run build

# Preview the production build locally
npm run preview
```

The `/dist` folder is self-contained — drop it on any static host.

---

## Hosting

| Platform     | Command / Notes |
|--------------|-----------------|
| **Netlify**  | Drag & drop the `/dist` folder at app.netlify.com/drop |
| **Vercel**   | `npx vercel` from the project root (auto-detects Vite) |
| **Cloudflare Pages** | Connect repo → build command: `npm run build`, output: `dist` |
| **GitHub Pages** | Set `base` in `vite.config.js` to your repo name, then deploy `/dist` |
| **Any static host** | Upload the contents of `/dist` — no server required |

---

## Project Structure

```
dispatch/
├── index.html          ← Entry point, font imports, base styles
├── vite.config.js      ← Vite config (port 3000, auto-open)
├── package.json
└── src/
    ├── main.jsx        ← React root mount
    └── App.jsx         ← Full DISPATCH application
```

---

## Features

- **6 project types** — Brand Identity, Social Media Pack, Print Campaign,
  Web / UI Design, Presentation, Motion / Animation
- **Per-export tooltips** — explains *why* each format exists, not just what it is
- **Auto filename generator** — consistent naming convention across the whole pack
- **ZIP download** — canvas-rendered images at correct pixel dimensions,
  valid SVG/PDF, EPS, and text stubs for video formats, all in category folders
- **Mobile-first 3-step flow** — works on phone, tablet, and desktop
- **AuxMono** typeface via Fontshare CDN

---

Engineered by CurioLabs
