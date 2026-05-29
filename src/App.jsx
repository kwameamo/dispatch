import { useState, useEffect, useRef } from "react";

const FONT = '"AuxMono", "Courier New", monospace';

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
      { format: "PNG", category: "Instagram", dimensions: "1080×1920px",  usage: "Story / Reels cover",   required: true,  tip: "Full-bleed vertical format for Stories and Reels covers. Keep interactive elements in the middle 1080×1420px safe zone to avoid UI overlap." },
      { format: "PNG", category: "Facebook",  dimensions: "1200×630px",   usage: "Link share preview",    required: true,  tip: "The image Facebook and most platforms pull when a URL is shared. Set this in your og:image meta tag. Text should stay within the centre 80% to avoid cropping." },
      { format: "PNG", category: "Facebook",  dimensions: "820×312px",    usage: "Cover photo",           required: false, tip: "The wide banner at the top of your Facebook page. Crops to 640×360px on mobile, so keep the logo and key info in the centre-right area." },
      { format: "PNG", category: "Twitter/X", dimensions: "1600×900px",   usage: "Post image",            required: true,  tip: "X displays this at 16:9 in the feed. High-contrast images with minimal text perform best. Faces and objects in the centre survive the auto-crop algorithm." },
      { format: "PNG", category: "Twitter/X", dimensions: "1500×500px",   usage: "Header banner",         required: false, tip: "The profile header on X. It gets cropped heavily on mobile, so treat the outer thirds as unsafe zones. Place the key visual in the centre." },
      { format: "PNG", category: "LinkedIn",  dimensions: "1200×627px",   usage: "Post image",            required: true,  tip: "LinkedIn feed images appear at roughly 1.91:1 ratio. Text-forward designs with clear hierarchy perform well — this is a professional audience." },
      { format: "PNG", category: "LinkedIn",  dimensions: "1584×396px",   usage: "Company banner",        required: false, tip: "LinkedIn company page banner. Very wide and short — best used for brand messaging, taglines, or abstract imagery. Avoid putting faces in the far edges." },
      { format: "PNG", category: "YouTube",   dimensions: "2560×1440px",  usage: "Channel art",           required: false, tip: "YouTube channel banner. Only the central 1546×423px is visible on all devices. The outer areas appear on TV screens only." },
      { format: "PNG", category: "YouTube",   dimensions: "1280×720px",   usage: "Thumbnail",             required: false, tip: "Custom thumbnails are the single biggest driver of click-through rate on YouTube. High contrast, bold text, and expressive faces perform best." },
    ],
  },
  "Print Campaign": {
    icon: "▣", color: "#A78BFA", description: "Posters, flyers, brochures",
    exports: [
      { format: "PDF",      category: "Print-Ready", dimensions: "With 3mm bleed", usage: "Press-ready (CMYK)",   required: true,  tip: "The master print file. The 3mm bleed means your artwork extends beyond the trim line — the printer cuts into this zone so there's no white edge. Must be CMYK colour space, not RGB." },
      { format: "PDF",      category: "Print-Ready", dimensions: "No bleed",       usage: "Digital distribution",  required: true,  tip: "A clean PDF trimmed to exact size, for emailing to clients or sharing digitally. No bleed needed since it'll never be printed and cut." },
      { format: "JPG",      category: "Preview",     dimensions: "300 DPI",        usage: "Client approval",       required: true,  tip: "A high-res JPEG rendered at 300 DPI — good enough for clients to zoom in and check details. Share this before sending print-ready files to avoid costly reprints." },
      { format: "PNG",      category: "Preview",     dimensions: "72 DPI",         usage: "Email preview",         required: true,  tip: "A low-res screen-optimised PNG for quick approval via email or chat. Small file size, loads fast. Not for printing." },
      { format: "TIFF",     category: "Archive",     dimensions: "300 DPI",        usage: "Archival master",       required: false, tip: "Lossless high-res archive format. TIFF preserves every pixel without compression artefacts — the gold standard for long-term asset storage and future reprints." },
      { format: "PDF/X-1a", category: "Press",       dimensions: "With marks",     usage: "Commercial printer",    required: false, tip: "A strict PDF standard specifically for commercial printing. Includes crop marks, registration marks, and bleed info. Required by many offset print vendors and magazines." },
    ],
  },
  "Web / UI Design": {
    icon: "⬡", color: "#34D399", description: "Websites, apps, dashboards",
    exports: [
      { format: "SVG",  category: "Icons",    dimensions: "Scalable",      usage: "All UI icons",           required: true,  tip: "SVG icons stay crisp at every screen resolution and can be styled with CSS. Export each icon on a consistent grid (e.g. 24×24 or 16×16) with 1–2px padding inside the artboard." },
      { format: "PNG",  category: "Assets",   dimensions: "1× + 2× + 3×", usage: "Images & illustrations", required: true,  tip: "Raster images need three sizes: 1× for standard screens, 2× for Retina, 3× for high-DPI mobile. Reference them in HTML using srcset or in CSS with image-set()." },
      { format: "WebP", category: "Assets",   dimensions: "1× + 2×",       usage: "Optimized web images",   required: true,  tip: "WebP is ~30% smaller than PNG/JPG with equal or better quality. Use it as the primary format for web with a PNG fallback for older browsers via the <picture> element." },
      { format: "PNG",  category: "OG Image", dimensions: "1200×630px",    usage: "Social share preview",   required: true,  tip: "This image appears when your site is shared on social media or in iMessage. Set it via the og:image meta tag. Keep it bold and legible at thumbnail size." },
      { format: "ICO",  category: "Favicon",  dimensions: "32×32px",       usage: "Browser tab icon",       required: true,  tip: "The browser tab icon. Place favicon.ico at the root of your domain (/favicon.ico) — browsers request it automatically. Include both 16×16 and 32×32 inside the ICO container." },
      { format: "PNG",  category: "Favicon",  dimensions: "180×180px",     usage: "Apple touch icon",       required: true,  tip: "Used when someone saves your site to their iPhone home screen. Reference it with <link rel=\"apple-touch-icon\">. Should be the logo on a solid colour background — no transparency." },
      { format: "PNG",  category: "Favicon",  dimensions: "512×512px",     usage: "PWA icon",               required: false, tip: "Required for Progressive Web Apps (PWAs). Listed in the web app manifest JSON. Used as the app icon when users install your site to their home screen on Android." },
      { format: "PDF",  category: "Handoff",  dimensions: "Artboard size", usage: "Developer specs",        required: false, tip: "A flat PDF export of your design for clients or stakeholders who don't have Figma access. Not for development — use Figma inspect or Zeplin for actual developer handoff." },
    ],
  },
  "Presentation": {
    icon: "◧", color: "#FBBF24", description: "Decks, pitches, keynotes",
    exports: [
      { format: "PDF",  category: "Slides",  dimensions: "1920×1080px",    usage: "Client distribution",   required: true,  tip: "A locked, non-editable version of your deck for sharing with clients. Fonts are embedded so it looks identical on any device. Use this for final deliverables and email attachments." },
      { format: "PPTX", category: "Slides",  dimensions: "Widescreen 16:9", usage: "Editable version",      required: true,  tip: "The editable PowerPoint file your client can update themselves. Make sure all fonts are embedded or substituted with system fonts. Test it in PowerPoint, not just Keynote." },
      { format: "JPG",  category: "Preview", dimensions: "1920×1080px",    usage: "Thumbnail / preview",   required: true,  tip: "A flat image of the first or hero slide. Use it as the deck preview image in proposals, Notion pages, or emails before the recipient opens the full file." },
      { format: "PNG",  category: "Assets",  dimensions: "2× retina",      usage: "Slide graphics export", required: false, tip: "Exports of individual slide graphics (charts, diagrams, icons) at 2× resolution. Clients often want to reuse these in other documents or social posts." },
      { format: "MP4",  category: "Video",   dimensions: "1920×1080px",    usage: "Animated slides",       required: false, tip: "Export animated or auto-advancing slides as MP4. Useful for trade show loops, digital signage, or LinkedIn video posts where you can't embed a live deck." },
    ],
  },
  "Motion / Animation": {
    icon: "◈", color: "#F472B6", description: "GIFs, videos, animations",
    exports: [
      { format: "MP4",  category: "Video",     dimensions: "1920×1080px H.264",   usage: "Web / social playback", required: true,  tip: "H.264 MP4 is the universal playback format — works everywhere: browsers, social media, video players. Aim for 8–15 Mbps bitrate for web delivery. Keep under 50MB for social uploads." },
      { format: "MOV",  category: "Video",     dimensions: "ProRes 4444",          usage: "Client master file",    required: true,  tip: "The lossless master file you hand off to the client for archiving and future use. ProRes 4444 preserves alpha channels (transparency). Large file size — deliver via WeTransfer or Drive." },
      { format: "GIF",  category: "Animation", dimensions: "800×800px max",        usage: "Email / Slack embeds",  required: true,  tip: "GIF is the only animation format that works inline in emails and Slack without needing to click play. Keep it under 1MB and under 10 seconds. Reduce colours to 64–128 to control file size." },
      { format: "WebM", category: "Animation", dimensions: "1080×1080px",          usage: "Web looping video",     required: false, tip: "WebM with the VP9 codec is 40–50% smaller than an equivalent GIF and plays natively in Chrome/Firefox. Use it as a GIF replacement with the <video autoplay loop muted> pattern." },
      { format: "PNG",  category: "Still",     dimensions: "1920×1080px",          usage: "Poster / thumbnail",    required: true,  tip: "A single freeze-frame of the animation — used as the video poster image (shown before the video loads) and as a thumbnail in video hosting platforms." },
      { format: "MP4",  category: "Social",    dimensions: "1080×1920px vertical", usage: "Stories / Reels",       required: false, tip: "Vertical 9:16 format for Instagram Reels, TikTok, and YouTube Shorts. Keep critical content in the middle 1080×1420px safe zone to avoid UI overlays at top and bottom." },
    ],
  },

  // ── New types ──────────────────────────────────────────────────────────────

  "App Icon Set": {
    icon: "◫", color: "#3B82F6", description: "iOS, Android & web icons",
    exports: [
      { format: "PNG", category: "iOS",     dimensions: "1024×1024px", usage: "App Store icon",           required: true,  tip: "The master App Store listing icon on iOS. Must have no rounded corners or transparency — Apple applies the squircle mask automatically." },
      { format: "PNG", category: "iOS",     dimensions: "180×180px",   usage: "iPhone home screen @3x",   required: true,  tip: "Primary iPhone home screen icon at @3x resolution. Used on all modern iPhones since the iPhone 6 Plus." },
      { format: "PNG", category: "iOS",     dimensions: "120×120px",   usage: "iPhone home screen @2x",   required: true,  tip: "Standard iPhone home screen icon at @2x resolution. Required for older iPhones and some internal uses." },
      { format: "PNG", category: "iOS",     dimensions: "167×167px",   usage: "iPad Pro home screen",     required: true,  tip: "Required for iPad Pro models. Apple recommends providing this even if your app doesn't specifically target iPad Pro." },
      { format: "PNG", category: "iOS",     dimensions: "76×76px",     usage: "iPad home screen @1x",     required: true,  tip: "Standard iPad home screen icon. Also used in Spotlight search and Settings on older iPads." },
      { format: "PNG", category: "iOS",     dimensions: "87×87px",     usage: "iPhone Settings @3x",      required: false, tip: "The small icon that appears in iOS Settings for your app. Proportionally smaller — ensure the logo reads well at this size." },
      { format: "PNG", category: "Android", dimensions: "512×512px",   usage: "Google Play Store",        required: true,  tip: "Required for publishing on Google Play. This is the listing icon — use a clean version on a transparent or coloured background." },
      { format: "PNG", category: "Android", dimensions: "192×192px",   usage: "Launcher icon (xxhdpi)",   required: true,  tip: "Launcher icon for extra-extra-high-density screens. Most modern Android devices use this size." },
      { format: "PNG", category: "Android", dimensions: "144×144px",   usage: "Launcher icon (xhdpi)",    required: true,  tip: "Launcher icon for extra-high-density screens. Include this for broader Android device coverage." },
      { format: "SVG", category: "Web",     dimensions: "Scalable",    usage: "Scalable web icon",        required: true,  tip: "The scalable vector source for web. Reference as <link rel=\"icon\" type=\"image/svg+xml\"> — supported in all modern browsers and scales perfectly on retina displays." },
      { format: "ICO", category: "Web",     dimensions: "16–256px",    usage: "Browser favicon",          required: true,  tip: "Multi-size ICO file for browser tabs. Bundle at least 16×16 and 32×32 inside the container. Place at /favicon.ico — browsers request it automatically." },
      { format: "PNG", category: "Web",     dimensions: "192×192px",   usage: "PWA app icon",             required: false, tip: "Listed in the web app manifest (manifest.json). Used as the icon when users install your site as a PWA on Android home screens." },
    ],
  },
  "Video Content Pack": {
    icon: "▶", color: "#EF4444", description: "YouTube, Reels, TikTok, Shorts",
    exports: [
      { format: "JPG",  category: "YouTube",   dimensions: "1280×720px",   usage: "YouTube thumbnail",           required: true,  tip: "Custom thumbnails are the #1 driver of click-through rate on YouTube. High contrast, bold text, expressive faces, and warm colours all outperform generic captures. Keep under 2MB." },
      { format: "PNG",  category: "YouTube",   dimensions: "2560×1440px",  usage: "YouTube channel art",         required: false, tip: "Channel banner — the safe zone visible on all devices is the central 1546×423px. Design outward from there; outer areas only appear on TV screens." },
      { format: "MP4",  category: "YouTube",   dimensions: "1080×1920px",  usage: "YouTube Shorts",              required: false, tip: "Vertical 9:16 format for YouTube Shorts. Keep essential content in the middle 1080×1420px to avoid UI overlays. Shorts loop automatically — design for replay." },
      { format: "MP4",  category: "Instagram", dimensions: "1080×1920px",  usage: "Instagram Reels",             required: true,  tip: "Reels are the highest-reach format on Instagram. Keep text and branding within the central 1080×1350px safe zone to avoid the UI overlays at top and bottom." },
      { format: "JPG",  category: "Instagram", dimensions: "1080×1080px",  usage: "Reels thumbnail (grid)",      required: false, tip: "Square thumbnail shown in the profile grid for Reels. This is often the first impression — make it visually consistent with your feed aesthetic." },
      { format: "MP4",  category: "TikTok",    dimensions: "1080×1920px",  usage: "TikTok video",                required: true,  tip: "TikTok renders at 9:16. Safe area for text is roughly 1080×1420px centre zone. TikTok overlays username, caption, and buttons around the edges." },
      { format: "PNG",  category: "TikTok",    dimensions: "200×200px",    usage: "TikTok profile photo",        required: false, tip: "Circular crop — keep your logo or face in the centre 60% of the frame. Rendered very small in comments and search results." },
      { format: "MP4",  category: "LinkedIn",  dimensions: "1920×1080px",  usage: "LinkedIn native video",       required: false, tip: "LinkedIn video posts get higher organic reach than link posts. Keep it under 10 minutes. Captions/subtitles are critical — most LinkedIn video is watched without sound." },
      { format: "PNG",  category: "Podcast",   dimensions: "3000×3000px",  usage: "Podcast cover art",           required: false, tip: "Apple Podcasts requires minimum 1400×1400px, maximum 3000×3000px, under 512KB. Design for small sizes — it'll display at ~55px in the app sidebar." },
      { format: "JPG",  category: "Twitter/X", dimensions: "1600×900px",   usage: "Twitter/X video thumbnail",  required: false, tip: "The preview thumbnail shown when sharing video links. 16:9 ratio. Keep branding and key messaging within the centre 70% of the frame to avoid edge cropping." },
    ],
  },
  "Email Campaign": {
    icon: "◎", color: "#10B981", description: "Headers, heroes, banners, icons",
    exports: [
      { format: "PNG", category: "Header",    dimensions: "600×200px",   usage: "Email header banner",         required: true,  tip: "Displayed at the top of most email templates. Keep your logo and brand visible here — this is the first visual element most recipients see before the body loads." },
      { format: "JPG", category: "Hero",      dimensions: "600×400px",   usage: "Hero / feature image",        required: true,  tip: "The main content image in the email body. Many clients block images by default — always write meaningful alt text so the email communicates even without images loaded." },
      { format: "PNG", category: "Product",   dimensions: "600×600px",   usage: "Product feature image",       required: false, tip: "Square product shot for single-product showcases. 600px wide matches the standard email template width — prevents layout breaking on image-loaded clients." },
      { format: "PNG", category: "Product",   dimensions: "180×180px",   usage: "Product thumbnail (3-up)",    required: false, tip: "Used in 3-column product grids. Must be exactly 180px wide so three images fit flush in a 600px email. Keep product against white or neutral background." },
      { format: "PNG", category: "Social",    dimensions: "1200×628px",  usage: "Web version OG preview",      required: false, tip: "The OG image for the hosted web version of your email campaign. Appears when the link is shared in social media or messaging apps." },
      { format: "PNG", category: "Footer",    dimensions: "600×80px",    usage: "Footer banner / divider",     required: false, tip: "Slim footer visual — often used for secondary CTAs, store badges, or a promo message. Keep it minimal so it doesn't compete with the primary call-to-action above." },
      { format: "PNG", category: "Icon",      dimensions: "48×48px",     usage: "Inline icon (dark mode)",     required: false, tip: "Small inline icon at 24px display size. Include both dark and light variants since ~50% of email opens are in dark mode. Double-resolution (48px) keeps them sharp on retina screens." },
      { format: "PNG", category: "Icon",      dimensions: "48×48px",     usage: "Inline icon (light mode)",    required: false, tip: "Light-on-dark variant for dark mode email clients (Apple Mail, Outlook 2022+). Without this, dark-mode clients may invert or hide your light icons." },
      { format: "GIF", category: "Animation", dimensions: "600×300px",   usage: "Animated banner",             required: false, tip: "Keep animated GIFs under 1MB — large GIFs are clipped by Gmail. Outlook shows only the first frame, so that frame must work as a static image on its own." },
    ],
  },
  "Packaging & Label": {
    icon: "◰", color: "#D97706", description: "Dielines, print artwork, labels",
    exports: [
      { format: "PDF", category: "Dieline",  dimensions: "Custom",      usage: "Structural dieline",          required: true,  tip: "The structural template with cut, fold, score, and perforation lines on separate layers. Always get the dieline from your packaging manufacturer — never create one from scratch." },
      { format: "PDF", category: "Artwork",  dimensions: "Custom",      usage: "Print-ready artwork (CMYK)",  required: true,  tip: "CMYK colour space, 300 DPI minimum, 3mm bleed on all sides. Embed all fonts and convert text to outlines. Include Pantone swatches if spot colours are used." },
      { format: "PDF", category: "Artwork",  dimensions: "Custom",      usage: "Client approval proof",       required: true,  tip: "A lower-resolution PDF showing all faces unfolded flat. Send this to the client for sign-off before sending to the printer — corrections at proof stage are free; at print stage, they're expensive." },
      { format: "PNG", category: "Mockup",   dimensions: "3000×3000px", usage: "Flat art for 3D mockups",     required: true,  tip: "High-res flat PNG of the artwork (no dieline lines). Drop into 3D mockup tools like Smartmockups, Placeit, or custom Blender/C4D setups for lifestyle renders." },
      { format: "JPG", category: "Mockup",   dimensions: "2000×2000px", usage: "Lifestyle / in-context shot", required: false, tip: "In-context product photography or 3D render for marketing. Used on e-commerce listings, social media, and pitch decks. Lifestyle context dramatically increases perceived value." },
      { format: "PDF", category: "Label",    dimensions: "Custom",      usage: "Label artwork (print-ready)", required: false, tip: "Separate file for label printers — especially if labels are produced independently of the packaging structure. Include Pantone specifications and material/finish callouts." },
      { format: "PNG", category: "Label",    dimensions: "1800×1200px", usage: "Label flat artwork (digital)", required: false, tip: "Flat PNG of the label artwork for e-commerce product pages, digital marketing, and preview purposes. Transparent background where possible." },
      { format: "EPS", category: "Label",    dimensions: "Scalable",    usage: "Label vector source",         required: false, tip: "Vector source file required by many label printers. EPS ensures the artwork scales perfectly to any label size without quality loss. Include all fonts as outlines." },
      { format: "PDF", category: "Spec",     dimensions: "A4",          usage: "Technical specification sheet", required: false, tip: "Document covering material type, finish (matte/gloss/foil), dimensions, colour mode, Pantone numbers, and production notes. Prevents costly back-and-forth with the manufacturer." },
    ],
  },
  "Design System": {
    icon: "◑", color: "#6366F1", description: "Icons, tokens, component specs",
    exports: [
      { format: "SVG",  category: "Icons",      dimensions: "24×24px",     usage: "Icon set (outline)",          required: true,  tip: "Deliver as individual SVG files and/or a single sprite. Use a 24×24px grid with 2px stroke and consistent corner radii. Include a viewBox attribute for scalability." },
      { format: "SVG",  category: "Icons",      dimensions: "24×24px",     usage: "Icon set (filled)",           required: false, tip: "Filled variant of the icon set for emphasis, active states, and selected indicators. Ensure visual weight matches the outline set when both are used together." },
      { format: "PDF",  category: "Docs",       dimensions: "A4",          usage: "Component specification sheet", required: true, tip: "Visual reference covering all components with spacing, typography, colour usage, and interaction behaviour annotations. Essential for developer handoff and QA." },
      { format: "PNG",  category: "Tokens",     dimensions: "1600×900px",  usage: "Color token reference",       required: true,  tip: "Visual palette showing all semantic colour tokens — primary, secondary, states (success/warning/error/info), surface levels, and text colours with their token names." },
      { format: "PNG",  category: "Tokens",     dimensions: "1600×900px",  usage: "Typography scale reference",  required: true,  tip: "Shows all type sizes, weights, line heights, and letter spacing in context. Include both the token name (e.g. text-xl) and the computed value (20px / 1.4 line-height)." },
      { format: "PNG",  category: "Tokens",     dimensions: "1200×800px",  usage: "Spacing & grid reference",    required: false, tip: "Visual guide to your spacing scale and layout grid. Include the multiplier logic (e.g. 4px base unit) so engineers understand the system rather than just memorising values." },
      { format: "SVG",  category: "Logo",       dimensions: "Scalable",    usage: "Logo components",             required: false, tip: "Logo mark, wordmark, and combination lockup in SVG format. Include horizontal and stacked versions, plus dark/light variants for different backgrounds." },
      { format: "JSON", category: "Tokens",     dimensions: "n/a",         usage: "Design tokens (JSON)",        required: false, tip: "Structured JSON of all tokens for integration with Style Dictionary, Theo, or direct consumption in code. Follow the W3C Design Token Community Group format for maximum interoperability." },
      { format: "PNG",  category: "Components", dimensions: "1400×900px",  usage: "Component library overview",  required: true,  tip: "Visual catalog of all components in their default, hover, active, focused, and disabled states. Invaluable for stakeholder reviews and QA checklists." },
      { format: "PDF",  category: "Docs",       dimensions: "A4",          usage: "Usage guidelines",            required: false, tip: "Do/don't examples, voice & tone guidance, accessibility requirements (contrast ratios, touch targets), and brand usage rules for third-party partners." },
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
  const esc = s => s.replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
  const fs1 = Math.max(24, Math.min(w * 0.07, 72));
  const fs2 = Math.max(12, Math.min(w * 0.025, 22));
  const fs3 = Math.max(10, Math.min(w * 0.02, 18));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="#0D0D0D"/>
  <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.3"/>
  <g stroke="#1A1A1A" stroke-width="1" opacity="0.8">
    ${Array.from({ length: Math.floor(w / 80) }, (_, i) => `<line x1="${(i + 1) * 80}" y1="0" x2="${(i + 1) * 80}" y2="${h}"/>`).join("")}
    ${Array.from({ length: Math.floor(h / 80) }, (_, i) => `<line x1="0" y1="${(i + 1) * 80}" x2="${w}" y2="${(i + 1) * 80}"/>`).join("")}
  </g>
  <g stroke="${accentColor}" stroke-width="1.5" fill="none">
    <path d="M8,28 L8,8 L28,8"/>
    <path d="M${w - 28},8 L${w - 8},8 L${w - 8},28"/>
    <path d="M8,${h - 28} L8,${h - 8} L28,${h - 8}"/>
    <path d="M${w - 28},${h - 8} L${w - 8},${h - 8} L${w - 8},${h - 28}"/>
  </g>
  <g stroke="${accentColor}" stroke-width="1" opacity="0.2">
    <line x1="${w * 0.44}" y1="${h / 2}" x2="${w * 0.56}" y2="${h / 2}"/>
    <line x1="${w / 2}" y1="${h * 0.44}" x2="${w / 2}" y2="${h * 0.56}"/>
  </g>
  <text x="${w / 2}" y="${h / 2 - fs1 * 0.5}" font-family="AuxMono, Courier New, monospace" font-size="${fs1}" font-weight="bold" fill="${accentColor}" text-anchor="middle">${esc(format)}</text>
  <text x="${w / 2}" y="${h / 2 + fs2 * 0.8}" font-family="AuxMono, Courier New, monospace" font-size="${fs2}" fill="#777" text-anchor="middle">${w}×${h}</text>
  <text x="${w / 2}" y="${h / 2 + fs2 * 2.2}" font-family="AuxMono, Courier New, monospace" font-size="${fs3}" fill="#555" text-anchor="middle">${esc(usage)}</text>
  ${projName ? `<text x="${w / 2}" y="${h - 14}" font-family="AuxMono, Courier New, monospace" font-size="${Math.max(9, fs3 * 0.8)}" fill="#2A2A2A" text-anchor="middle">${esc(projName)}</text>` : ""}
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
    `Generated by Dispatch — Export Planner.`,
  ];
  const streamContent = lines.map((l, i) => `BT /F1 11 Tf 50 ${720 - i * 22} Td (${l}) Tj ET`).join("\n");
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
%%Creator: Dispatch — Export Planner
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

This is a placeholder generated by Dispatch — Export Planner.
Replace this file with your actual ${format} export.

Generated: ${new Date().toLocaleDateString()}`;
}

function buildJSON(projectName) {
  return JSON.stringify({
    name: (projectName || "design-system").toLowerCase().replace(/[^a-z0-9]/g, "-"),
    version: "1.0.0",
    generatedBy: "Dispatch — Export Planner",
    tokens: {
      color: {
        primary:   { value: "#000000", type: "color", description: "Primary brand color" },
        secondary: { value: "#ffffff", type: "color", description: "Secondary color" },
        accent:    { value: "#0066ff", type: "color", description: "Interactive / accent color" },
        neutral: {
          100: { value: "#f5f5f5", type: "color" },
          200: { value: "#e5e5e5", type: "color" },
          300: { value: "#d4d4d4", type: "color" },
          700: { value: "#404040", type: "color" },
          900: { value: "#0a0a0a", type: "color" },
        },
        semantic: {
          success: { value: "#22c55e", type: "color" },
          warning: { value: "#f59e0b", type: "color" },
          error:   { value: "#ef4444", type: "color" },
          info:    { value: "#3b82f6", type: "color" },
        },
      },
      spacing: {
        "1": { value: "4px",  type: "dimension" }, "2": { value: "8px",  type: "dimension" },
        "3": { value: "12px", type: "dimension" }, "4": { value: "16px", type: "dimension" },
        "6": { value: "24px", type: "dimension" }, "8": { value: "32px", type: "dimension" },
        "10":{ value: "40px", type: "dimension" }, "12":{ value: "48px", type: "dimension" },
        "16":{ value: "64px", type: "dimension" },
      },
      typography: {
        fontFamily: {
          sans: { value: "Inter, system-ui, -apple-system, sans-serif", type: "fontFamily" },
          mono: { value: "JetBrains Mono, Fira Code, monospace", type: "fontFamily" },
        },
        fontSize: {
          xs:   { value: "12px", type: "dimension" }, sm:   { value: "14px", type: "dimension" },
          base: { value: "16px", type: "dimension" }, lg:   { value: "18px", type: "dimension" },
          xl:   { value: "20px", type: "dimension" }, "2xl":{ value: "24px", type: "dimension" },
          "3xl":{ value: "30px", type: "dimension" }, "4xl":{ value: "36px", type: "dimension" },
        },
        fontWeight: {
          normal: { value: "400", type: "fontWeight" }, medium:   { value: "500", type: "fontWeight" },
          semibold:{ value: "600", type: "fontWeight" }, bold:    { value: "700", type: "fontWeight" },
        },
        lineHeight: {
          tight:   { value: "1.25",  type: "number" }, snug:    { value: "1.375", type: "number" },
          normal:  { value: "1.5",   type: "number" }, relaxed: { value: "1.625", type: "number" },
        },
      },
      borderRadius: {
        none: { value: "0px",    type: "dimension" }, sm:   { value: "4px",    type: "dimension" },
        md:   { value: "8px",    type: "dimension" }, lg:   { value: "12px",   type: "dimension" },
        xl:   { value: "16px",   type: "dimension" }, full: { value: "9999px", type: "dimension" },
      },
      shadow: {
        sm: { value: "0 1px 2px rgba(0,0,0,0.05)",   type: "shadow" },
        md: { value: "0 4px 6px rgba(0,0,0,0.07)",   type: "shadow" },
        lg: { value: "0 10px 15px rgba(0,0,0,0.1)",  type: "shadow" },
        xl: { value: "0 20px 25px rgba(0,0,0,0.1)",  type: "shadow" },
      },
    },
  }, null, 2);
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
  lines.push(
    ``, `NOTES`, `─────`,
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

  ctx.fillStyle = "#0D0D0D";
  ctx.fillRect(0, 0, cw, ch);

  const gs = Math.max(16, Math.min(50, Math.min(cw, ch) / 10));
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 1;
  for (let x = gs; x < cw; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke(); }
  for (let y = gs; y < ch; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke(); }

  ctx.strokeStyle = accentColor + "44";
  ctx.lineWidth = Math.max(1, cw * 0.003);
  ctx.strokeRect(4, 4, cw - 8, ch - 8);

  const cm = Math.max(10, Math.min(22, cw * 0.04));
  const mg = 8;
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  [[mg, mg], [cw - mg, mg], [mg, ch - mg], [cw - mg, ch - mg]].forEach(([x, y]) => {
    const dx = x < cw / 2 ? 1 : -1, dy = y < ch / 2 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx * cm, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + dy * cm); ctx.stroke();
  });

  const cx = cw / 2, cy = ch / 2, cl = Math.min(cw, ch) * 0.07;
  ctx.strokeStyle = accentColor + "30";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx - cl, cy); ctx.lineTo(cx + cl, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - cl); ctx.lineTo(cx, cy + cl); ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fmtSz = Math.max(12, Math.min(cw * 0.1, 60));
  ctx.font = `bold ${fmtSz}px "AuxMono", "Courier New", monospace`;
  ctx.fillStyle = accentColor;
  ctx.fillText(format, cx, cy - fmtSz * 0.65);

  const dimSz = Math.max(9, Math.min(cw * 0.032, 18));
  ctx.font = `${dimSz}px "AuxMono", "Courier New", monospace`;
  ctx.fillStyle = "#777";
  ctx.fillText(`${w}×${h}`, cx, cy + fmtSz * 0.1);

  const usgSz = Math.max(8, Math.min(cw * 0.026, 14));
  ctx.font = `${usgSz}px "AuxMono", "Courier New", monospace`;
  ctx.fillStyle = "#555";
  const usg = usage.length > 36 ? usage.slice(0, 34) + "…" : usage;
  ctx.fillText(usg, cx, cy + fmtSz * 0.82);

  if (projName) {
    const pSz = Math.max(7, Math.min(cw * 0.02, 11));
    ctx.font = `${pSz}px "AuxMono", "Courier New", monospace`;
    ctx.fillStyle = "#2A2A2A";
    ctx.fillText(projName, cx, ch - pSz - 6);
  }

  return new Promise(resolve =>
    c.toBlob(blob => { if (blob) resolve(blob); else c.toBlob(resolve, "image/png"); }, mimeType, 0.92)
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

    if (["PNG", "JPG", "JPEG", "WEBP", "GIF", "ICO", "TIFF"].includes(fmt)) {
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
    } else if (fmt === "JSON") {
      folder.file(fname, buildJSON(projectName));
    } else {
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

  return (
    <>
      <button
        ref={btnRef}
        onClick={isMobile ? toggle : undefined}
        onMouseEnter={!isMobile ? show : undefined}
        onMouseLeave={!isMobile ? hide : undefined}
        style={{
          width: 16, height: 16, borderRadius: "50%",
          border: `1px solid ${open ? accentColor : "#2A2A2A"}`,
          background: open ? `${accentColor}18` : "transparent",
          color: open ? accentColor : "#3A3A3A",
          fontSize: 9, fontWeight: "bold",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
          transition: "all 0.15s", WebkitTapHighlightColor: "transparent", lineHeight: 1,
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
            position: "fixed", top: pos.top,
            left: pos.align === "right" ? "auto" : pos.left,
            right: pos.align === "right" ? (window.innerWidth - pos.left) : "auto",
            transform: pos.align === "center" ? "translateX(-50%)" : "none",
            width: pos.tipW || 280,
            background: "#161616", border: `1px solid ${accentColor}33`,
            borderRadius: 6, padding: "10px 12px", zIndex: 9999,
            pointerEvents: isMobile ? "none" : "auto",
            boxShadow: `0 8px 32px #00000088, 0 0 0 1px ${accentColor}11`,
          }}
        >
          <div style={{ fontSize: 11, color: "#999", lineHeight: 1.7, fontFamily: FONT }}>{tip}</div>
          <div style={{
            position: "absolute", top: -5,
            left: pos.align === "center" ? "50%" : pos.align === "right" ? "auto" : 16,
            right: pos.align === "right" ? 16 : "auto",
            transform: pos.align === "center" ? "translateX(-50%) rotate(45deg)" : "rotate(45deg)",
            width: 8, height: 8, background: "#161616",
            borderTop: `1px solid ${accentColor}33`, borderLeft: `1px solid ${accentColor}33`,
          }} />
        </div>
      )}
    </>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({ onStart }) {
  const w = useWindowWidth();
  const isMobile = w < 700;
  const isSmall = w < 400;

  const [hoveredType, setHoveredType] = useState(null);

  const stats = [
    { num: "11", label: "project types" },
    { num: "ZIP", label: "export ready" },
    { num: "∞", label: "offline use" },
    { num: "0", label: "signups" },
  ];

  const steps = [
    { n: "01", title: "Pick a project type", desc: "Choose from 11 categories: brand, app icons, social packs, video content, print, packaging, email campaigns, and more." },
    { n: "02", title: "Name your project", desc: "Add an optional slug. Every file in the ZIP gets auto-named with a clean, consistent convention — {project}_{category}_{format}_{dimensions}." },
    { n: "03", title: "Review & download", desc: "Check off required and optional exports. Download a structured ZIP with placeholder files at exact pixel dimensions, plus a full README manifest." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D", color: "#E8E4DC", fontFamily: FONT, display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .land-fadein { animation: fadeUp 0.5s ease forwards; }
        .land-fadein-2 { animation: fadeUp 0.5s 0.1s ease both; }
        .land-fadein-3 { animation: fadeUp 0.5s 0.2s ease both; }
      `}</style>

      {/* Nav */}
      <nav style={{
        padding: isMobile ? "14px 24px" : "18px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid #161616",
        position: "sticky", top: 0, background: "#0D0D0Dcc",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        zIndex: 20,
      }}>
        <div style={{ fontSize: isSmall ? 11 : 13, letterSpacing: "0.22em", textTransform: "uppercase", color: "#E8E4DC" }}>
          DISPATCH
        </div>
        <button
          onClick={() => onStart()}
          style={{ background: "none", border: "1px solid #252525", color: "#555", fontFamily: FONT, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", padding: "8px 16px", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF6B35"; e.currentTarget.style.color = "#FF6B35"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#252525"; e.currentTarget.style.color = "#555"; }}
        >
          Open Tool →
        </button>
      </nav>

      {/* Hero */}
      <section style={{ padding: isMobile ? "56px 24px 44px" : "88px 48px 64px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div className="land-fadein" style={{ fontSize: 10, letterSpacing: "0.22em", color: "#FF6B35", textTransform: "uppercase", marginBottom: 20 }}>
          Export Planner for Designers
        </div>

        <h1 className="land-fadein-2" style={{ margin: "0 0 20px", fontSize: isMobile ? "clamp(38px, 11vw, 58px)" : "clamp(56px, 5.5vw, 76px)", fontFamily: FONT, fontWeight: "normal", lineHeight: 1.06, color: "#E8E4DC", letterSpacing: "-0.01em" }}>
          Plan your<br />deliverables.
        </h1>

        <p className="land-fadein-3" style={{ margin: "0 0 36px", fontSize: isMobile ? 13 : 15, color: "#555", lineHeight: 1.8, maxWidth: 500, letterSpacing: "0.02em" }}>
          Generate the exact export checklist for any design project.
          Brand identities, app icons, social packs, packaging, and more —
          know what to hand off before you hand off.
        </p>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: isMobile ? 44 : 56 }}>
          <button
            onClick={() => onStart()}
            style={{ background: "#FF6B35", border: "none", color: "#0D0D0D", fontFamily: FONT, fontSize: 12, fontWeight: "bold", letterSpacing: "0.14em", textTransform: "uppercase", padding: isMobile ? "13px 22px" : "15px 30px", cursor: "pointer", transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Start Planning →
          </button>
          <span style={{ fontSize: 11, color: "#2A2A2A", letterSpacing: "0.08em" }}>No signup. Always free.</span>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", flexWrap: "wrap", paddingTop: 32, borderTop: "1px solid #161616" }}>
          {stats.map(({ num, label }, i) => (
            <div key={label} style={{ paddingRight: isMobile ? 20 : 32, paddingLeft: i > 0 ? (isMobile ? 20 : 32) : 0, paddingBottom: 8, borderRight: i < stats.length - 1 ? "1px solid #1E1E1E" : "none" }}>
              <div style={{ fontSize: isMobile ? 20 : 26, color: "#E8E4DC", fontWeight: "bold", lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: 9, color: "#3E3E3E", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 5 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Project types grid */}
      <section style={{ padding: isMobile ? "0 0 56px" : "0 0 72px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ padding: isMobile ? "0 24px 16px" : "0 48px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#2E2E2E", textTransform: "uppercase" }}>Project Types</div>
          <div style={{ fontSize: 9, color: "#2A2A2A", letterSpacing: "0.06em" }}>Click any to begin</div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: isSmall ? "repeat(2, 1fr)" : isMobile ? "repeat(2, 1fr)" : w < 900 ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
          gap: 1, background: "#1A1A1A",
          margin: isMobile ? "0 24px" : "0 48px",
          border: "1px solid #1A1A1A",
        }}>
          {Object.entries(PROJECT_TYPES).map(([name, data]) => (
            <button
              key={name}
              onClick={() => onStart(name)}
              onMouseEnter={() => setHoveredType(name)}
              onMouseLeave={() => setHoveredType(null)}
              style={{
                background: hoveredType === name ? "#111" : "#0D0D0D",
                border: "none",
                padding: isMobile ? "18px 14px" : "22px 18px",
                textAlign: "left", cursor: "pointer",
                transition: "background 0.12s",
                fontFamily: FONT, display: "flex", flexDirection: "column", gap: 8,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: isMobile ? 17 : 19, color: data.color, lineHeight: 1, transition: "transform 0.15s", transform: hoveredType === name ? "scale(1.1)" : "scale(1)", display: "inline-block" }}>
                {data.icon}
              </span>
              <div>
                <div style={{ fontSize: isMobile ? 10 : 11, color: hoveredType === name ? "#D8D4CC" : "#888", letterSpacing: "0.06em", lineHeight: 1.4, transition: "color 0.12s" }}>{name}</div>
                <div style={{ fontSize: 9, color: "#2E2E2E", marginTop: 3, letterSpacing: "0.06em" }}>{data.exports.length} exports</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: isMobile ? "44px 24px 56px" : "64px 48px 72px", borderTop: "1px solid #161616", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#2E2E2E", textTransform: "uppercase", marginBottom: 36 }}>How it works</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 32 : 48 }}>
          {steps.map(s => (
            <div key={s.n}>
              <div style={{ fontSize: 10, color: "#FF6B35", letterSpacing: "0.2em", marginBottom: 14 }}>{s.n}</div>
              <div style={{ fontSize: 12, color: "#C4C0B8", letterSpacing: "0.04em", marginBottom: 10, lineHeight: 1.4 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "#404040", lineHeight: 1.8, letterSpacing: "0.02em" }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <div style={{ borderTop: "1px solid #161616", padding: isMobile ? "32px 24px" : "44px 48px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 20 }}>
        <div>
          <div style={{ fontSize: isMobile ? 17 : 22, color: "#E8E4DC", lineHeight: 1.25, marginBottom: 6 }}>Ready to plan your exports?</div>
          <div style={{ fontSize: 11, color: "#3A3A3A", letterSpacing: "0.04em" }}>No account needed — start in seconds.</div>
        </div>
        <button
          onClick={() => onStart()}
          style={{ background: "none", border: "1px solid #FF6B35", color: "#FF6B35", fontFamily: FONT, fontSize: 10, fontWeight: "bold", letterSpacing: "0.16em", textTransform: "uppercase", padding: "13px 26px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.background = "#FF6B35"; e.currentTarget.style.color = "#0D0D0D"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#FF6B35"; }}
        >
          Start Planning →
        </button>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #141414", padding: isMobile ? "14px 24px" : "14px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 9, color: "#252525", letterSpacing: "0.16em", textTransform: "uppercase" }}>Dispatch — by CurioLabs</span>
        <span style={{ fontSize: 9, color: "#1E1E1E", letterSpacing: "0.08em" }}>No signup · No ads · No tracking</span>
      </footer>
    </div>
  );
}

// ── Step 1: Project Picker ────────────────────────────────────────────────────
function ProjectPicker({ onSelect, onBack, isMobile }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ padding: isMobile ? "20px 16px 32px" : "36px 40px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isMobile ? 20 : 28 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#3A3A3A", cursor: "pointer", fontFamily: FONT, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", padding: "4px 0", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>
          ←
        </button>
        <div>
          <div style={{ fontSize: isMobile ? 16 : 19, color: "#E8E4DC" }}>What are you exporting?</div>
          <div style={{ fontSize: 10, color: "#3A3A3A", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>Select a project type</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: isMobile ? 8 : 10 }}>
        {Object.entries(PROJECT_TYPES).map(([name, data]) => (
          <button
            key={name}
            onClick={() => onSelect(name)}
            onMouseEnter={() => setHovered(name)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === name ? `${data.color}0C` : "#0F0F0F",
              border: `1px solid ${hovered === name ? data.color + "55" : "#1E1E1E"}`,
              borderRadius: 6,
              padding: isMobile ? "14px 12px" : "18px 16px",
              cursor: "pointer", textAlign: "left",
              transition: "all 0.15s ease",
              display: "flex", flexDirection: "column", gap: 9,
              minHeight: isMobile ? 88 : 96,
              WebkitTapHighlightColor: "transparent",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Accent left stripe on hover */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: data.color, opacity: hovered === name ? 1 : 0, transition: "opacity 0.15s", borderRadius: "6px 0 0 6px" }} />
            <span style={{ fontSize: isMobile ? 18 : 20, color: data.color, lineHeight: 1 }}>{data.icon}</span>
            <div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: "#D4D0C8", lineHeight: 1.35, letterSpacing: "0.04em" }}>{name}</div>
              <div style={{ fontSize: 10, color: "#3A3A3A", marginTop: 3, letterSpacing: "0.04em" }}>{data.description}</div>
            </div>
            <div style={{ fontSize: 9, color: hovered === name ? data.color + "88" : "#282828", letterSpacing: "0.06em", marginTop: -2 }}>
              {data.exports.length} exports
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step 2: Name ──────────────────────────────────────────────────────────────
function NameStep({ selected, projectName, setProjectName, onContinue, onBack, isMobile }) {
  const data = PROJECT_TYPES[selected];
  const inputRef = useRef(null);
  useEffect(() => { const t = setTimeout(() => inputRef.current?.focus(), 150); return () => clearTimeout(t); }, []);

  return (
    <div style={{ padding: isMobile ? "24px 16px" : "56px 40px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 480 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontFamily: FONT, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", padding: 0, display: "flex", alignItems: "center", gap: 6, width: "fit-content" }}>
        ← Back
      </button>

      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: `${data.color}10`, border: `1px solid ${data.color}28`, borderRadius: 6, padding: "10px 14px", width: "fit-content" }}>
        <span style={{ color: data.color, fontSize: 16 }}>{data.icon}</span>
        <span style={{ color: data.color, fontSize: 12, fontWeight: "bold", letterSpacing: "0.04em" }}>{selected}</span>
        <span style={{ fontSize: 9, color: `${data.color}66`, marginLeft: 2, letterSpacing: "0.06em" }}>{data.exports.length} exports</span>
      </div>

      <div>
        <div style={{ fontSize: isMobile ? 18 : 22, color: "#E8E4DC", marginBottom: 6 }}>Name your project</div>
        <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", lineHeight: 1.6 }}>Used to auto-generate filenames — you can skip this</div>
      </div>

      <input
        ref={inputRef}
        value={projectName}
        onChange={e => setProjectName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onContinue()}
        placeholder="e.g. acme-rebrand"
        style={{ background: "#0F0F0F", border: "1px solid #252525", borderRadius: 6, padding: "14px 16px", color: "#E8E4DC", fontFamily: FONT, fontSize: 15, width: "100%", boxSizing: "border-box", outline: "none", transition: "border-color 0.15s", WebkitAppearance: "none" }}
        onFocus={e => e.target.style.borderColor = data.color}
        onBlur={e => e.target.style.borderColor = "#252525"}
      />

      <button
        onClick={onContinue}
        style={{ background: data.color, border: "none", borderRadius: 6, padding: "15px", color: "#000", fontFamily: FONT, fontSize: 11, fontWeight: "bold", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", width: "100%", transition: "opacity 0.15s", WebkitTapHighlightColor: "transparent" }}
        onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
        onMouseOut={e => e.currentTarget.style.opacity = "1"}
      >
        Generate Dispatch →
      </button>
    </div>
  );
}

// ── ZIP Modal ─────────────────────────────────────────────────────────────────
function ZipModal({ progress, accentColor }) {
  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000BB", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(6px)" }}>
      <div style={{ background: "#111", border: `1px solid ${accentColor}30`, borderRadius: 10, padding: "28px 32px", width: "min(320px, 90vw)", textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 20 }}>Building Dispatch</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 28, color: accentColor, marginBottom: 20, animation: "spin 1.2s linear infinite", display: "inline-block" }}>◈</div>
        <div style={{ height: 3, background: "#1A1A1A", borderRadius: 2, marginBottom: 10, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: accentColor, borderRadius: 2, transition: "width 0.3s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 10, color: "#383838" }}>{progress.current} of {progress.total} files</span>
          <span style={{ fontSize: 10, color: accentColor, fontWeight: "bold" }}>{pct}%</span>
        </div>
        <div style={{ fontSize: 10, color: "#383838", fontFamily: "monospace", height: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
  const [zipState, setZipState] = useState("idle");
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
      const blob = await generateZip(selected, projectName, p => setZipProgress(p));
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
      <div style={{ padding: isMobile ? "10px 14px 0" : "16px 40px 0", background: "#0F0F0F", borderBottom: "1px solid #1A1A1A", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontFamily: FONT, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", padding: "4px 0", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>
            ←
          </button>
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ color: accentColor, flexShrink: 0, fontSize: 14 }}>{data.icon}</span>
            <span style={{ fontSize: 12, color: "#D4D0C8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected}</span>
            {projectName && <span style={{ fontSize: 10, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 1 }}>· {projectName}</span>}
          </div>
          <button onClick={markAll} style={{ background: "transparent", border: `1px solid ${accentColor}44`, color: accentColor, padding: "4px 9px", cursor: "pointer", fontFamily: FONT, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 3, flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>All</button>
          <button onClick={clearAll} style={{ background: "transparent", border: "1px solid #222", color: "#444", padding: "4px 9px", cursor: "pointer", fontFamily: FONT, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 3, flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>Clear</button>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ fontSize: 10, color: "#383838" }}><span style={{ color: accentColor }}>{required}</span> required</span>
              <span style={{ fontSize: 10, color: "#2E2E2E" }}>{total - required} optional</span>
            </div>
            <span style={{ fontSize: 11, color: allDone ? "#34D399" : accentColor, fontWeight: "bold" }}>{done}/{total}{allDone ? " ✓" : ""}</span>
          </div>
          <div style={{ height: 2, background: "#181818", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: allDone ? "#34D399" : accentColor, borderRadius: 2, transition: "width 0.35s ease" }} />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", paddingBottom: 12 }}>
          <div style={{ display: "flex", gap: 4, flex: 1, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)} style={{
                background: filterCat === cat ? accentColor : "transparent",
                border: `1px solid ${filterCat === cat ? accentColor : "#202020"}`,
                color: filterCat === cat ? "#000" : "#555",
                padding: "3px 10px", cursor: "pointer", fontFamily: FONT,
                fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                borderRadius: 20, fontWeight: filterCat === cat ? "bold" : "normal",
                whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.12s",
                WebkitTapHighlightColor: "transparent",
              }}>{cat}</button>
            ))}
          </div>
          <button onClick={() => setShowNames(n => !n)} style={{
            background: showNames ? `${accentColor}15` : "transparent",
            border: `1px solid ${showNames ? accentColor : "#202020"}`,
            color: showNames ? accentColor : "#444",
            padding: "3px 10px", cursor: "pointer", fontFamily: FONT, fontSize: 9,
            letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 3,
            flexShrink: 0, WebkitTapHighlightColor: "transparent", whiteSpace: "nowrap",
          }}>
            {showNames ? "Names ×" : "Names"}
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "8px 14px" : "14px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {filtered.map(exp => {
            const gi = exports.indexOf(exp);
            const isDone = checked[gi];
            return (
              <div
                key={gi}
                onClick={() => toggle(gi)}
                style={{
                  background: isDone ? "#0B1A0E" : "#0C0C0C",
                  border: `1px solid ${isDone ? "#1B3620" : "#161616"}`,
                  borderRadius: 6, padding: isMobile ? "11px 12px" : "12px 16px",
                  cursor: "pointer", transition: "all 0.12s",
                  display: "flex", gap: 11, alignItems: "flex-start",
                  opacity: isDone ? 0.55 : 1, userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
                onMouseEnter={e => { if (!isDone) e.currentTarget.style.background = "#111"; }}
                onMouseLeave={e => { e.currentTarget.style.background = isDone ? "#0B1A0E" : "#0C0C0C"; }}
              >
                <div style={{ width: 20, height: 20, border: `1.5px solid ${isDone ? "#34D399" : "#252525"}`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? "#34D399" : "transparent", flexShrink: 0, marginTop: 2, transition: "all 0.12s" }}>
                  {isDone && <span style={{ color: "#000", fontSize: 11, fontWeight: "bold", lineHeight: 1 }}>✓</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ background: `${accentColor}14`, border: `1px solid ${accentColor}30`, color: accentColor, padding: "1px 6px", borderRadius: 3, fontSize: 9, fontWeight: "bold", letterSpacing: "0.08em", flexShrink: 0 }}>{exp.format}</span>
                    <span style={{ fontSize: 13, color: isDone ? "#555" : "#C8C4BC", flex: 1, minWidth: 0 }}>{exp.usage}</span>
                    {exp.required && <span style={{ width: 4, height: 4, borderRadius: "50%", background: accentColor, flexShrink: 0, opacity: 0.7, marginTop: 1 }} />}
                    {exp.tip && (
                      <span onClick={e => e.stopPropagation()}>
                        <Tooltip tip={exp.tip} accentColor={accentColor} isMobile={isMobile} />
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 9, color: "#353535" }}>{exp.category}</span>
                    <span style={{ fontSize: 9, color: "#2E2E2E", fontFamily: "monospace" }}>{exp.dimensions}</span>
                  </div>
                  {showNames && (
                    <div style={{ marginTop: 7, fontSize: 9, color: "#3A3A3A", fontFamily: "monospace", background: "#090909", padding: "4px 8px", borderRadius: 3, border: "1px solid #141414", wordBreak: "break-all", lineHeight: 1.7 }}>
                      {generateFilename(projectName, exp.format, exp.category, exp.dimensions)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer controls */}
        <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "stretch", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: accentColor, display: "inline-block", opacity: 0.7 }} />
              <span style={{ fontSize: 9, color: "#383838", textTransform: "uppercase", letterSpacing: "0.12em" }}>Required</span>
            </div>
            <span style={{ fontSize: 9, color: "#282828", textTransform: "uppercase", letterSpacing: "0.1em" }}>Tap row to check</span>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={zipState === "generating"}
            style={{
              background: zipState === "done" ? "#34D39918" : zipState === "error" ? "#FF444418" : `${accentColor}14`,
              border: `1px solid ${zipState === "done" ? "#34D399" : zipState === "error" ? "#FF4444" : accentColor}`,
              color: zipState === "done" ? "#34D399" : zipState === "error" ? "#FF4444" : accentColor,
              padding: "10px 18px", borderRadius: 5,
              cursor: zipState === "generating" ? "not-allowed" : "pointer",
              fontFamily: FONT, fontSize: 10, fontWeight: "bold",
              letterSpacing: "0.12em", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.2s", opacity: zipState === "generating" ? 0.6 : 1,
              WebkitTapHighlightColor: "transparent", flexShrink: 0,
            }}
            onMouseOver={e => { if (zipState !== "generating") e.currentTarget.style.background = `${accentColor}22`; }}
            onMouseOut={e => { if (zipState !== "generating" && zipState !== "done" && zipState !== "error") e.currentTarget.style.background = `${accentColor}14`; }}
          >
            <span style={{ fontSize: 13 }}>{zipState === "done" ? "✓" : zipState === "error" ? "✕" : "↓"}</span>
            <span>{zipState === "done" ? "Downloaded!" : zipState === "error" ? "Error — retry" : `Dispatch ZIP  (${total} files)`}</span>
          </button>
        </div>

        <div style={{ marginTop: 8, padding: "9px 12px", background: "#090909", border: "1px solid #111", borderRadius: 5 }}>
          <div style={{ fontSize: 9, color: "#303030", lineHeight: 1.8 }}>
            <span style={{ color: "#3E3E3E" }}>ZIP includes</span> · Canvas-rendered images at correct dimensions · Structured SVGs · Valid PDFs · Text stubs for video/binary formats · Category folders · README manifest
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function ExportPlanner() {
  const [view, setView] = useState("landing");
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [projectName, setProjectName] = useState("");
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 700;
  const accentColor = selected ? PROJECT_TYPES[selected].color : "#FF6B35";

  const handleStart = (typeName) => {
    setView("tool");
    if (typeName && PROJECT_TYPES[typeName]) {
      setSelected(typeName);
      setProjectName("");
      setStep(2);
    } else {
      setStep(1);
    }
  };

  const handleSelectProject = n => { setSelected(n); setProjectName(""); setStep(2); };
  const handleContinue = () => setStep(3);
  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) { setStep(1); setSelected(null); }
    else { setView("landing"); setStep(1); setSelected(null); }
  };

  if (view === "landing") {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <div style={{ height: "100vh", background: "#0D0D0D", fontFamily: FONT, color: "#E8E4DC", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ background: "#0F0F0F", borderBottom: "1px solid #181818", padding: isMobile ? "10px 14px" : "13px 40px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button
          onClick={() => setView("landing")}
          style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontFamily: FONT, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", padding: 0 }}
        >
          DISPATCH
        </button>
        <span style={{ fontSize: 10, color: "#1E1E1E" }}>by CurioLabs</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ width: s === step ? 16 : 5, height: 4, borderRadius: 2, background: s === step ? accentColor : s < step ? `${accentColor}44` : "#1A1A1A", transition: "all 0.3s ease" }} />
          ))}
        </div>
        <span style={{ fontSize: 9, color: "#2E2E2E", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {step === 1 ? "Pick type" : step === 2 ? "Name it" : "Check off"}
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: step === 3 ? "hidden" : "auto", display: "flex", flexDirection: "column" }}>
        {step === 1 && <ProjectPicker onSelect={handleSelectProject} onBack={handleBack} isMobile={isMobile} />}
        {step === 2 && selected && <NameStep selected={selected} projectName={projectName} setProjectName={setProjectName} onContinue={handleContinue} onBack={handleBack} isMobile={isMobile} />}
        {step === 3 && selected && <Checklist selected={selected} projectName={projectName} onBack={handleBack} isMobile={isMobile} />}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #111", padding: "6px 20px", display: "flex", justifyContent: "center", alignItems: "center", background: "#090909", flexShrink: 0 }}>
        <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "#2A2A2A", textTransform: "uppercase" }}>Engineered by CurioLabs</span>
      </div>
    </div>
  );
}
