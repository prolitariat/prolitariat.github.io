// Pendo Health Check — Background Service Worker
//
// The popup injects the health check directly via chrome.scripting.executeScript
// with world: "MAIN", so no content-script relay is needed for the core flow.
//
// This service worker is available for future enhancements such as:
//  - Badge updates showing pass/fail counts
//  - Context menu actions
//  - Cross-tab result caching
//
// For now it simply logs installation for debugging.

chrome.runtime.onInstalled.addListener(() => {
  console.log("Pendo Health Check extension installed");
});
