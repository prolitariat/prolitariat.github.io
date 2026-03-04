const STATUS_ICONS = { pass: "✅", warn: "⚠️", fail: "❌" };

function showView(id) {
  ["loading", "not-detected", "results", "error-state"].forEach((v) => {
    document.getElementById(v).style.display = v === id ? "" : "none";
  });
  if (id === "results") {
    document.getElementById("results").style.display = "block";
  }
}

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

  showView("results");
}

function escapeHtml(str) {
  const el = document.createElement("span");
  el.textContent = str;
  return el.innerHTML;
}

function buildPlainTextReport(url, checks) {
  const lines = [`Pendo Health Check — ${url}`, ""];
  checks.forEach((c) => {
    const icon = STATUS_ICONS[c.status];
    lines.push(`${icon} ${c.label}: ${c.detail}`);
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
    setTimeout(() => {
      btn.textContent = "Copy Results";
      btn.classList.remove("copied");
    }, 1500);
  });
});

// Run health check on popup open
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab) return;
  document.getElementById("page-url").textContent = tab.url || "";

  // Cannot script chrome:// or chrome-extension:// pages
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
      if (!data) {
        showView("not-detected");
        return;
      }
      if (!data.pendoDetected) {
        showView("not-detected");
        return;
      }
      window.__lastChecks = data.checks;
      renderChecks(data.checks);
    })
    .catch((err) => {
      console.error("Health check failed:", err);
      document.getElementById("error-message").textContent = err.message || "Unknown error";
      showView("error-state");
    });
});

// This function is serialized and injected into the page's MAIN world
function runPendoHealthCheck() {
  const checks = [];

  function add(status, label, detail) {
    checks.push({ status, label, detail: String(detail) });
  }

  // 1. Pendo agent loaded
  if (typeof window.pendo === "undefined" || !window.pendo) {
    add("fail", "Pendo Agent Loaded", "window.pendo is not present");
    return { pendoDetected: false, checks };
  }
  add("pass", "Pendo Agent Loaded", "window.pendo is present");

  // 2. pendo.isReady()
  try {
    const ready = typeof pendo.isReady === "function" && pendo.isReady();
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
    const visitor =
      (pendo.getVisitorId && pendo.getVisitorId()) ||
      (pendo.get && pendo.get("visitor") && pendo.get("visitor").id) ||
      (pendo.visitorId) ||
      null;
    if (!visitor) {
      add("fail", "Visitor ID", "No visitor ID found");
    } else if (visitor.startsWith("VISITOR-") || visitor.startsWith("_PENDO_T_")) {
      add("warn", "Visitor ID", `Anonymous visitor: ${visitor}`);
    } else {
      add("pass", "Visitor ID", visitor);
    }
  } catch (e) {
    add("fail", "Visitor ID", "Error reading visitor ID: " + e.message);
  }

  // 4. Account ID
  try {
    const account =
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
    const meta =
      pendo.metadata &&
      pendo.metadata.auto &&
      pendo.metadata.auto.visitor;
    if (meta && typeof meta === "object") {
      const keys = Object.keys(meta);
      add("pass", "Visitor Metadata", `${keys.length} field(s): ${keys.slice(0, 5).join(", ")}${keys.length > 5 ? "…" : ""}`);
    } else {
      add("warn", "Visitor Metadata", "pendo.metadata.auto.visitor is empty or not available");
    }
  } catch (e) {
    add("warn", "Visitor Metadata", "Could not access visitor metadata: " + e.message);
  }

  // 6. Active guides
  try {
    const guides = pendo.guides;
    if (Array.isArray(guides)) {
      add("pass", "Active Guides", `${guides.length} guide(s) loaded`);
    } else {
      add("warn", "Active Guides", "pendo.guides is not available");
    }
  } catch (e) {
    add("warn", "Active Guides", "Error reading guides: " + e.message);
  }

  // 7. Number of Pendo instances (dual init / Pendo Guard)
  try {
    let instanceCount = 0;
    if (window.pendo) instanceCount++;
    if (window.pendo_) instanceCount++;
    // Check for multiple pendo iframes or script tags
    const pendoScripts = document.querySelectorAll('script[src*="pendo"]');
    const pendoAgentScripts = document.querySelectorAll('script[src*="pendo-agent"]');
    const totalScripts = pendoScripts.length;

    if (instanceCount > 1) {
      add("warn", "Pendo Instances", `${instanceCount} Pendo objects detected (window.pendo + window.pendo_) — possible dual initialization`);
    } else if (totalScripts > 1) {
      add("warn", "Pendo Instances", `1 Pendo object, but ${totalScripts} Pendo script tags found — review for duplicate loading`);
    } else {
      add("pass", "Pendo Instances", `1 instance detected (${totalScripts} script tag${totalScripts !== 1 ? "s" : ""})`);
    }
  } catch (e) {
    add("warn", "Pendo Instances", "Error checking instances: " + e.message);
  }

  // 8. Agent version
  try {
    const version =
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
    const apiKey =
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

  // 10. Data host (CNAME detection)
  try {
    let dataHost = null;

    // Try pendo.get('options')
    if (pendo.get && typeof pendo.get === "function") {
      try {
        const opts = pendo.get("options");
        if (opts && opts.dataHost) dataHost = opts.dataHost;
      } catch (_) {}
    }

    // Fallback: check script src attributes
    if (!dataHost) {
      const scripts = document.querySelectorAll('script[src*="pendo"]');
      scripts.forEach((s) => {
        try {
          const url = new URL(s.src);
          if (!dataHost && url.hostname.includes("pendo")) {
            dataHost = url.hostname;
          }
        } catch (_) {}
      });
    }

    // Fallback: check for known defaults in pendo config
    if (!dataHost && pendo.HOST) {
      dataHost = pendo.HOST;
    }

    if (dataHost) {
      const isDefault =
        dataHost.includes("cdn.pendo.io") || dataHost.includes("data.pendo.io");
      if (isDefault) {
        add("pass", "Data Host", `${dataHost} (default Pendo CDN)`);
      } else {
        add("pass", "Data Host", `${dataHost} (CNAME / custom)`);
      }
    } else {
      add("warn", "Data Host", "Could not determine data host");
    }
  } catch (e) {
    add("warn", "Data Host", "Error detecting data host: " + e.message);
  }

  return { pendoDetected: true, checks };
}
