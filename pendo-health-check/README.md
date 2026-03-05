# Pendo Health Check — Chrome Extension

A browser extension that inspects the current tab and runs diagnostics against the Pendo agent, displaying results in a clean popup UI. Includes a **Setup Assistant** tab inspired by [pendo-io/ai-setup-assistant](https://github.com/pendo-io/ai-setup-assistant) that provides framework detection, metadata validation, and actionable recommendations.

## File Structure

```
pendo-health-check/
├── manifest.json      # Manifest V3 configuration
├── popup.html         # Extension popup UI (inline CSS, tabbed layout)
├── popup.js           # UI logic + injected health check + setup assistant
├── background.js      # Service worker (lifecycle, future enhancements)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## How to Load as Unpacked Extension

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `pendo-health-check/` directory
5. The extension icon will appear in your toolbar — pin it for easy access

## How to Test

1. Navigate to any page where Pendo is installed (e.g., your app)
2. Click the Pendo Health Check icon in the toolbar
3. The **Health Check** tab runs automatically on open
4. Click the **Setup Assistant** tab for deeper analysis

**Testing "Pendo not detected":**
- Visit any page without Pendo (e.g., `https://example.com`)

**Testing restricted pages:**
- Visit `chrome://extensions` or the Chrome Web Store

## Tab 1: Health Check

Quick pass/warn/fail diagnostics:

| # | Check | Pass | Warn | Fail |
|---|-------|------|------|------|
| 1 | **Pendo Agent Loaded** | `window.pendo` exists | — | Not present |
| 2 | **Pendo Ready** | `isReady()` returns true | Returns false | Error |
| 3 | **Visitor ID** | Non-anonymous ID | Anonymous (`VISITOR-*` / `_PENDO_T_*`) | Missing |
| 4 | **Account ID** | Present | Not found | Error |
| 5 | **Visitor Metadata** | Fields accessible | Empty/unavailable | — |
| 6 | **Active Guides** | Guides loaded | Not available | — |
| 7 | **Pendo Instances** | Single instance | Multiple objects/scripts | — |
| 8 | **Agent Version** | Version found | Cannot determine | — |
| 9 | **API Key** | Key found | Cannot determine | — |
| 10 | **Data Host** | Detected (default or CNAME) | Cannot determine | — |

## Tab 2: Setup Assistant

Deep analysis inspired by [pendo-io/ai-setup-assistant](https://github.com/pendo-io/ai-setup-assistant):

### Framework Detection
Detects the app framework from the running page:
- **React** (+ Next.js detection via `__NEXT_DATA__`)
- **Vue** (+ Nuxt detection via `__NUXT__`)
- **Angular** / AngularJS
- **Svelte**, **Ember**, **jQuery**
- SPA mode detection (root element heuristics)

### Snippet Analysis
- Load method (static agent, bundled, inline snippet, npm/dynamic)
- Async/defer loading status
- Script placement (`<head>` vs `<body>`)
- Script tag count (detects duplicates)

### Initialization Analysis
- Initialization method (`pendo.initialize()` / `pendo.identify()`)
- Timing status (ready vs pending)
- Whether visitor ID and account ID were passed

### Metadata Field Validation
Inspects `pendo.metadata.auto.visitor` and `pendo.metadata.auto.account` fields for:

| Check | Flagged As |
|-------|-----------|
| Sensitive field names (password, token, ssn, etc.) | Error |
| Invalid field name characters | Warning |
| Values exceeding 1024 characters | Warning |
| Null/undefined values | Warning |
| Nested objects (Pendo requires flat data) | Warning |
| Array values | Warning |
| Function values | Warning |

### Recommendations Engine
Generates actionable recommendations with severity levels:

- **Errors**: Anonymous/missing visitor ID, sensitive metadata fields
- **Warnings**: Missing account ID, synchronous loading, duplicate scripts, dual instances, complex metadata values, large payloads (>50KB approaching 64KB limit)
- **Tips**: Framework-specific initialization timing (React `useEffect`, Vue `mounted()`, Angular `AfterViewInit`), outdated agent versions, missing metadata fields

## How to Add New Checks

### Health Check (Tab 1)

All health checks live in `runPendoHealthCheck()` in `popup.js`. Add checks using:

```js
add("pass", "My Check", "Detail text");  // or "warn" or "fail"
```

### Setup Assistant (Tab 2)

Setup analysis lives in `runPendoSetupAssistant()` in `popup.js`. To add:

**New detection section** — add to the result object and render in `renderSetup()`.

**New recommendation** — use the `recommend()` helper:

```js
recommend("warning", "Title", "Detailed explanation and guidance.");
// severity: "error" | "warning" | "tip"
```

**New metadata validation** — add rules in the `validateFields()` function:

```js
if (someCondition) {
  warnings.push("Description of the issue");
}
```

## Architecture Notes

- **Tabbed UI**: Health Check runs on popup open; Setup Assistant runs on first tab switch (lazy-loaded)
- **No content script relay needed.** Both functions use `chrome.scripting.executeScript` with `world: "MAIN"`
- **No external dependencies.** Vanilla JS with inline CSS
- **Permissions are minimal.** Only `activeTab` + `scripting`

## Permissions

| Permission | Why |
|------------|-----|
| `activeTab` | Access the current tab when the user clicks the extension |
| `scripting` | Inject health check and setup assistant into the page's main world |
