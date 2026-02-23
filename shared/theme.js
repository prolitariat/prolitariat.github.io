// Dark mode: system preference auto-detect + manual toggle + localStorage persistence
(function () {
  // Determine initial theme
  var stored = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = stored || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', theme);

  // Listen for system preference changes (only if no manual override)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('theme')) {
      var t = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', t);
    }
  });

  // Inject dark mode CSS
  var css = document.createElement('style');
  css.textContent = `
    /* ========== DARK MODE OVERRIDES ========== */
    /* Color reference (shadcn Cosmic Night dark palette):
       --foreground: #e2e2f5  (primary text)
       --card-fg:    #e2e2f5  (card text)
       --muted-fg:   #a0a0c0  (secondary/muted text)
       --primary:    #a48fff  (links, accents)
       --border:     #303052  (borders)
       --card-bg:    #1a1a2e  (card backgrounds)
       --bg:         #0f0f1a  (page background)
    */

    /* Transition for smooth theme switching */
    html { transition: background-color 0.3s ease; }
    body { transition: background 0.3s ease, color 0.3s ease; }

    /* ---- Body & page background ---- */
    [data-theme="dark"] body {
      background: linear-gradient(160deg, #0f0f1a 0%, #111827 20%, #1a1025 45%, #0f172a 70%, #150f20 100%) !important;
      color: #e2e2f5 !important;
    }
    [data-theme="dark"] body::before {
      background:
        radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 40% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 50%) !important;
    }

    /* ---- Glass cards ---- */
    [data-theme="dark"] .glass-card {
      background: rgba(26, 26, 46, 0.65) !important;
      border-color: rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3) !important;
      color: #e2e2f5 !important;
    }

    /* Glass card text — comprehensive overrides */
    [data-theme="dark"] .glass-card h2,
    [data-theme="dark"] .glass-card h3,
    [data-theme="dark"] .glass-card h4,
    [data-theme="dark"] .heading-charter {
      color: #f0f0ff !important;
    }
    [data-theme="dark"] .glass-card p,
    [data-theme="dark"] .glass-card span,
    [data-theme="dark"] .glass-card li,
    [data-theme="dark"] .glass-card dd {
      color: #d1d5db !important;
    }
    [data-theme="dark"] .glass-card dt,
    [data-theme="dark"] .glass-card .text-sm {
      color: #a0a0c0 !important;
    }
    [data-theme="dark"] .glass-card a:not(.theme-toggle) {
      color: #a48fff !important;
    }
    [data-theme="dark"] .glass-card a:not(.theme-toggle):hover {
      color: #c4b5fd !important;
    }
    [data-theme="dark"] .glass-card strong {
      color: #f0f0ff !important;
    }

    /* ---- Glass pills (skill tags) ---- */
    [data-theme="dark"] .glass-pill {
      background: rgba(48, 48, 82, 0.6) !important;
      border-color: rgba(164, 143, 255, 0.2) !important;
      color: #c4c2ff !important;
    }

    /* ---- Nav glass ---- */
    [data-theme="dark"] .nav-glass {
      background: rgba(15, 15, 30, 0.85) !important;
      border-bottom-color: rgba(255, 255, 255, 0.06) !important;
    }

    /* ---- Navigation ---- */
    [data-theme="dark"] nav {
      border-color: rgba(255, 255, 255, 0.06) !important;
    }
    [data-theme="dark"] .nav-link:hover {
      background: rgba(255, 255, 255, 0.08) !important;
    }

    /* ---- Hero text (outside glass cards) ---- */
    [data-theme="dark"] .text-lg.font-semibold,
    [data-theme="dark"] .text-xl.font-medium,
    [data-theme="dark"] .text-base.font-medium {
      color: #d1d5db !important;
    }

    /* ---- Tailwind text color overrides ---- */
    [data-theme="dark"] .text-gray-900 { color: #f0f0ff !important; }
    [data-theme="dark"] .text-gray-800 { color: #e2e2f5 !important; }
    [data-theme="dark"] .text-gray-700 { color: #d1d5db !important; }
    [data-theme="dark"] .text-gray-600 { color: #a0a0c0 !important; }
    [data-theme="dark"] .text-gray-500 { color: #a0a0c0 !important; }
    [data-theme="dark"] .text-gray-400 { color: #8888a8 !important; }

    /* ---- Headings with inline color styles ---- */
    [data-theme="dark"] h1[style*="color: #1a1a2e"],
    [data-theme="dark"] h2[style*="color: #1a1a2e"] {
      color: #f0f0ff !important;
    }
    [data-theme="dark"] p[style*="color: #6b7280"] { color: #a0a0c0 !important; }
    [data-theme="dark"] p[style*="color: #9ca3af"] { color: #8888a8 !important; }
    [data-theme="dark"] p[style*="color: #2d2d3a"],
    [data-theme="dark"] article p { color: #d1d5db !important; }
    [data-theme="dark"] article ul,
    [data-theme="dark"] article li { color: #d1d5db !important; }

    /* ---- Article headings (standalone HTML pages) ---- */
    [data-theme="dark"] article h2,
    [data-theme="dark"] .prose h2 {
      color: #f0f0ff !important;
    }
    [data-theme="dark"] article h3,
    [data-theme="dark"] .prose h3 {
      color: #e2e2f5 !important;
    }

    /* ---- Prose typography (blog articles) ---- */
    [data-theme="dark"] .prose p { color: #d1d5db !important; }
    [data-theme="dark"] .prose li { color: #d1d5db !important; }
    [data-theme="dark"] .prose strong { color: #f0f0ff !important; }
    [data-theme="dark"] .prose blockquote {
      color: #a0a0c0 !important;
      border-left-color: rgba(164, 143, 255, 0.5) !important;
    }
    [data-theme="dark"] .prose a {
      color: #a48fff !important;
      text-decoration-color: rgba(164, 143, 255, 0.3) !important;
    }
    [data-theme="dark"] .prose a:hover {
      text-decoration-color: rgba(164, 143, 255, 0.8) !important;
    }

    /* ---- Code blocks ---- */
    [data-theme="dark"] .prose code,
    [data-theme="dark"] article code,
    [data-theme="dark"] code {
      background: rgba(48, 48, 82, 0.5) !important;
      color: #c4b5fd !important;
    }

    /* ---- Stat boxes (portfolio article) ---- */
    [data-theme="dark"] .stat-box {
      background: rgba(26, 26, 46, 0.5) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
    }
    [data-theme="dark"] .stat-number { color: #a48fff !important; }
    [data-theme="dark"] .stat-label { color: #a0a0c0 !important; }

    /* ---- Stats card (shopify article) ---- */
    [data-theme="dark"] .stats-card {
      background: rgba(26, 26, 46, 0.4) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
    }
    [data-theme="dark"] .stats-card dt { color: #a0a0c0 !important; }
    [data-theme="dark"] .stats-card dd { color: #f0f0ff !important; }

    /* ---- Links ---- */
    [data-theme="dark"] a.text-indigo-500,
    [data-theme="dark"] a.text-indigo-600,
    [data-theme="dark"] .text-indigo-500 {
      color: #a48fff !important;
    }
    [data-theme="dark"] a.text-indigo-500:hover,
    [data-theme="dark"] a.text-indigo-600:hover {
      color: #c4b5fd !important;
    }

    /* ---- Music page ---- */
    [data-theme="dark"] .timeline-line {
      background: linear-gradient(to bottom, rgba(164, 143, 255, 0.3), rgba(164, 143, 255, 0.05)) !important;
    }
    [data-theme="dark"] .timeline-dot {
      border-color: rgba(26, 26, 46, 0.8) !important;
      box-shadow: 0 0 0 3px rgba(164, 143, 255, 0.3) !important;
    }
    [data-theme="dark"] .tag-original {
      background: rgba(48, 48, 82, 0.6) !important;
      color: #c4b5fd !important;
      border-color: rgba(164, 143, 255, 0.3) !important;
    }
    [data-theme="dark"] .tag-cover {
      background: rgba(55, 40, 80, 0.6) !important;
      color: #d8b4fe !important;
      border-color: rgba(192, 132, 252, 0.3) !important;
    }
    [data-theme="dark"] audio::-webkit-media-controls-panel {
      background: rgba(48, 48, 82, 0.3) !important;
    }

    /* ---- Section dividers ---- */
    [data-theme="dark"] .section-divider {
      background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.08), transparent) !important;
    }

    /* ---- Subscribe input ---- */
    [data-theme="dark"] .subscribe-input,
    [data-theme="dark"] input[type="email"] {
      background: rgba(26, 26, 46, 0.6) !important;
      border-color: rgba(255, 255, 255, 0.12) !important;
      color: #e2e2f5 !important;
    }
    [data-theme="dark"] .subscribe-input::placeholder,
    [data-theme="dark"] input[type="email"]::placeholder {
      color: #8888a8 !important;
    }

    /* ---- Subscribe button ---- */
    [data-theme="dark"] button.bg-indigo-600,
    [data-theme="dark"] .subscribe-btn,
    [data-theme="dark"] button[type="submit"] {
      background: #6e56cf !important;
      color: #ffffff !important;
    }
    [data-theme="dark"] button.bg-indigo-600:hover {
      background: #5b45b0 !important;
    }

    /* ---- Borders ---- */
    [data-theme="dark"] .border-white\\/40,
    [data-theme="dark"] .border-white\\/30 {
      border-color: rgba(255, 255, 255, 0.06) !important;
    }
    [data-theme="dark"] .border-gray-200 {
      border-color: rgba(255, 255, 255, 0.1) !important;
    }

    /* ---- Post link hover ---- */
    [data-theme="dark"] .post-link:hover {
      background: rgba(255, 255, 255, 0.05) !important;
    }

    /* ---- Background utility overrides ---- */
    [data-theme="dark"] .bg-white {
      background: rgba(26, 26, 46, 0.6) !important;
    }
    [data-theme="dark"] .bg-gray-50 {
      background: rgba(26, 26, 46, 0.4) !important;
    }
    [data-theme="dark"] .bg-indigo-600 {
      background: #6e56cf !important;
    }
    [data-theme="dark"] .bg-indigo-600:hover {
      background: #5b45b0 !important;
    }

    /* ---- Hover states ---- */
    [data-theme="dark"] .hover\\:text-gray-900:hover { color: #f0f0ff !important; }
    [data-theme="dark"] .hover\\:text-indigo-600:hover { color: #a48fff !important; }
    [data-theme="dark"] .hover\\:text-indigo-700:hover { color: #c4b5fd !important; }
    [data-theme="dark"] .hover\\:bg-white\\/50:hover { background: rgba(255,255,255,0.08) !important; }

    /* ---- Analytics section ---- */
    [data-theme="dark"] .analytics-title { color: #f0f0ff !important; }
    [data-theme="dark"] .analytics-subtitle { color: #a0a0c0 !important; }
    [data-theme="dark"] .analytics-section-title { color: #c4c2ff !important; }
    [data-theme="dark"] .analytics-card {
      background: rgba(26, 26, 46, 0.5) !important;
      border-color: rgba(255, 255, 255, 0.08) !important;
    }
    [data-theme="dark"] .analytics-stat { color: #e2e2f5 !important; }
    [data-theme="dark"] .analytics-label { color: #a0a0c0 !important; }
    [data-theme="dark"] .historical-badge {
      background: rgba(48, 48, 82, 0.5) !important;
      color: #a48fff !important;
      border-color: rgba(164, 143, 255, 0.3) !important;
    }
    [data-theme="dark"] .historical-click-category {
      color: #a0a0c0 !important;
    }

    /* ---- Date / meta text (blog) ---- */
    [data-theme="dark"] time,
    [data-theme="dark"] .text-xs.text-gray-400,
    [data-theme="dark"] .mt-3.text-sm {
      color: #8888a8 !important;
    }

    /* ---- Theme toggle button ---- */
    .theme-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
      color: #6b7280;
    }
    .theme-toggle:hover {
      background: rgba(0, 0, 0, 0.06);
    }
    .theme-toggle:focus-visible {
      outline: 2px solid #a48fff;
      outline-offset: 2px;
    }
    [data-theme="dark"] .theme-toggle {
      color: #a0a0c0;
    }
    [data-theme="dark"] .theme-toggle:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    .theme-toggle svg {
      width: 18px;
      height: 18px;
    }
  `;
  document.head.appendChild(css);

  // Inject toggle button once DOM is ready
  function injectToggle() {
    // Find the nav's inner flex container (the one with links)
    var navLinks = document.querySelector('nav .flex.items-center.gap-4, nav .flex.gap-6, nav div.flex');
    if (!navLinks) return;

    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.setAttribute('title', 'Toggle dark mode');

    updateIcon(btn);

    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateIcon(btn);
    });

    navLinks.appendChild(btn);
  }

  function updateIcon(btn) {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      // Sun icon (click to go light)
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>';
      btn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      // Moon icon (click to go dark)
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>';
      btn.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectToggle);
  } else {
    injectToggle();
  }
})();
