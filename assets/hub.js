// machete hub: lists every registered sheet from window.MACHETE_SHEETS.
(function () {
  const sheets = window.MACHETE_SHEETS || {};
  const el = document.getElementById("tools");
  const escapeHtml = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  const list = Object.values(sheets).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  el.innerHTML = list.map(s => {
    const n = s.sections.reduce((acc, sec) => acc + sec.items.length, 0);
    return `<a class="tool-card" href="cheatsheets/${escapeHtml(s.id)}.html">
      <h2>${escapeHtml(s.name)}</h2>
      <p>${escapeHtml(s.tagline || "")}</p>
      <span class="tool-count">${n} entries</span>
    </a>`;
  }).join("");
})();
