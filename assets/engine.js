// Generic machete engine: reads the sheet named by window.MACHETE_ID from
// window.MACHETE_SHEETS and renders the fuzzy-finder UI.
(function () {
  const sheets = window.MACHETE_SHEETS || {};
  const sheet = sheets[window.MACHETE_ID];
  if (!sheet) { console.error("machete: sheet not found:", window.MACHETE_ID); return; }

  // Nicer rendering for a few Vim key tokens.
  const KEY_DISPLAY = {
    "<space>": "␣", "<CR>": "⏎", "<Esc>": "Esc",
    "<Tab>": "⇥", "<S-Tab>": "⇧⇥",
  };

  const doc = document;
  doc.title = `${sheet.name} cheatsheet — machete`;

  const ph = sheet.placeholder || null;
  let phValue = ph ? (ph.default ?? ph.values[0]) : null;

  const ITEMS = [];
  for (const section of sheet.sections) {
    for (const item of section.items) {
      ITEMS.push(Object.assign({}, item, {
        cat: section.title,
        mode: Array.isArray(item.mode) ? item.mode.join("/") : item.mode,
      }));
    }
  }
  const CATS = ["All", ...sheet.sections.map(s => s.title)];

  let activeCat = "All";
  let filtered = [];
  let sel = 0;

  const titleEl = doc.getElementById("title");
  const taglineEl = doc.getElementById("tagline");
  const q = doc.getElementById("q");
  const results = doc.getElementById("results");
  const count = doc.getElementById("count");
  const chipsEl = doc.getElementById("chips");
  const clearBtn = doc.getElementById("clear");
  const toast = doc.getElementById("toast");
  const toggleEl = doc.getElementById("toggle");

  titleEl.innerHTML = escapeHtml(sheet.name) + " <span>cheatsheet</span>";
  taglineEl.textContent = sheet.tagline || "";
  q.placeholder = sheet.searchPlaceholder || "fuzzy search…";

  if (ph && toggleEl) {
    toggleEl.innerHTML =
      `<span class="toggle-label">${escapeHtml(ph.name)}</span>` +
      ph.values.map(v =>
        `<button data-v="${escapeHtml(v)}" class="${v === phValue ? "active" : ""}">${escapeHtml(v)}</button>`
      ).join("");
    toggleEl.querySelectorAll("button").forEach(b => {
      b.onclick = () => {
        phValue = b.dataset.v;
        toggleEl.querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b));
        applyFilter();
        q.focus();
      };
    });
  } else if (toggleEl) {
    toggleEl.style.display = "none";
  }

  function substitute(tok) {
    return ph ? tok.split(`{${ph.name}}`).join(phValue) : tok;
  }
  function displayToken(tok) { return KEY_DISPLAY[tok] || tok; }

  // Turn item.keys into display sequences (arrays of tokens) plus a flat
  // display string used for searching and highlighting.
  function buildKeys(item) {
    const raw = Array.isArray(item.keys) ? item.keys : [item.keys];
    const seqs = raw.map(k => k.trim().split(/\s+/).map(t => displayToken(substitute(t))));
    let display = "";
    seqs.forEach((seq, si) => {
      if (si > 0) display += " or ";
      seq.forEach((tok, ti) => {
        if (ti > 0) display += " ";
        display += tok;
      });
    });
    const usesPh = !!ph && raw.some(k => k.includes(`{${ph.name}}`));
    return { seqs, display, usesPh };
  }

  // --- fuzzy core: subsequence match with scoring ---
  function fuzzyIndices(token, text) {
    token = token.toLowerCase(); text = text.toLowerCase();
    let ti = 0, indices = [], score = 0, consec = 0, lastPos = -2;
    for (let i = 0; i < text.length && ti < token.length; i++) {
      if (text[i] === token[ti]) {
        indices.push(i);
        if (i === 0) score += 10;
        else if (" /-_.:".includes(text[i - 1])) score += 8;
        if (i === lastPos + 1) { consec++; score += 4 + consec; } else consec = 0;
        score += 1;
        lastPos = i; ti++;
      }
    }
    if (ti < token.length) return null;
    score -= (indices[indices.length - 1] - indices[0]) * 0.1;
    return { indices, score };
  }

  function matchItem(item, query) {
    const keys = item._keys.display;
    const phName = (ph && item._keys.usesPh) ? ph.name + " " : "";
    const hay = phName + keys + " " + item.desc + " " + (item.cmd || "") + " " + item.cat + " " + (item.mode || "");
    const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return { score: 0, hl: null };
    let total = 0;
    const hl = {};
    for (const tok of tokens) {
      let best = null, bestField = null;
      for (const [field, val] of [["keys", keys], ["desc", item.desc], ["cmd", item.cmd || ""]]) {
        const m = fuzzyIndices(tok, val);
        if (m && (!best || m.score > best.score)) { best = m; bestField = field; }
      }
      const mHay = fuzzyIndices(tok, hay);
      if (!mHay) return null;
      total += (best ? best.score + 5 : mHay.score);
      if (best) {
        hl[bestField] = hl[bestField] || new Set();
        best.indices.forEach(i => hl[bestField].add(i));
      }
    }
    return { score: total, hl };
  }

  function highlight(text, set, offset) {
    offset = offset || 0;
    if (!set || !set.size) return escapeHtml(text);
    let out = "";
    for (let i = 0; i < text.length; i++) {
      const c = escapeHtml(text[i]);
      out += set.has(offset + i) ? `<mark>${c}</mark>` : c;
    }
    return out;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  function seqsHtml(seqs, hlKeys) {
    let cursor = 0, out = "";
    seqs.forEach((seq, si) => {
      if (si > 0) { out += '<span class="or">or</span>'; cursor += 4; }
      seq.forEach((tok, ti) => {
        if (ti > 0) { out += " "; cursor += 1; }
        out += `<kbd>${highlight(tok, hlKeys, cursor)}</kbd>`;
        cursor += tok.length;
      });
    });
    return out;
  }

  function applyFilter() {
    const query = q.value;
    clearBtn.style.display = query ? "block" : "none";
    const out = [];
    for (const item of ITEMS) {
      item._keys = buildKeys(item);
      if (activeCat !== "All" && item.cat !== activeCat) continue;
      const m = matchItem(item, query);
      if (m) out.push(Object.assign({}, item, { _score: m.score, _hl: m.hl }));
    }
    if (query.trim()) out.sort((a, b) => b._score - a._score);
    filtered = out;
    sel = Math.min(sel, Math.max(0, filtered.length - 1));
    if (!query.trim()) sel = 0;
    render();
  }

  function render() {
    chipsEl.innerHTML = CATS.map(c => {
      const n = c === "All" ? ITEMS.length : ITEMS.filter(d => d.cat === c).length;
      return `<button class="chip ${c === activeCat ? "active" : ""}" data-cat="${escapeHtml(c)}">${escapeHtml(c)} · ${n}</button>`;
    }).join("");
    chipsEl.querySelectorAll(".chip").forEach(b => b.onclick = () => {
      activeCat = b.dataset.cat; sel = 0; applyFilter(); q.focus();
    });

    count.textContent = `${filtered.length} / ${ITEMS.length} results` + (q.value ? ` for "${q.value}"` : "");

    if (!filtered.length) {
      results.innerHTML = `<div class="empty">No matches. Try "pane", "split", "buffer", "git", "format".<br><br><button class="chip" onclick="document.getElementById('q').value='';document.getElementById('q').dispatchEvent(new Event('input'))">clear search</button></div>`;
      return;
    }

    const queryEmpty = !q.value.trim();
    if (queryEmpty && activeCat === "All") {
      results.innerHTML = CATS.slice(1).map(cat => {
        const items = filtered.filter(f => f.cat === cat);
        if (!items.length) return "";
        return `<h2 class="cat">${escapeHtml(cat)} — ${items.length}</h2><div class="grid">${items.map(cardHtml).join("")}</div>`;
      }).join("");
    } else {
      results.innerHTML = `<div class="grid">${filtered.map(cardHtml).join("")}</div>`;
    }

    doc.querySelectorAll(".card").forEach((el, i) => {
      el.classList.toggle("selected", i === sel);
      el.onclick = () => copyCard(filtered[i], el);
      el.onmouseenter = () => { sel = i; paintSel(); };
    });
  }

  function cardHtml(item) {
    const i = filtered.indexOf(item);
    const hl = item._hl || {};
    const modeTag = item.mode ? `<span class="mode-tag">${escapeHtml(item.mode)}</span>` : "";
    return `<div class="card" data-i="${i}">
      <div class="keys">${seqsHtml(item._keys.seqs, hl.keys)}
        <span class="tags">${modeTag}<span class="cat-tag">${escapeHtml(item.cat)}</span></span></div>
      <div class="desc">${highlight(item.desc, hl.desc)}</div>
      ${item.cmd ? `<div class="cmd"><span>${highlight(item.cmd, hl.cmd)}</span><span style="opacity:.6">⧉</span></div>` : ""}
    </div>`;
  }

  function paintSel() {
    doc.querySelectorAll(".card").forEach((el, i) => el.classList.toggle("selected", i === sel));
    doc.querySelectorAll(".card")[sel]?.scrollIntoView({ block: "nearest" });
  }

  function copyText(t) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(t);
    const ta = doc.createElement("textarea");
    ta.value = t; doc.body.appendChild(ta); ta.select();
    doc.execCommand("copy"); ta.remove();
    return Promise.resolve();
  }
  function copyCard(item) {
    if (!item) return;
    const text = item.copy || item.cmd || item._keys.display;
    copyText(text).then(() => {
      toast.textContent = `copied: ${text}`;
      toast.classList.add("show");
      clearTimeout(toast._t);
      toast._t = setTimeout(() => toast.classList.remove("show"), 1400);
    });
  }

  q.addEventListener("input", () => { sel = 0; applyFilter(); });
  clearBtn.onclick = () => { q.value = ""; sel = 0; applyFilter(); q.focus(); };

  doc.addEventListener("keydown", e => {
    if (e.key === "/" && doc.activeElement !== q) { e.preventDefault(); q.focus(); }
    if (doc.activeElement === q) {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); paintSel(); }
      if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); paintSel(); }
      if (e.key === "Enter") { e.preventDefault(); copyCard(filtered[sel]); }
      if (e.key === "Escape") { q.value = ""; sel = 0; applyFilter(); }
    }
  });

  applyFilter();
  q.focus();
})();
