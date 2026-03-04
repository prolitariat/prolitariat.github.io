# Pendo Health Check — Chrome Extension

A browser extension that inspects the current tab and runs diagnostics against the Pendo agent, displaying results in a clean popup UI.

## File Structure

```
pendo-health-check/
├── manifest.json      # Manifest V3 configuration
├── popup.html         # Extension popup UI (inline CSS)
├── popup.js           # UI logic + injected health check function
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
3. The popup will run all diagnostics and display results

**Testing "Pendo not detected":**
- Visit any page without Pendo (e.g., `https://example.com`)
- The popup will show the "Pendo Not Detected" state

**Testing restricted pages:**
- Visit `chrome://extensions` or the Chrome Web Store
- The popup will show the "Unable to run checks" error state

## Checks Performed

| # | Check | Pass | Warn | Fail |
|---|-------|------|------|------|
| 1 | **Pendo Agent Loaded** | `window.pendo` exists | — | Not present |
| 2 | **Pendo Ready** | `isReady()` returns true | Returns false (still initializing) | Error calling method |
| 3 | **Visitor ID** | Non-anonymous ID present | Anonymous ID (`VISITOR-*` or `_PENDO_T_*`) | No ID found |
| 4 | **Account ID** | Account ID present | Not found | Error reading |
| 5 | **Visitor Metadata** | Fields accessible | Empty or unavailable | — |
| 6 | **Active Guides** | Guides array loaded | Not available | — |
| 7 | **Pendo Instances** | Single instance | Multiple objects or script tags | — |
| 8 | **Agent Version** | Version string found | Cannot determine | — |
| 9 | **API Key** | Key found | Cannot determine | — |
| 10 | **Data Host** | Host detected (default or CNAME) | Cannot determine | — |

## How to Add New Checks

All health checks live in the `runPendoHealthCheck()` function at the bottom of `popup.js`. This function runs in the page's main world (via `chrome.scripting.executeScript` with `world: "MAIN"`), so it has direct access to `window.pendo`.

To add a new check:

1. Open `popup.js`
2. Find the `runPendoHealthCheck()` function
3. Add your check using the `add()` helper:

```js
// Example: check if Feature Flags are enabled
try {
  const flags = pendo.featureFlags;
  if (flags && Object.keys(flags).length > 0) {
    add("pass", "Feature Flags", `${Object.keys(flags).length} flag(s) active`);
  } else {
    add("warn", "Feature Flags", "No feature flags detected");
  }
} catch (e) {
  add("fail", "Feature Flags", "Error: " + e.message);
}
```

The `add(status, label, detail)` function accepts:
- **status**: `"pass"`, `"warn"`, or `"fail"`
- **label**: Short name shown in the UI
- **detail**: Description or value shown below the label

The check will automatically appear in the popup and be included in the "Copy Results" output.

## Architecture Notes

- **No content script relay needed.** The popup uses `chrome.scripting.executeScript` with `world: "MAIN"` to inject the health check function directly into the page context, giving it access to `window.pendo`.
- **No external dependencies.** Everything is vanilla JS with inline CSS.
- **Permissions are minimal.** Only `activeTab` (access the current tab when clicked) and `scripting` (inject the check function) are required.

## Permissions

| Permission | Why |
|------------|-----|
| `activeTab` | Access the current tab's URL and inject scripts when the user clicks the extension |
| `scripting` | Use `chrome.scripting.executeScript` to run the health check in the page's main world |
