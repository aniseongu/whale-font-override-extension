// options.js
// Full management UI for the exclude list: add any domain, remove any
// domain. The popup's quick toggle writes to the same storage key, so
// anything added there shows up here too.
(function () {
  "use strict";

  const input = document.getElementById("domainInput");
  const addBtn = document.getElementById("addBtn");
  const list = document.getElementById("list");
  const emptyMsg = document.getElementById("emptyMsg");

  async function render() {
    const excluded = await WF.getExcludedDomains();
    list.innerHTML = "";
    emptyMsg.style.display = excluded.length ? "none" : "block";

    for (const domain of excluded) {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.textContent = domain;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "삭제";
      removeBtn.addEventListener("click", async () => {
        const current = await WF.getExcludedDomains();
        await WF.setExcludedDomains(current.filter((d) => d !== domain));
        render();
      });

      li.appendChild(span);
      li.appendChild(removeBtn);
      list.appendChild(li);
    }
  }

  async function addDomain() {
    const domain = WF.normalizeHost(input.value);
    if (!domain) return;
    const excluded = await WF.getExcludedDomains();
    if (!excluded.includes(domain)) {
      await WF.setExcludedDomains([...excluded, domain]);
    }
    input.value = "";
    input.focus();
    render();
  }

  addBtn.addEventListener("click", addDomain);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addDomain();
  });

  render();
})();
