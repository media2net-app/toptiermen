#!/usr/bin/env node
/**
 * Update all Academy ebook HTML files under public/books/ to:
 * - Inject TTM green/dark layout CSS (non-destructive, additive)
 * - Add sticky back button linking to the specific lesson URL
 *
 * IMPORTANT: Does NOT change the content structure or text of the books.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const BOOKS_DIR = path.join(PUBLIC_DIR, 'books');
const INVENTORY = path.join(ROOT, 'academy-inventory.json');

// Minimal TTM theme + sticky back button styles (safe, additive)
const THEME_STYLE = `
<!-- Injected by update-ebooks-ttm-theme.js -->
<style id="ttm-green-theme">
  :root { color-scheme: dark; }
  body {
    background: linear-gradient(135deg, #0A0F0A 0%, #181F17 50%, #232D1A 100%) !important;
    color: #ffffff !important;
  }
  a { color: #8BAE5A; }
  /* Sticky Back Button */
  .sticky-back-btn {
    position: fixed;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    z-index: 1000;
    background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 14px 18px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(139, 174, 90, 0.3);
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    min-width: 110px;
    justify-content: center;
  }
  .sticky-back-btn:hover {
    background: linear-gradient(135deg, #B6C948 0%, #8BAE5A 100%);
    transform: translateY(-50%) scale(1.05);
    box-shadow: 0 12px 35px rgba(139, 174, 90, 0.4);
  }
  .sticky-back-btn:active { transform: translateY(-50%) scale(0.95); }
  .sticky-back-btn svg { width: 16px; height: 16px; fill: currentColor; }
  @media (max-width: 768px) {
    .sticky-back-btn { right: 10px; padding: 12px 16px; font-size: 12px; min-width: 96px; }
  }
</style>`;

// Sticky button HTML. href will be filled per file.
const backButton = (href) => `
<!-- Injected by update-ebooks-ttm-theme.js -->
<a href="${href}" class="sticky-back-btn" title="Terug naar les">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
  Terug
</a>`;

function loadInventory() {
  const raw = fs.readFileSync(INVENTORY, 'utf8');
  const data = JSON.parse(raw);
  // Build map from HTML ebook path -> { moduleId, lessonId }
  const map = new Map();
  for (const entry of data.modules) {
    const moduleId = entry.module.id;
    for (const lesson of entry.lessons) {
      const ebook = lesson.ebook;
      if (ebook && ebook.file_url && typeof ebook.file_url === 'string') {
        const file = ebook.file_url.trim();
        if (file.endsWith('.html') && file.startsWith('/books/')) {
          map.set(file, { moduleId, lessonId: lesson.id });
        }
      }
    }
  }
  return map;
}

function ensureThemeInHead(html) {
  if (html.includes('id="ttm-green-theme"')) return html; // already injected
  const headEnd = html.indexOf('</head>');
  if (headEnd !== -1) {
    return html.slice(0, headEnd) + '\n' + THEME_STYLE + '\n' + html.slice(headEnd);
  }
  // Fallback: prepend at start
  return THEME_STYLE + '\n' + html;
}

function ensureBackButtonInBody(html, href) {
  if (html.includes('class="sticky-back-btn"')) return html; // already added
  const bodyStart = html.indexOf('<body');
  if (bodyStart !== -1) {
    const bodyOpenEnd = html.indexOf('>', bodyStart);
    if (bodyOpenEnd !== -1) {
      return html.slice(0, bodyOpenEnd + 1) + '\n' + backButton(href) + '\n' + html.slice(bodyOpenEnd + 1);
    }
  }
  // Fallback: append at end
  const bodyEnd = html.indexOf('</body>');
  if (bodyEnd !== -1) {
    return html.slice(0, bodyEnd) + '\n' + backButton(href) + '\n' + html.slice(bodyEnd);
  }
  return html + '\n' + backButton(href) + '\n';
}

function main() {
  if (!fs.existsSync(BOOKS_DIR)) {
    console.error('Books directory not found:', BOOKS_DIR);
    process.exit(1);
  }
  const map = loadInventory();
  let processed = 0, skipped = 0, missing = 0;

  for (const [fileUrl, ids] of map.entries()) {
    const localPath = path.join(PUBLIC_DIR, fileUrl);
    if (!fs.existsSync(localPath)) { missing++; continue; }
    if (!localPath.endsWith('.html')) { skipped++; continue; }

    let html = fs.readFileSync(localPath, 'utf8');

    const lessonHref = `/dashboard/academy/${ids.moduleId}/${ids.lessonId}`;

    const withTheme = ensureThemeInHead(html);
    const withButton = ensureBackButtonInBody(withTheme, lessonHref);

    if (withButton !== html) {
      fs.writeFileSync(localPath, withButton, 'utf8');
      processed++;
    } else {
      skipped++; // Already had theme+button
    }
  }

  console.log(JSON.stringify({ processed, skipped, missing, total: map.size }, null, 2));
}

if (require.main === module) {
  main();
}
