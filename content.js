// content.js
// Runs at document_start in every frame (all_frames: true) on http/https pages.
// Skips excluded sites entirely, otherwise injects the font-override CSS and
// also pushes it into any *open* shadow roots (a common reason the override
// silently failed to apply on component-heavy pages), and reacts live if the
// exclude list changes while the page is open.
(function () {
  "use strict";

  const STYLE_ID = "wf-font-override-style";
  const FONT_OVERRIDE_CSS = String.raw`
:root {
  --wf-sans: "Pretendard", "Pretendard Variable", "Noto Sans KR", "Malgun Gothic", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --wf-mono: "D2Coding ligature", "D2Coding", "Cascadia Mono", "Consolas", "Courier New", monospace;
}

:where(html, body, body *):not(:where(
  pre, pre *, code, code *, kbd, kbd *, samp, samp *, tt, tt *, var, var *,
  textarea.code, textarea[class*="code"], textarea[class*="Code"],
  svg, svg *, canvas, math, math *,
  .monaco-editor, .monaco-editor *, .cm-editor, .cm-editor *,
  .CodeMirror, .CodeMirror *, .ace_editor, .ace_editor *,
  [class*="hljs"], [class*="language-"], [class*="token"],
  [class*="material-icons"], [class*="material-symbols"], [class*="MaterialIcons"],
  [class*="icon"], [class*="Icon"], [class^="fa"], [class*=" fa"],
  .fa, .fas, .far, .fab, .glyphicon, [role="img"], [aria-hidden="true"]
)) {
  font-family: var(--wf-sans) !important;
}

:where(
  pre, pre *, code, code *, kbd, kbd *, samp, samp *, tt, tt *, var, var *,
  textarea.code, textarea[class*="code"], textarea[class*="Code"],
  .monaco-editor, .monaco-editor *, .cm-editor, .cm-editor *,
  .CodeMirror, .CodeMirror *, .ace_editor, .ace_editor *,
  [class*="hljs"], [class*="language-"]
) {
  font-family: var(--wf-mono) !important;
}

:where(
  .material-icons, .material-icons-outlined, .material-icons-round,
  .material-icons-rounded, .material-icons-sharp,
  .material-symbols-outlined, .material-symbols-rounded, .material-symbols-sharp,
  [class*="material-icons"], [class*="material-symbols"]
) {
  font-family: "Material Icons", "Material Symbols Outlined", "Material Symbols Rounded", "Material Symbols Sharp" !important;
}
`;

  let applied = false;
  let mainStyleEl = null;
  let cssTextPromise = null;
  let shadowObserver = null;
  const shadowStyles = new Map(); // ShadowRoot -> injected <style> element

  function getCssText() {
    if (!cssTextPromise) {
      cssTextPromise = Promise.resolve(FONT_OVERRIDE_CSS);
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

  function reportError(error) {
    console.error("[Font Override] Failed to apply stylesheet:", error);
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
      enable().catch(reportError);
    }
  });

  init().catch(reportError);
})();
