const STATUS_ICONS = { pass: "✅", warn: "⚠️", fail: "❌", info: "ℹ️" };

// ---------------------------------------------------------------------------
// View helpers
// ---------------------------------------------------------------------------

function showView(id) {
  ["loading", "not-detected", "error-state"].forEach((v) => {
    document.getElementById(v).style.display = v === id ? "" : "none";
  });
}

function showTabs() {
  document.getElementById("tab-bar").style.display = "flex";
}

function escapeHtml(str) {
  const el = document.createElement("span");
  el.textContent = str;
  return el.innerHTML;
}

// ---------------------------------------------------------------------------
// Tab switching
// ---------------------------------------------------------------------------

let setupLoaded = false;
let activeTabId = null;

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const id = tab.dataset.tab;
    if (id === activeTabId) return;
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    document.getElementById("panel-" + id).classList.add("active");
    activeTabId = id;

    if (id === "setup" && !setupLoaded) {
      setupLoaded = true;
      runSetup();
    }
  });
});

// ---------------------------------------------------------------------------
// Health Check — rendering
// ---------------------------------------------------------------------------

function renderChecks(checks) {
  const list = document.getElementById("checks-list");
  list.innerHTML = "";

  let pass = 0, warn = 0, fail = 0;

  checks.forEach((c) => {
    if (c.status === "pass") pass++;
    else if (c.status === "warn") warn++;
    else fail++;

    const row = document.createElement("div");
    row.className = "check-row";
    row.innerHTML = `
      <span class="check-status">${STATUS_ICONS[c.status]}</span>
      <div class="check-info">
        <div class="check-label">${escapeHtml(c.label)}</div>
        <div class="check-detail">${escapeHtml(c.detail)}</div>
      </div>
    `;
    list.appendChild(row);
  });

  document.getElementById("summary-counts").innerHTML =
    `<span class="pass">${pass} passed</span> · ` +
    `<span class="warn">${warn} warning${warn !== 1 ? "s" : ""}</span> · ` +
    `<span class="fail">${fail} failed</span>`;

  document.getElementById("health-summary").style.display = "flex";
  showView("__none__");
  showTabs();
}

// ---------------------------------------------------------------------------
// Health Check — copy
// ---------------------------------------------------------------------------

function buildPlainTextReport(url, checks) {
  const lines = [`Pendo Health Check — ${url}`, ""];
  checks.forEach((c) => {
    lines.push(`${STATUS_ICONS[c.status]} ${c.label}: ${c.detail}`);
  });
  let pass = 0, warn = 0, fail = 0;
  checks.forEach((c) => {
    if (c.status === "pass") pass++;
    else if (c.status === "warn") warn++;
    else fail++;
  });
  lines.push("");
  lines.push(`${pass} passed · ${warn} warnings · ${fail} failed`);
  return lines.join("\n");
}

document.getElementById("copy-btn").addEventListener("click", () => {
  const btn = document.getElementById("copy-btn");
  const text = buildPlainTextReport(
    document.getElementById("page-url").textContent,
    window.__lastChecks || []
  );
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = "Copy Results"; btn.classList.remove("copied"); }, 1500);
  });
});

// ---------------------------------------------------------------------------
// Setup Assistant — copy
// ---------------------------------------------------------------------------

document.getElementById("copy-setup-btn").addEventListener("click", () => {
  const btn = document.getElementById("copy-setup-btn");
  const text = buildSetupPlainText(
    document.getElementById("page-url").textContent,
    window.__lastSetup || {}
  );
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = "Copy Report"; btn.classList.remove("copied"); }, 1500);
  });
});

function buildSetupPlainText(url, data) {
  const lines = [`Pendo Setup Assistant — ${url}`, ""];

  if (data.framework) {
    lines.push("── Framework Detection ──");
    lines.push(`Framework: ${data.framework.name || "Unknown"}`);
    if (data.framework.version) lines.push(`Version: ${data.framework.version}`);
    if (data.framework.renderer) lines.push(`Renderer: ${data.framework.renderer}`);
    lines.push("");
  }

  if (data.snippet) {
    lines.push("── Snippet Analysis ──");
    lines.push(`Loading method: ${data.snippet.loadMethod}`);
    if (data.snippet.isAsync !== undefined) lines.push(`Async: ${data.snippet.isAsync}`);
    if (data.snippet.placement) lines.push(`Placement: ${data.snippet.placement}`);
    lines.push("");
  }

  if (data.initialization) {
    lines.push("── Initialization ──");
    lines.push(`Method: ${data.initialization.method}`);
    if (data.initialization.timing) lines.push(`Timing: ${data.initialization.timing}`);
    if (data.initialization.hasVisitorId !== undefined) lines.push(`Visitor ID passed: ${data.initialization.hasVisitorId}`);
    if (data.initialization.hasAccountId !== undefined) lines.push(`Account ID passed: ${data.initialization.hasAccountId}`);
    lines.push("");
  }

  if (data.csp) {
    lines.push("── Content Security Policy ──");
    if (data.csp.detected) {
      lines.push(`CSP source: ${data.csp.source || "meta tag"}`);
      const dirNames = Object.keys(data.csp.directives || {});
      if (dirNames.length > 0) lines.push(`Directives: ${dirNames.join(", ")}`);
      if (data.csp.issues && data.csp.issues.length > 0) {
        data.csp.issues.forEach((issue) => {
          const icon = issue.severity === "error" ? "❌" : issue.severity === "warning" ? "⚠️" : "💡";
          lines.push(`  ${icon} ${issue.directive}: ${issue.detail}`);
        });
      } else {
        lines.push("  ✅ All Pendo domains appear allowed");
      }
    } else {
      lines.push(`No restrictive CSP detected (${data.csp.source || "N/A"})`);
    }
    lines.push("");
  }

  if (data.visitorFields && data.visitorFields.length > 0) {
    lines.push("── Visitor Metadata Fields ──");
    data.visitorFields.forEach((f) => {
      const flag = f.warnings.length > 0 ? " ⚠️ " + f.warnings.join(", ") : "";
      lines.push(`  ${f.key}: ${f.type}${flag}`);
    });
    lines.push("");
  }

  if (data.accountFields && data.accountFields.length > 0) {
    lines.push("── Account Metadata Fields ──");
    data.accountFields.forEach((f) => {
      const flag = f.warnings.length > 0 ? " ⚠️ " + f.warnings.join(", ") : "";
      lines.push(`  ${f.key}: ${f.type}${flag}`);
    });
    lines.push("");
  }

  if (data.recommendations && data.recommendations.length > 0) {
    lines.push("── Recommendations ──");
    data.recommendations.forEach((r) => {
      const icon = r.severity === "error" ? "❌" : r.severity === "warning" ? "⚠️" : "💡";
      lines.push(`${icon} ${r.title}: ${r.detail}`);
    });
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Setup Assistant — rendering
// ---------------------------------------------------------------------------

function renderSetup(data) {
  window.__lastSetup = data;
  const container = document.getElementById("setup-content");
  container.innerHTML = "";

  // Framework Detection section
  container.innerHTML += `<div class="section-header">Framework Detection</div>`;
  if (data.framework && data.framework.name !== "Unknown") {
    let details = `
      <div class="detail-row"><span class="detail-key">Framework</span>
        <span class="detail-val">${escapeHtml(data.framework.name)}
        ${data.framework.version ? ` <span class="badge badge-blue">${escapeHtml(data.framework.version)}</span>` : ""}
        </span></div>`;
    if (data.framework.renderer) {
      details += `<div class="detail-row"><span class="detail-key">Renderer</span><span class="detail-val">${escapeHtml(data.framework.renderer)}</span></div>`;
    }
    if (data.framework.mode) {
      details += `<div class="detail-row"><span class="detail-key">Mode</span><span class="detail-val">${escapeHtml(data.framework.mode)}</span></div>`;
    }
    container.innerHTML += details;
  } else {
    container.innerHTML += `<div class="detail-row"><span class="detail-key">Framework</span><span class="detail-val">Could not detect — may be vanilla JS or server-rendered</span></div>`;
  }

  // Snippet Analysis section
  container.innerHTML += `<div class="section-header">Snippet Analysis</div>`;
  if (data.snippet) {
    let snipHtml = `
      <div class="detail-row"><span class="detail-key">Load method</span><span class="detail-val">${escapeHtml(data.snippet.loadMethod)}</span></div>
      <div class="detail-row"><span class="detail-key">Async</span><span class="detail-val">${data.snippet.isAsync ? '<span class="badge badge-green">Yes</span>' : '<span class="badge badge-yellow">No</span>'}</span></div>`;
    if (data.snippet.placement) {
      snipHtml += `<div class="detail-row"><span class="detail-key">Placement</span><span class="detail-val">${escapeHtml(data.snippet.placement)}</span></div>`;
    }
    if (data.snippet.scriptCount !== undefined) {
      snipHtml += `<div class="detail-row"><span class="detail-key">Script tags</span><span class="detail-val">${data.snippet.scriptCount}</span></div>`;
    }
    container.innerHTML += snipHtml;
  }

  // Initialization section
  container.innerHTML += `<div class="section-header">Initialization</div>`;
  if (data.initialization) {
    let initHtml = `
      <div class="detail-row"><span class="detail-key">Method</span><span class="detail-val">${escapeHtml(data.initialization.method)}</span></div>`;
    if (data.initialization.timing) {
      initHtml += `<div class="detail-row"><span class="detail-key">Timing</span><span class="detail-val">${escapeHtml(data.initialization.timing)}</span></div>`;
    }
    initHtml += `
      <div class="detail-row"><span class="detail-key">Visitor ID</span><span class="detail-val">${data.initialization.hasVisitorId ? '<span class="badge badge-green">Passed</span>' : '<span class="badge badge-red">Missing</span>'}</span></div>
      <div class="detail-row"><span class="detail-key">Account ID</span><span class="detail-val">${data.initialization.hasAccountId ? '<span class="badge badge-green">Passed</span>' : '<span class="badge badge-yellow">Missing</span>'}</span></div>`;
    container.innerHTML += initHtml;
  }

  // CSP Analysis section
  if (data.csp) {
    container.innerHTML += `<div class="section-header">Content Security Policy</div>`;
    if (data.csp.detected) {
      let cspHtml = `<div class="detail-row"><span class="detail-key">CSP detected</span><span class="detail-val"><span class="badge badge-yellow">Yes</span> (${escapeHtml(data.csp.source || "meta tag")})</span></div>`;

      // Show directive summary
      const dirNames = Object.keys(data.csp.directives || {});
      if (dirNames.length > 0) {
        cspHtml += `<div class="detail-row"><span class="detail-key">Directives</span><span class="detail-val">${escapeHtml(dirNames.join(", "))}</span></div>`;
      }

      // Show issues
      if (data.csp.issues && data.csp.issues.length > 0) {
        data.csp.issues.forEach((issue) => {
          const icon = issue.severity === "error" ? "❌" : issue.severity === "warning" ? "⚠️" : "💡";
          const cls = issue.severity === "error" ? "badge-red" : issue.severity === "warning" ? "badge-yellow" : "badge-blue";
          cspHtml += `<div class="detail-row"><span class="detail-key">${icon} ${escapeHtml(issue.directive)}</span><span class="detail-val">${escapeHtml(issue.detail)}</span></div>`;
        });
      } else {
        cspHtml += `<div class="detail-row"><span class="detail-key">Status</span><span class="detail-val"><span class="badge badge-green">Pendo-compatible</span> All required domains appear to be allowed</span></div>`;
      }
      container.innerHTML += cspHtml;
    } else {
      container.innerHTML += `<div class="detail-row"><span class="detail-key">CSP detected</span><span class="detail-val"><span class="badge badge-green">No</span> ${escapeHtml(data.csp.source || "No restrictive CSP found")}</span></div>`;
    }
  }

  // Visitor Metadata section
  if (data.visitorFields && data.visitorFields.length > 0) {
    container.innerHTML += `<div class="section-header">Visitor Metadata (${data.visitorFields.length} fields)</div>`;
    let tableHtml = `<table class="metadata-table"><tr><th>Field</th><th>Type</th><th>Status</th></tr>`;
    data.visitorFields.forEach((f) => {
      const hasWarn = f.warnings.length > 0;
      const cls = hasWarn ? "field-warn" : "field-ok";
      const status = hasWarn ? f.warnings.map(escapeHtml).join(", ") : "OK";
      tableHtml += `<tr><td>${escapeHtml(f.key)}</td><td>${escapeHtml(f.type)}</td><td class="${cls}">${status}</td></tr>`;
    });
    tableHtml += `</table>`;
    container.innerHTML += tableHtml;
  }

  // Account Metadata section
  if (data.accountFields && data.accountFields.length > 0) {
    container.innerHTML += `<div class="section-header">Account Metadata (${data.accountFields.length} fields)</div>`;
    let tableHtml = `<table class="metadata-table"><tr><th>Field</th><th>Type</th><th>Status</th></tr>`;
    data.accountFields.forEach((f) => {
      const hasWarn = f.warnings.length > 0;
      const cls = hasWarn ? "field-warn" : "field-ok";
      const status = hasWarn ? f.warnings.map(escapeHtml).join(", ") : "OK";
      tableHtml += `<tr><td>${escapeHtml(f.key)}</td><td>${escapeHtml(f.type)}</td><td class="${cls}">${status}</td></tr>`;
    });
    tableHtml += `</table>`;
    container.innerHTML += tableHtml;
  }

  // Recommendations section
  if (data.recommendations && data.recommendations.length > 0) {
    container.innerHTML += `<div class="section-header">Recommendations (${data.recommendations.length})</div>`;
    let recHtml = "";
    data.recommendations.forEach((r) => {
      const icon = r.severity === "error" ? "❌" : r.severity === "warning" ? "⚠️" : "💡";
      recHtml += `
        <div class="recommendation">
          <span class="rec-icon">${icon}</span>
          <div class="rec-text">
            <strong>${escapeHtml(r.title)}</strong>
            <span class="rec-detail">${escapeHtml(r.detail)}</span>
          </div>
        </div>`;
    });
    container.innerHTML += recHtml;

    // Summary counts
    let errors = 0, warnings = 0, tips = 0;
    data.recommendations.forEach((r) => {
      if (r.severity === "error") errors++;
      else if (r.severity === "warning") warnings++;
      else tips++;
    });
    document.getElementById("setup-summary-counts").innerHTML =
      `<span class="fail">${errors} error${errors !== 1 ? "s" : ""}</span> · ` +
      `<span class="warn">${warnings} warning${warnings !== 1 ? "s" : ""}</span> · ` +
      `<span style="color:#2563eb">${tips} tip${tips !== 1 ? "s" : ""}</span>`;
  } else {
    document.getElementById("setup-summary-counts").innerHTML =
      `<span class="pass">No issues found</span>`;
  }

  document.getElementById("setup-loading").style.display = "none";
  container.style.display = "block";
  document.getElementById("setup-summary").style.display = "flex";
}

// ---------------------------------------------------------------------------
// Main — run health check on popup open
// ---------------------------------------------------------------------------

let currentTabId = null;

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab) return;
  currentTabId = tab.id;
  document.getElementById("page-url").textContent = tab.url || "";

  if (
    !tab.url ||
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("chrome-extension://") ||
    tab.url.startsWith("chrome-search://") ||
    tab.url.startsWith("https://chrome.google.com/webstore")
  ) {
    showView("error-state");
    return;
  }

  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      func: runPendoHealthCheck,
      world: "MAIN",
    })
    .then((results) => {
      const data = results?.[0]?.result;
      if (!data || !data.pendoDetected) {
        showView("not-detected");
        return;
      }
      window.__lastChecks = data.checks;
      activeTabId = "health";
      renderChecks(data.checks);
    })
    .catch((err) => {
      console.error("Health check failed:", err);
      document.getElementById("error-message").textContent = err.message || "Unknown error";
      showView("error-state");
    });
});

// ---------------------------------------------------------------------------
// Setup Assistant — run on tab switch
// ---------------------------------------------------------------------------

function runSetup() {
  if (!currentTabId) return;
  chrome.scripting
    .executeScript({
      target: { tabId: currentTabId },
      func: runPendoSetupAssistant,
      world: "MAIN",
    })
    .then((results) => {
      const data = results?.[0]?.result;
      if (!data) {
        document.getElementById("setup-loading").style.display = "none";
        document.getElementById("setup-content").innerHTML =
          '<div class="empty-state">Could not analyze Pendo setup on this page.</div>';
        document.getElementById("setup-content").style.display = "block";
        return;
      }
      renderSetup(data);
    })
    .catch((err) => {
      console.error("Setup assistant failed:", err);
      document.getElementById("setup-loading").style.display = "none";
      document.getElementById("setup-content").innerHTML =
        `<div class="empty-state">Error: ${escapeHtml(err.message || "Unknown error")}</div>`;
      document.getElementById("setup-content").style.display = "block";
    });
}

// ===========================================================================
// INJECTED FUNCTION: Health Check (runs in page MAIN world)
// ===========================================================================

function runPendoHealthCheck() {
  var checks = [];

  function add(status, label, detail) {
    checks.push({ status: status, label: label, detail: String(detail) });
  }

  // 1. Pendo agent loaded
  if (typeof window.pendo === "undefined" || !window.pendo) {
    add("fail", "Pendo Agent Loaded", "window.pendo is not present");
    return { pendoDetected: false, checks: checks };
  }
  add("pass", "Pendo Agent Loaded", "window.pendo is present");

  // 2. pendo.isReady()
  try {
    var ready = typeof pendo.isReady === "function" && pendo.isReady();
    if (ready) {
      add("pass", "Pendo Ready", "pendo.isReady() returned true");
    } else {
      add("warn", "Pendo Ready", "pendo.isReady() returned false — agent may still be initializing");
    }
  } catch (e) {
    add("fail", "Pendo Ready", "Error calling pendo.isReady(): " + e.message);
  }

  // 3. Visitor ID
  try {
    var visitor =
      (pendo.getVisitorId && pendo.getVisitorId()) ||
      (pendo.get && pendo.get("visitor") && pendo.get("visitor").id) ||
      (pendo.visitorId) ||
      null;
    if (!visitor) {
      add("fail", "Visitor ID", "No visitor ID found");
    } else if (visitor.startsWith("VISITOR-") || visitor.startsWith("_PENDO_T_")) {
      add("warn", "Visitor ID", "Anonymous visitor: " + visitor);
    } else {
      add("pass", "Visitor ID", visitor);
    }
  } catch (e) {
    add("fail", "Visitor ID", "Error reading visitor ID: " + e.message);
  }

  // 4. Account ID
  try {
    var account =
      (pendo.getAccountId && pendo.getAccountId()) ||
      (pendo.get && pendo.get("account") && pendo.get("account").id) ||
      (pendo.accountId) ||
      null;
    if (!account) {
      add("warn", "Account ID", "No account ID found");
    } else {
      add("pass", "Account ID", account);
    }
  } catch (e) {
    add("fail", "Account ID", "Error reading account ID: " + e.message);
  }

  // 5. Visitor metadata
  try {
    var meta =
      pendo.metadata &&
      pendo.metadata.auto &&
      pendo.metadata.auto.visitor;
    if (meta && typeof meta === "object") {
      var keys = Object.keys(meta);
      add("pass", "Visitor Metadata", keys.length + " field(s): " + keys.slice(0, 5).join(", ") + (keys.length > 5 ? "…" : ""));
    } else {
      add("warn", "Visitor Metadata", "pendo.metadata.auto.visitor is empty or not available");
    }
  } catch (e) {
    add("warn", "Visitor Metadata", "Could not access visitor metadata: " + e.message);
  }

  // 6. Active guides
  try {
    var guides = pendo.guides;
    if (Array.isArray(guides)) {
      add("pass", "Active Guides", guides.length + " guide(s) loaded");
    } else {
      add("warn", "Active Guides", "pendo.guides is not available");
    }
  } catch (e) {
    add("warn", "Active Guides", "Error reading guides: " + e.message);
  }

  // 7. Number of Pendo instances
  try {
    var instanceCount = 0;
    if (window.pendo) instanceCount++;
    if (window.pendo_) instanceCount++;
    var pendoScripts = document.querySelectorAll('script[src*="pendo"]');
    var totalScripts = pendoScripts.length;

    if (instanceCount > 1) {
      add("warn", "Pendo Instances", instanceCount + " Pendo objects detected (window.pendo + window.pendo_) — possible dual initialization");
    } else if (totalScripts > 1) {
      add("warn", "Pendo Instances", "1 Pendo object, but " + totalScripts + " Pendo script tags found — review for duplicate loading");
    } else {
      add("pass", "Pendo Instances", "1 instance detected (" + totalScripts + " script tag" + (totalScripts !== 1 ? "s" : "") + ")");
    }
  } catch (e) {
    add("warn", "Pendo Instances", "Error checking instances: " + e.message);
  }

  // 8. Agent version
  try {
    var version =
      (pendo.getVersion && pendo.getVersion()) ||
      pendo.VERSION ||
      null;
    if (version) {
      add("pass", "Agent Version", version);
    } else {
      add("warn", "Agent Version", "Could not determine agent version");
    }
  } catch (e) {
    add("warn", "Agent Version", "Error reading version: " + e.message);
  }

  // 9. API key
  try {
    var apiKey =
      (pendo.get && pendo.get("apiKey")) ||
      (pendo.apiKey) ||
      null;
    if (apiKey) {
      add("pass", "API Key", apiKey);
    } else {
      add("warn", "API Key", "Could not determine API key");
    }
  } catch (e) {
    add("warn", "API Key", "Error reading API key: " + e.message);
  }

  // 10. Data host
  try {
    var dataHost = null;
    if (pendo.get && typeof pendo.get === "function") {
      try {
        var opts = pendo.get("options");
        if (opts && opts.dataHost) dataHost = opts.dataHost;
      } catch (_) {}
    }
    if (!dataHost) {
      var scripts = document.querySelectorAll('script[src*="pendo"]');
      for (var i = 0; i < scripts.length; i++) {
        try {
          var u = new URL(scripts[i].src);
          if (!dataHost && u.hostname.includes("pendo")) dataHost = u.hostname;
        } catch (_) {}
      }
    }
    if (!dataHost && pendo.HOST) dataHost = pendo.HOST;

    if (dataHost) {
      var isDefault = dataHost.includes("cdn.pendo.io") || dataHost.includes("data.pendo.io");
      add("pass", "Data Host", dataHost + (isDefault ? " (default Pendo CDN)" : " (CNAME / custom)"));
    } else {
      add("warn", "Data Host", "Could not determine data host");
    }
  } catch (e) {
    add("warn", "Data Host", "Error detecting data host: " + e.message);
  }

  // 11. Content Security Policy (CSP)
  try {
    var cspIssues = [];

    // Check CSP from meta tags
    var cspMetas = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    var cspContent = "";
    for (var cm = 0; cm < cspMetas.length; cm++) {
      cspContent += " " + (cspMetas[cm].getAttribute("content") || "");
    }

    if (cspContent.trim()) {
      // Parse relevant directives
      var directives = {};
      cspContent.split(";").forEach(function(d) {
        var parts = d.trim().split(/\s+/);
        if (parts.length > 0) directives[parts[0]] = parts.slice(1);
      });

      var pendoHosts = ["cdn.pendo.io", "*.pendo.io", "pendo.io", "data.pendo.io", "app.pendo.io"];

      // Check script-src
      var scriptSrc = directives["script-src"] || directives["default-src"] || [];
      if (scriptSrc.length > 0) {
        var allowsPendo = scriptSrc.some(function(v) {
          return v === "'unsafe-inline'" || v === "'unsafe-eval'" || v === "*" ||
            pendoHosts.some(function(h) { return v.indexOf(h) !== -1; });
        });
        if (!allowsPendo) cspIssues.push("script-src may block Pendo agent scripts");
      }

      // Check connect-src (for data transmission)
      var connectSrc = directives["connect-src"] || directives["default-src"] || [];
      if (connectSrc.length > 0) {
        var allowsConnect = connectSrc.some(function(v) {
          return v === "*" || pendoHosts.some(function(h) { return v.indexOf(h) !== -1; });
        });
        if (!allowsConnect) cspIssues.push("connect-src may block Pendo data transmission");
      }

      // Check style-src (Pendo injects inline styles for guides)
      var styleSrc = directives["style-src"] || directives["default-src"] || [];
      if (styleSrc.length > 0) {
        var allowsStyle = styleSrc.some(function(v) {
          return v === "'unsafe-inline'" || v === "*";
        });
        if (!allowsStyle) cspIssues.push("style-src may block Pendo guide styling (needs 'unsafe-inline')");
      }

      // Check img-src (guide images)
      var imgSrc = directives["img-src"] || directives["default-src"] || [];
      if (imgSrc.length > 0) {
        var allowsImg = imgSrc.some(function(v) {
          return v === "*" || v === "data:" || pendoHosts.some(function(h) { return v.indexOf(h) !== -1; });
        });
        if (!allowsImg) cspIssues.push("img-src may block Pendo guide images");
      }

      // Check frame-src (Pendo resource center uses iframes)
      var frameSrc = directives["frame-src"] || directives["child-src"] || directives["default-src"] || [];
      if (frameSrc.length > 0) {
        var allowsFrame = frameSrc.some(function(v) {
          return v === "*" || pendoHosts.some(function(h) { return v.indexOf(h) !== -1; });
        });
        if (!allowsFrame) cspIssues.push("frame-src may block Pendo resource center iframes");
      }

      if (cspIssues.length > 0) {
        add("warn", "Content Security Policy", cspIssues.join("; "));
      } else {
        add("pass", "Content Security Policy", "CSP found — Pendo domains appear to be allowed");
      }
    } else {
      add("pass", "Content Security Policy", "No restrictive CSP meta tag detected");
    }

    // Also check for CSP violation events (indicates active blocking)
    var cspViolations = [];
    var origListener = document.addEventListener;
    // We can't retroactively detect past violations, but we note the meta-tag analysis
  } catch (e) {
    add("warn", "Content Security Policy", "Error checking CSP: " + e.message);
  }

  return { pendoDetected: true, checks: checks };
}

// ===========================================================================
// INJECTED FUNCTION: Setup Assistant (runs in page MAIN world)
// ===========================================================================

function runPendoSetupAssistant() {
  var result = {
    framework: null,
    snippet: null,
    initialization: null,
    csp: null,
    visitorFields: [],
    accountFields: [],
    recommendations: []
  };

  function recommend(severity, title, detail) {
    result.recommendations.push({ severity: severity, title: title, detail: detail });
  }

  // -- If Pendo not present, return minimal result --------------------------
  if (typeof window.pendo === "undefined" || !window.pendo) {
    result.recommendations.push({
      severity: "error",
      title: "Pendo not installed",
      detail: "No Pendo agent detected on this page. Install the Pendo snippet or verify it loads before this check runs."
    });
    return result;
  }

  // ========================================================================
  // 1. FRAMEWORK DETECTION
  // ========================================================================
  var fw = { name: "Unknown", version: null, renderer: null, mode: null };

  // React
  if (window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    fw.name = "React";
    if (window.React && window.React.version) fw.version = window.React.version;
    // Detect Next.js
    if (window.__NEXT_DATA__ || document.getElementById("__next")) {
      fw.name = "Next.js (React)";
      if (window.__NEXT_DATA__ && window.__NEXT_DATA__.buildId) {
        fw.mode = "Build: " + window.__NEXT_DATA__.buildId;
      }
    }
    // Detect if using React DOM
    if (window.ReactDOM) fw.renderer = "ReactDOM";
  }
  // Vue
  else if (window.Vue || window.__VUE__) {
    fw.name = "Vue";
    if (window.Vue && window.Vue.version) fw.version = window.Vue.version;
    // Detect Nuxt
    if (window.__NUXT__ || window.$nuxt) {
      fw.name = "Nuxt (Vue)";
    }
  }
  // Angular
  else if (window.ng || document.querySelector("[ng-version]")) {
    fw.name = "Angular";
    var ngEl = document.querySelector("[ng-version]");
    if (ngEl) fw.version = ngEl.getAttribute("ng-version");
  }
  // AngularJS (1.x)
  else if (window.angular) {
    fw.name = "AngularJS";
    if (window.angular.version) fw.version = window.angular.version.full;
  }
  // Svelte
  else if (document.querySelector("[class*='svelte-']")) {
    fw.name = "Svelte";
  }
  // Ember
  else if (window.Ember || window.Em) {
    fw.name = "Ember";
    if (window.Ember && window.Ember.VERSION) fw.version = window.Ember.VERSION;
  }
  // jQuery (not a framework, but commonly used with Pendo)
  else if (window.jQuery || window.$) {
    fw.name = "jQuery";
    if (window.jQuery && window.jQuery.fn) fw.version = window.jQuery.fn.jquery;
  }

  // SPA detection
  if (document.querySelector("[id='app']") || document.querySelector("[id='root']")) {
    if (!fw.mode) fw.mode = "SPA (single root element detected)";
  }

  result.framework = fw;

  // ========================================================================
  // 2. SNIPPET ANALYSIS
  // ========================================================================
  var snippet = { loadMethod: "Unknown", isAsync: false, placement: null, scriptCount: 0 };

  var pendoScripts = document.querySelectorAll('script[src*="pendo"]');
  snippet.scriptCount = pendoScripts.length;

  if (pendoScripts.length > 0) {
    var mainScript = pendoScripts[0];
    snippet.isAsync = mainScript.async || mainScript.defer;
    snippet.loadMethod = mainScript.src.includes("agent/static") ? "Pendo Agent (static)" :
                          mainScript.src.includes("pendo-agent") ? "Pendo Agent (bundled)" :
                          "Script tag";

    // Determine placement
    if (mainScript.parentElement && mainScript.parentElement.tagName === "HEAD") {
      snippet.placement = "<head>";
    } else if (mainScript.parentElement && mainScript.parentElement.tagName === "BODY") {
      snippet.placement = "<body>";
    } else {
      snippet.placement = mainScript.parentElement ? mainScript.parentElement.tagName.toLowerCase() : "unknown";
    }
  } else {
    // No external script — likely inline snippet or npm package
    var inlineScripts = document.querySelectorAll("script:not([src])");
    var foundInline = false;
    for (var i = 0; i < inlineScripts.length; i++) {
      if (inlineScripts[i].textContent && inlineScripts[i].textContent.indexOf("pendo") !== -1) {
        snippet.loadMethod = "Inline snippet";
        foundInline = true;
        break;
      }
    }
    if (!foundInline) {
      snippet.loadMethod = "npm package or dynamic injection";
    }
  }

  result.snippet = snippet;

  // ========================================================================
  // 3. INITIALIZATION ANALYSIS
  // ========================================================================
  var init = {
    method: "Unknown",
    timing: null,
    hasVisitorId: false,
    hasAccountId: false
  };

  // Check if initialized
  try {
    var isReady = typeof pendo.isReady === "function" && pendo.isReady();

    if (isReady) {
      init.timing = "Initialized (agent is ready)";
    } else {
      init.timing = "Not yet initialized or pending";
    }

    // Detect initialization method
    if (typeof pendo.initialize === "function") {
      init.method = "pendo.initialize()";
    }
    if (typeof pendo.identify === "function") {
      // Check if identify was likely used (visitor data present but via identify)
      init.method = "pendo.initialize() / pendo.identify()";
    }

    // Check visitor ID
    var vid =
      (pendo.getVisitorId && pendo.getVisitorId()) ||
      (pendo.visitorId) ||
      null;
    if (vid && !vid.startsWith("VISITOR-") && !vid.startsWith("_PENDO_T_")) {
      init.hasVisitorId = true;
    }

    // Check account ID
    var aid =
      (pendo.getAccountId && pendo.getAccountId()) ||
      (pendo.accountId) ||
      null;
    if (aid) {
      init.hasAccountId = true;
    }
  } catch (e) {
    init.timing = "Error inspecting initialization: " + e.message;
  }

  result.initialization = init;

  // ========================================================================
  // 4. CONTENT SECURITY POLICY ANALYSIS
  // ========================================================================
  var csp = { detected: false, source: null, directives: {}, issues: [] };

  try {
    // Check CSP from meta tags
    var cspMetas = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    var cspRaw = "";
    for (var cm = 0; cm < cspMetas.length; cm++) {
      cspRaw += " " + (cspMetas[cm].getAttribute("content") || "");
    }

    if (cspRaw.trim()) {
      csp.detected = true;
      csp.source = "meta tag";

      // Parse directives
      cspRaw.split(";").forEach(function(d) {
        var parts = d.trim().split(/\s+/);
        if (parts.length > 0 && parts[0]) {
          csp.directives[parts[0]] = parts.slice(1);
        }
      });

      var pendoHosts = ["cdn.pendo.io", "*.pendo.io", "pendo.io", "data.pendo.io", "app.pendo.io", "pendo-static-5763789454311424.storage.googleapis.com"];

      function hostAllowed(sources) {
        return sources.some(function(v) {
          return v === "*" || pendoHosts.some(function(h) { return v.indexOf(h) !== -1; });
        });
      }

      function valueAllowed(sources, val) {
        return sources.some(function(v) { return v === val; });
      }

      // script-src
      var scriptSrc = csp.directives["script-src"] || csp.directives["default-src"] || [];
      if (scriptSrc.length > 0) {
        if (!hostAllowed(scriptSrc) && !valueAllowed(scriptSrc, "'unsafe-inline'") && !valueAllowed(scriptSrc, "'unsafe-eval'")) {
          csp.issues.push({ directive: "script-src", severity: "error", detail: "Pendo CDN domains not listed. Add cdn.pendo.io and app.pendo.io to script-src." });
        }
        if (!valueAllowed(scriptSrc, "'unsafe-inline'")) {
          csp.issues.push({ directive: "script-src", severity: "warning", detail: "Missing 'unsafe-inline'. Pendo's inline initialization snippet may be blocked. Use a nonce or hash instead." });
        }
      }

      // connect-src (XHR/fetch for data transmission)
      var connectSrc = csp.directives["connect-src"] || csp.directives["default-src"] || [];
      if (connectSrc.length > 0 && !hostAllowed(connectSrc)) {
        csp.issues.push({ directive: "connect-src", severity: "error", detail: "Pendo data endpoints not listed. Add data.pendo.io (or your CNAME) to connect-src for event data transmission." });
      }

      // style-src (Pendo injects inline styles for guides/tooltips)
      var styleSrc = csp.directives["style-src"] || csp.directives["default-src"] || [];
      if (styleSrc.length > 0 && !valueAllowed(styleSrc, "'unsafe-inline'") && !valueAllowed(styleSrc, "*")) {
        csp.issues.push({ directive: "style-src", severity: "warning", detail: "Missing 'unsafe-inline'. Pendo guides and tooltips inject inline styles that will be blocked." });
      }

      // img-src (guide images, resource center assets)
      var imgSrc = csp.directives["img-src"] || csp.directives["default-src"] || [];
      if (imgSrc.length > 0 && !hostAllowed(imgSrc) && !valueAllowed(imgSrc, "*")) {
        var hasData = valueAllowed(imgSrc, "data:");
        csp.issues.push({ directive: "img-src", severity: "warning", detail: "Pendo CDN not in img-src. Guide images and resource center assets may not load." + (hasData ? "" : " Also consider adding data: for inline images.") });
      }

      // font-src (Pendo guides may load custom fonts)
      var fontSrc = csp.directives["font-src"] || csp.directives["default-src"] || [];
      if (fontSrc.length > 0 && !hostAllowed(fontSrc) && !valueAllowed(fontSrc, "*")) {
        csp.issues.push({ directive: "font-src", severity: "tip", detail: "If Pendo guides use custom fonts, add cdn.pendo.io to font-src." });
      }

      // frame-src (resource center, in-app designer)
      var frameSrc = csp.directives["frame-src"] || csp.directives["child-src"] || csp.directives["default-src"] || [];
      if (frameSrc.length > 0 && !hostAllowed(frameSrc)) {
        csp.issues.push({ directive: "frame-src", severity: "warning", detail: "Pendo not in frame-src. The resource center and in-app designer use iframes that may be blocked." });
      }

      // worker-src (Pendo may use web workers)
      var workerSrc = csp.directives["worker-src"] || csp.directives["default-src"] || [];
      if (workerSrc.length > 0 && !valueAllowed(workerSrc, "'self'") && !valueAllowed(workerSrc, "*") && !valueAllowed(workerSrc, "blob:")) {
        csp.issues.push({ directive: "worker-src", severity: "tip", detail: "If Pendo uses web workers, ensure worker-src allows blob: or 'self'." });
      }
    }

    // Try to detect CSP from HTTP header via a test fetch (heuristic)
    if (!csp.detected) {
      // Check if any CSP violations have been observed (heuristic: look for blocked pendo resources)
      var perfEntries = performance.getEntriesByType && performance.getEntriesByType("resource") || [];
      var pendoResources = perfEntries.filter(function(e) { return e.name && e.name.indexOf("pendo") !== -1; });
      if (pendoResources.length > 0) {
        // Pendo resources loaded fine — CSP from HTTP headers is likely not blocking
        csp.source = "none detected (HTTP header CSP cannot be read from JS, but Pendo resources loaded successfully)";
      } else if (typeof window.pendo !== "undefined" && window.pendo) {
        csp.source = "none detected (Pendo agent is functional)";
      }
    }
  } catch (e) {
    csp.issues.push({ directive: "parse-error", severity: "warning", detail: "Error analyzing CSP: " + e.message });
  }

  result.csp = csp;

  // ========================================================================
  // 5. METADATA FIELD VALIDATION
  // ========================================================================

  var SENSITIVE_PATTERNS = /^(password|passwd|secret|token|ssn|credit.?card|cvv|auth.?key|api.?secret|private.?key)$/i;
  var VALID_FIELD_NAME = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  var MAX_VALUE_LENGTH = 1024;

  function validateFields(obj) {
    var fields = [];
    if (!obj || typeof obj !== "object") return fields;
    var keys = Object.keys(obj);
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      var val = obj[key];
      var type = val === null ? "null" : Array.isArray(val) ? "array" : typeof val;
      var warnings = [];

      // Sensitive field name
      if (SENSITIVE_PATTERNS.test(key)) {
        warnings.push("Possibly sensitive field name");
      }

      // Invalid field name characters
      if (!VALID_FIELD_NAME.test(key)) {
        warnings.push("Field name should use only letters, numbers, underscores");
      }

      // Value too long
      if (typeof val === "string" && val.length > MAX_VALUE_LENGTH) {
        warnings.push("Value exceeds 1024 chars (" + val.length + ")");
      }

      // Null or undefined
      if (val === null || val === undefined) {
        warnings.push("Null/undefined value");
      }

      // Nested objects
      if (type === "object" && !Array.isArray(val)) {
        warnings.push("Nested object — Pendo only supports flat fields");
      }

      // Arrays
      if (type === "array") {
        warnings.push("Array value — consider converting to comma-separated string");
      }

      // Functions
      if (type === "function") {
        warnings.push("Function value — will not be sent to Pendo");
      }

      fields.push({ key: key, type: type, warnings: warnings });
    }
    return fields;
  }

  try {
    var visitorMeta =
      pendo.metadata && pendo.metadata.auto && pendo.metadata.auto.visitor;
    if (visitorMeta && typeof visitorMeta === "object") {
      result.visitorFields = validateFields(visitorMeta);
    }
  } catch (e) {}

  try {
    var accountMeta =
      pendo.metadata && pendo.metadata.auto && pendo.metadata.auto.account;
    if (accountMeta && typeof accountMeta === "object") {
      result.accountFields = validateFields(accountMeta);
    }
  } catch (e) {}

  // ========================================================================
  // 5. RECOMMENDATIONS
  // ========================================================================

  // Visitor ID
  if (!init.hasVisitorId) {
    recommend("error", "Visitor ID missing or anonymous",
      "Pendo is running with an anonymous visitor ID. Pass a unique, stable user ID to pendo.initialize() for accurate analytics.");
  }

  // Account ID
  if (!init.hasAccountId) {
    recommend("warning", "Account ID not set",
      "No account ID detected. If your app is B2B, pass account.id to pendo.initialize() to enable account-level analytics.");
  }

  // Async loading
  if (result.snippet && !result.snippet.isAsync && result.snippet.loadMethod.indexOf("npm") === -1) {
    recommend("warning", "Script not loaded async",
      "The Pendo snippet is loaded synchronously, which may impact page load performance. Add the async attribute to the script tag.");
  }

  // Duplicate scripts
  if (result.snippet && result.snippet.scriptCount > 1) {
    recommend("warning", "Multiple Pendo script tags",
      result.snippet.scriptCount + " Pendo script tags found. This can cause duplicate event tracking or conflicts. Ensure only one snippet is loaded.");
  }

  // Dual initialization
  if (window.pendo_) {
    recommend("warning", "Dual Pendo instance detected",
      "Both window.pendo and window.pendo_ exist. This may indicate Pendo Guard or duplicate initialization. Verify this is intentional.");
  }

  // Sensitive metadata fields
  var allFields = (result.visitorFields || []).concat(result.accountFields || []);
  var sensitiveFields = [];
  for (var f = 0; f < allFields.length; f++) {
    for (var w = 0; w < allFields[f].warnings.length; w++) {
      if (allFields[f].warnings[w].indexOf("sensitive") !== -1) {
        sensitiveFields.push(allFields[f].key);
      }
    }
  }
  if (sensitiveFields.length > 0) {
    recommend("error", "Potentially sensitive metadata detected",
      "Fields that may contain sensitive data: " + sensitiveFields.join(", ") + ". Review these fields and exclude any PII, passwords, or tokens.");
  }

  // Nested or array fields
  var complexFields = [];
  for (var f2 = 0; f2 < allFields.length; f2++) {
    for (var w2 = 0; w2 < allFields[f2].warnings.length; w2++) {
      if (allFields[f2].warnings[w2].indexOf("Nested") !== -1 || allFields[f2].warnings[w2].indexOf("Array") !== -1) {
        complexFields.push(allFields[f2].key);
      }
    }
  }
  if (complexFields.length > 0) {
    recommend("warning", "Complex metadata values",
      "Fields with non-flat values: " + complexFields.join(", ") + ". Pendo works best with flat key-value pairs. Flatten nested objects or convert arrays to strings.");
  }

  // Framework-specific timing tips
  if (fw.name.indexOf("React") !== -1 || fw.name.indexOf("Next") !== -1) {
    if (!init.hasVisitorId) {
      recommend("tip", "React initialization timing",
        "In React, call pendo.initialize() inside a useEffect hook after authentication completes, so the visitor ID is available.");
    }
  } else if (fw.name.indexOf("Vue") !== -1 || fw.name.indexOf("Nuxt") !== -1) {
    if (!init.hasVisitorId) {
      recommend("tip", "Vue initialization timing",
        "In Vue, call pendo.initialize() in the mounted() lifecycle hook or in a route guard after the user is authenticated.");
    }
  } else if (fw.name.indexOf("Angular") !== -1) {
    if (!init.hasVisitorId) {
      recommend("tip", "Angular initialization timing",
        "In Angular, call pendo.initialize() in an AfterViewInit lifecycle hook or in a route resolver after fetching user data.");
    }
  }

  // Payload size estimate
  try {
    var payloadEstimate = JSON.stringify(pendo.metadata || {}).length;
    if (payloadEstimate > 50000) {
      recommend("warning", "Large metadata payload",
        "Estimated metadata size is " + Math.round(payloadEstimate / 1024) + "KB. Pendo has a 64KB limit. Consider reducing the number of metadata fields.");
    }
  } catch (e) {}

  // Agent version check
  try {
    var ver = (pendo.getVersion && pendo.getVersion()) || pendo.VERSION || null;
    if (ver) {
      var parts = ver.split(".");
      var major = parseInt(parts[0], 10);
      if (major < 2) {
        recommend("tip", "Agent version may be outdated",
          "Running Pendo agent v" + ver + ". Check if a newer version is available for improved features and bug fixes.");
      }
    }
  } catch (e) {}

  // CSP issues → recommendations
  if (result.csp && result.csp.issues && result.csp.issues.length > 0) {
    var cspErrors = result.csp.issues.filter(function(i) { return i.severity === "error"; });
    var cspWarnings = result.csp.issues.filter(function(i) { return i.severity === "warning"; });
    if (cspErrors.length > 0) {
      recommend("error", "CSP blocking Pendo",
        "Content Security Policy is likely blocking critical Pendo functionality: " +
        cspErrors.map(function(i) { return i.directive; }).join(", ") +
        ". Update your CSP to allow cdn.pendo.io, data.pendo.io, and app.pendo.io.");
    }
    if (cspWarnings.length > 0) {
      recommend("warning", "CSP may affect Pendo features",
        "Some CSP directives may block Pendo features: " +
        cspWarnings.map(function(i) { return i.directive + " (" + i.detail.split(".")[0] + ")"; }).join("; ") + ".");
    }
  }

  // No metadata at all
  if (result.visitorFields.length === 0 && result.accountFields.length === 0) {
    recommend("tip", "No metadata fields detected",
      "Pendo is initialized without visitor or account metadata. Adding fields like email, role, plan_level, and created_at enables richer segmentation and analytics.");
  }

  return result;
}
