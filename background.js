// background.js
// Re-injects the stylesheet again as USER-origin CSS. This gives it stronger
// priority than ordinary site CSS in Chromium-based browsers (a "user"
// !important declaration beats an "author" !important declaration, and also
// bypasses page CSP, which the plain content-script CSS could otherwise be
// blocked by). Skips/undoes injection for any host on the exclude list that
// is managed from the popup or the options page.
importScripts("common.js");

const CSS_FILE = "font-override.css";

function isInjectableUrl(url) {
  return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"));
}

function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return "";
  }
}

async function isAllowed(url) {
  if (!isInjectableUrl(url)) return false;
  const excluded = await WF.getExcludedDomains();
  return !WF.isHostExcluded(hostnameFromUrl(url), excluded);
}

async function syncTab(tabId, url) {
  if (!tabId || !isInjectableUrl(url)) return;

  const target = { tabId, allFrames: true };
  try {
    if (await isAllowed(url)) {
      await chrome.scripting.insertCSS({ target, files: [CSS_FILE], origin: "USER" });
    } else {
      await chrome.scripting.removeCSS({ target, files: [CSS_FILE], origin: "USER" });
    }
  } catch (error) {
    // Expected on browser-internal pages, restricted pages, or tabs that
    // changed/closed during injection. Also expected for removeCSS when
    // nothing had been inserted for that tab yet.
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    await syncTab(tab.id, tab.url);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" || changeInfo.status === "complete") {
    syncTab(tabId, tab.url || changeInfo.url);
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    await syncTab(tab.id, tab.url);
  } catch (error) {
    // Ignore closed/restricted tabs.
  }
});

// The moment the exclude list changes (from the popup or the options page),
// bring every currently open tab in line immediately rather than waiting
// for the next navigation.
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "local" || !changes[WF.STORAGE_KEY]) return;
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    await syncTab(tab.id, tab.url);
  }
});
