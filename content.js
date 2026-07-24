// content.js
// Runs at document_start in every frame (all_frames: true) on http/https pages.
// Skips excluded sites entirely, otherwise injects the font-override CSS and
// also pushes it into any *open* shadow roots (a common reason the override
// silently failed to apply on component-heavy pages), and reacts live if the
// exclude list changes while the page is open.
(function () {
  "use strict";

  const STYLE_ID = "wf-font-override-style";

  let applied = false;
  let mainStyleEl = null;
  let cssTextPromise = null;
  let shadowObserver = null;
  const shadowStyles = new Map(); // ShadowRoot -> injected <style> element

  function getCssText() {
    if (!cssTextPromise) {
      cssTextPromise = fetch(chrome.runtime.getURL("font-override.css")).then((res) => res.text());
    }
    return cssTextPromise;
  }

  function applyToDocument(cssText) {
    if (applied) return;
    applied = true;
    mainStyleEl = document.createElement("style");
    mainStyleEl.id = STYLE_ID;
    mainStyleEl.textContent = cssText;
    (document.head || document.documentElement).appendChild(mainStyleEl);
  }

  function removeFromDocument() {
    applied = false;
    if (mainStyleEl && mainStyleEl.parentNode) {
      mainStyleEl.parentNode.removeChild(mainStyleEl);
    }
    mainStyleEl = null;

    if (shadowObserver) {
      shadowObserver.disconnect();
      shadowObserver = null;
    }
    for (const styleEl of shadowStyles.values()) {
      if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
    }
    shadowStyles.clear();
  }

  // Chrome content-script CSS/insertCSS can never reach into a shadow tree,
  // which is why some component-based pages ("web app shells") never picked
  // up the font. For every *open* shadow root we find, we drop in our own
  // <style> so those elements get styled too. Closed shadow roots are not
  // reachable from here - that limitation is unavoidable from a content
  // script and is called out in README.txt.
  function styleShadowRoot(root, cssText) {
    if (shadowStyles.has(root)) return;
    const style = document.createElement("style");
    style.setAttribute("data-wf-font-override", "");
    style.textContent = cssText;
    root.appendChild(style);
    shadowStyles.set(root, style);
  }

  function scanForShadowRoots(startNode, cssText) {
    const stack = [startNode];
    while (stack.length) {
      const node = stack.pop();
      if (node.shadowRoot) {
        styleShadowRoot(node.shadowRoot, cssText);
        stack.push(node.shadowRoot);
      }
      const children = node.children;
      if (children) {
        for (const child of children) stack.push(child);
      }
    }
  }

  function watchShadowRoots(cssText) {
    if (shadowObserver) return;
    shadowObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) scanForShadowRoots(node, cssText);
        }
      }
    });

    const start = () => {
      scanForShadowRoots(document.documentElement, cssText);
      shadowObserver.observe(document.documentElement, { childList: true, subtree: true });
    };

    if (document.documentElement) {
      start();
    } else {
      document.addEventListener("DOMContentLoaded", start, { once: true });
    }
  }

  async function enable() {
    const cssText = await getCssText();
    applyToDocument(cssText);
    watchShadowRoots(cssText);
  }

  async function init() {
    const excluded = await WF.getExcludedDomains();
    if (WF.isHostExcluded(location.hostname, excluded)) return;
    await enable();
  }

  // If the user adds/removes this site from the exclude list (via the
  // popup or the options page) while the page is already open, reflect it
  // immediately instead of requiring a reload.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[WF.STORAGE_KEY]) return;
    const list = Array.isArray(changes[WF.STORAGE_KEY].newValue) ? changes[WF.STORAGE_KEY].newValue : [];
    const nowExcluded = WF.isHostExcluded(location.hostname, list);
    if (nowExcluded) {
      removeFromDocument();
    } else if (!applied) {
      enable();
    }
  });

  init();
})();
