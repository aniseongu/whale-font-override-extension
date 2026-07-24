// common.js
// Shared helpers used by background.js (via importScripts), content.js
// (loaded before it in the same content_scripts entry), and options.html /
// popup.html (loaded via <script> before options.js / popup.js).
//
// Everything is attached to a single WF namespace object so it works the
// same way in a service worker, an isolated-world content script, and a
// regular extension page.
(function (root) {
  "use strict";

  const STORAGE_KEY = "wfExcludedDomains";

  // Accepts a bare hostname ("example.com"), a hostname with a leading
  // "www.", or a full pasted URL ("https://www.example.com/path?x=1") and
  // returns just the normalized hostname to store/compare.
  function normalizeHost(input) {
    if (!input) return "";
    let value = String(input).trim().toLowerCase();
    if (!value) return "";

    if (value.includes("://")) {
      try {
        value = new URL(value).hostname;
      } catch (error) {
        // Not a valid absolute URL; fall back to treating it as raw text.
      }
    } else {
      // Strip a path/query if someone pasted "example.com/some/path".
      value = value.split("/")[0].split("?")[0].split("#")[0];
    }

    value = value.replace(/^www\./, "");
    return value;
  }

  // Returns true if `hostname` is covered by any entry in `excludedList`.
  // An entry matches its exact hostname and any subdomain of it.
  function isHostExcluded(hostname, excludedList) {
    if (!hostname || !Array.isArray(excludedList) || excludedList.length === 0) {
      return false;
    }
    const host = String(hostname).toLowerCase().replace(/^www\./, "");
    return excludedList.some((entry) => {
      if (!entry) return false;
      return host === entry || host.endsWith("." + entry);
    });
  }

  async function getExcludedDomains() {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    return Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
  }

  async function setExcludedDomains(list) {
    const clean = Array.from(new Set(list.filter(Boolean))).sort();
    await chrome.storage.local.set({ [STORAGE_KEY]: clean });
    return clean;
  }

  root.WF = {
    STORAGE_KEY,
    normalizeHost,
    isHostExcluded,
    getExcludedDomains,
    setExcludedDomains,
  };
})(typeof self !== "undefined" ? self : this);
