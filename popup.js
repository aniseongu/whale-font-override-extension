// popup.js
// Lets the user flip the font override on/off for the site they are
// currently looking at, without having to open the full options page.
(function () {
  "use strict";

  const hostLabel = document.getElementById("hostLabel");
  const statusLabel = document.getElementById("statusLabel");
  const toggleBtn = document.getElementById("toggleBtn");
  const optionsBtn = document.getElementById("optionsBtn");

  let currentHost = "";

  function setDisabledState(message) {
    hostLabel.textContent = message;
    statusLabel.textContent = "";
    toggleBtn.disabled = true;
    toggleBtn.textContent = "사용할 수 없음";
    toggleBtn.className = "";
  }

  async function refresh() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url || !/^https?:\/\//i.test(tab.url)) {
      setDisabledState("이 페이지에서는 사용할 수 없습니다");
      currentHost = "";
      return;
    }

    currentHost = WF.normalizeHost(tab.url);
    hostLabel.textContent = currentHost;

    const excluded = await WF.getExcludedDomains();
    const isExcluded = WF.isHostExcluded(currentHost, excluded);

    statusLabel.textContent = isExcluded ? "이 사이트에서 폰트 적용 꺼짐" : "이 사이트에서 폰트 적용 켜짐";
    toggleBtn.disabled = false;
    toggleBtn.textContent = isExcluded ? "이 사이트에서 폰트 적용 켜기" : "이 사이트에서 폰트 적용 끄기";
    toggleBtn.className = isExcluded ? "off" : "on";
  }

  toggleBtn.addEventListener("click", async () => {
    if (!currentHost) return;
    const excluded = await WF.getExcludedDomains();
    const isExcluded = WF.isHostExcluded(currentHost, excluded);

    const next = isExcluded
      ? excluded.filter((d) => !(currentHost === d || currentHost.endsWith("." + d)))
      : [...excluded, currentHost];

    await WF.setExcludedDomains(next);
    await refresh();
  });

  optionsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  refresh();
})();
