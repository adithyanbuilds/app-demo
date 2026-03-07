/**
 * subject-engine.js
 * ══════════════════════════════════════════════════════════
 * Subject Reader Engine — reads all GS paper arrays loaded
 * by subject-context/<paper>/index.js files.
 *
 * Each paper .js file exports a top-level array variable like:
 *   const GsPaper1_2025 = [{ id, category, question, answer }, ...]
 *   const GsPaper2_2025 = [{ id, category, question, answer }, ...]
 *
 * Cards are merged from ALL detected GsPaperX_YYYY global arrays.
 */

"use strict";

// ── Category visual metadata ──────────────────────────────────────────────────
window.CATEGORY_META = {
  Economy: {
    ic: "📈",
    grad: "linear-gradient(90deg,#4ade80,#a3e635)",
    color: "#4ade80",
  },
  History: {
    ic: "🏛️",
    grad: "linear-gradient(90deg,#f5a623,#f472b6)",
    color: "#f5a623",
  },
  Polity: {
    ic: "📜",
    grad: "linear-gradient(90deg,#a78bfa,#c084fc)",
    color: "#a78bfa",
  },
  Geography: {
    ic: "🗺️",
    grad: "linear-gradient(90deg,#22d3ee,#38bdf8)",
    color: "#22d3ee",
  },
  Science: {
    ic: "🔬",
    grad: "linear-gradient(90deg,#f87171,#fb923c)",
    color: "#f87171",
  },
  "Science & Tech": {
    ic: "🔬",
    grad: "linear-gradient(90deg,#f87171,#fb923c)",
    color: "#f87171",
  },
  Environment: {
    ic: "🌿",
    grad: "linear-gradient(90deg,#34d399,#6ee7b7)",
    color: "#34d399",
  },
  "Env & Ecology": {
    ic: "🌿",
    grad: "linear-gradient(90deg,#34d399,#6ee7b7)",
    color: "#34d399",
  },
  "International Relations": {
    ic: "🌐",
    grad: "linear-gradient(90deg,#60a5fa,#818cf8)",
    color: "#60a5fa",
  },
  "Social Issues": {
    ic: "🤝",
    grad: "linear-gradient(90deg,#f9a8d4,#fda4af)",
    color: "#f9a8d4",
  },
  "Art & Culture": {
    ic: "🎭",
    grad: "linear-gradient(90deg,#fbbf24,#f59e0b)",
    color: "#fbbf24",
  },
  "Current Affairs": {
    ic: "📰",
    grad: "linear-gradient(90deg,#e879f9,#a855f7)",
    color: "#e879f9",
  },
  Agriculture: {
    ic: "🌾",
    grad: "linear-gradient(90deg,#86efac,#4ade80)",
    color: "#86efac",
  },
  Governance: {
    ic: "🏛️",
    grad: "linear-gradient(90deg,#c084fc,#a78bfa)",
    color: "#c084fc",
  },
  "Disaster Management": {
    ic: "⚠️",
    grad: "linear-gradient(90deg,#fbbf24,#ef4444)",
    color: "#fbbf24",
  },
  Ethics: {
    ic: "⚖️",
    grad: "linear-gradient(90deg,#818cf8,#6366f1)",
    color: "#818cf8",
  },
  "Internal Security": {
    ic: "🛡️",
    grad: "linear-gradient(90deg,#64748b,#475569)",
    color: "#64748b",
  },
};

window.getCatMeta = function (name) {
  if (CATEGORY_META[name]) return CATEGORY_META[name];
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_META)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower))
      return val;
  }
  return {
    ic: "📖",
    grad: "linear-gradient(90deg,#94a3b8,#cbd5e1)",
    color: "#94a3b8",
  };
};

// ── getAllGsCards() — gathers all loaded GsPaperX_YYYY arrays ─────────────────
window.getAllGsCards = function () {
  let all = [];
  // Find every global variable whose name starts with 'GsPaper'
  Object.keys(window).forEach(function (key) {
    if (/^GsPaper\d+_\d{4}$/.test(key) && Array.isArray(window[key])) {
      all = all.concat(window[key]);
    }
  });
  return all;
};

window.getGsCardsByCategory = function (categoryEncoded) {
  const all = getAllGsCards();
  if (!categoryEncoded || categoryEncoded === "all") return all;
  const lower = decodeURIComponent(categoryEncoded).toLowerCase();
  return all.filter(
    (c) => c.category && c.category.toLowerCase().includes(lower),
  );
};

window.getGsCategories = function () {
  const all = getAllGsCards();
  const cats = {};
  all.forEach((c) => {
    if (c.category) {
      const key = c.category.trim();
      cats[key] = (cats[key] || 0) + 1;
    }
  });
  return Object.entries(cats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

// ── Dynamic Subject Study Grid ────────────────────────────────────────────────
window.buildSubjectStudyGrid = function () {
  const grid = document.getElementById("subj-study-dynamic");
  if (!grid) return;
  const cats = getGsCategories();
  if (cats.length === 0) {
    grid.innerHTML =
      '<div style="padding:22px 16px;text-align:center;color:var(--mut);font-size:11px;"><div style="font-size:28px;margin-bottom:8px;">📂</div><strong style="color:var(--txt);">No GS files loaded yet</strong><br>Add .js to subject-context/ folders and reload.</div>';
    return;
  }
  grid.innerHTML = cats
    .map(({ name, count }) => {
      const m = getCatMeta(name);
      const enc = encodeURIComponent(name);
      return `<div class="subj-study-card" onclick="openSubjectReader('${enc}')">
      <div class="ssc-glow" style="background:${m.color}"></div>
      <div class="ssc-ic">${m.ic}</div>
      <div class="ssc-info">
        <div class="ssc-nm">${name}</div>
        <div class="ssc-ct">${count} card${count !== 1 ? "s" : ""} · swipe to read</div>
      </div>
      <div class="ssc-bar"><div class="ssc-fill" style="width:0%;background:${m.grad};transition:width 1s ease;"></div></div>
      <div class="ssc-chevron">›</div>
    </div>`;
    })
    .join("");
  requestAnimationFrame(() => {
    setTimeout(() => {
      grid
        .querySelectorAll(".ssc-fill")
        .forEach((el) => (el.style.width = "15%"));
    }, 120);
  });
};

// ── Subject Reader State ───────────────────────────────────────────────────────
window.srSubject = null;
window.srIdx = 0;
window.srCards = [];
let _srDragStartX = 0,
  _srDragging = false;

window.openSubjectReader = function (categoryEncoded) {
  const category = decodeURIComponent(categoryEncoded);
  const rawCards = getGsCardsByCategory(categoryEncoded);
  if (!rawCards.length) {
    toast("⚠️ No cards found for " + category);
    return;
  }

  srSubject = category;
  srCards = rawCards.map((c) => ({
    q: c.question,
    ans: c.answer,
    tag: c.category,
  }));
  srIdx = 0;

  const m = getCatMeta(category);
  document.getElementById("srSubjectIc").textContent = m.ic;
  document.getElementById("srSubjectNm").textContent = category;

  const track = document.getElementById("srTrack");
  track.innerHTML = srCards
    .map(
      (card, i) => `
    <div class="sr-card">
      <div class="sr-card-glow" style="background:${m.color};"></div>
      <div class="sr-card-tag">${m.ic} ${category.toUpperCase()} · CARD ${i + 1} of ${srCards.length}</div>
      <div class="sr-card-q">${card.q}</div>
      <div class="sr-card-divider"></div>
      <div class="sr-card-ans-lbl">✦ KEY ANSWER</div>
      <div class="sr-card-ans">${card.ans}</div>
    </div>`,
    )
    .join("");

  const dotsEl = document.getElementById("srDots");
  const dotCount = Math.min(srCards.length, 8);
  dotsEl.innerHTML = Array.from(
    { length: dotCount },
    (_, i) => `<div class="sr-dot" id="srd${i}"></div>`,
  ).join("");

  srGoTo(0);

  const vp = document.getElementById("srViewport");
  vp.removeEventListener("touchstart", _srTouchStart);
  vp.removeEventListener("touchend", _srTouchEnd);
  vp.removeEventListener("mousedown", _srMouseDown);
  vp.removeEventListener("mouseup", _srMouseUp);
  vp.addEventListener("touchstart", _srTouchStart, { passive: true });
  vp.addEventListener("touchend", _srTouchEnd, { passive: true });
  vp.addEventListener("mousedown", _srMouseDown);
  vp.addEventListener("mouseup", _srMouseUp);

  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById("subject-reader").classList.add("active");
};

window.closeSubjectReader = function () {
  switchTab("learn");
};

window.srGoTo = function (idx) {
  idx = Math.max(0, Math.min(srCards.length - 1, idx));
  srIdx = idx;
  document.getElementById("srTrack").style.transform =
    `translateX(-${idx * 100}%)`;
  const pct = srCards.length > 1 ? (idx / (srCards.length - 1)) * 100 : 100;
  document.getElementById("srProgBar").style.width = Math.max(4, pct) + "%";
  document.getElementById("srCounter").textContent =
    `${idx + 1} / ${srCards.length}`;
  document.getElementById("srProgressTxt").textContent =
    `Card ${idx + 1} of ${srCards.length}`;
  const dotCount = Math.min(srCards.length, 8);
  const dotIdx = Math.round((idx / (srCards.length - 1 || 1)) * (dotCount - 1));
  for (let i = 0; i < dotCount; i++) {
    const d = document.getElementById("srd" + i);
    if (d) d.className = "sr-dot" + (i === dotIdx ? " on" : "");
  }
  document.getElementById("srPrev").disabled = idx === 0;
  const nxt = document.getElementById("srNext");
  nxt.disabled = false;
  if (idx === srCards.length - 1) {
    nxt.textContent = "Done ✓";
    nxt.onclick = closeSubjectReader;
  } else {
    nxt.textContent = "Next ›";
    nxt.onclick = () => srGoTo(srIdx + 1);
  }
};

function _srTouchStart(e) {
  _srDragStartX = e.touches[0].clientX;
  _srDragging = true;
}
function _srTouchEnd(e) {
  if (!_srDragging) return;
  _srDragging = false;
  const dx = e.changedTouches[0].clientX - _srDragStartX;
  if (Math.abs(dx) > 40) srGoTo(srIdx + (dx < 0 ? 1 : -1));
}
function _srMouseDown(e) {
  _srDragStartX = e.clientX;
  _srDragging = true;
}
function _srMouseUp(e) {
  if (!_srDragging) return;
  _srDragging = false;
  const dx = e.clientX - _srDragStartX;
  if (Math.abs(dx) > 40) srGoTo(srIdx + (dx < 0 ? 1 : -1));
}
