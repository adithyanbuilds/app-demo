/**
 * quiz-engine.js
 * ══════════════════════════════════════════════════════════
 * Central Quiz Engine — reads from window.UPSC_QUIZ_BANKS
 * populated by each quiz-context/<category>/index.js loader.
 *
 * Categories map:
 *   'history'   ← QUESTION_BANK_History.history
 *   'geography' ← QUESTION_BANK_Geography.geography
 *   'polity'    ← QUESTION_BANK_Polity.polity
 *   'economy'   ← QUESTION_BANK_Economics.economy
 *   'science'   ← QUESTION_BANK_Science.science
 *   'env_eco'   ← QUESTION_BANK_Env_Eco (object, any key)
 *   'int_rel'   ← QUESTION_BANK_Int_Rel (object, any key)
 *   'all'       ← all of the above merged
 */

"use strict";

// ── NORMALISER: called by each question-bank file after it loads ──────────────
// Each raw bank file still uses its original variable name.
// This function reads those globals and pushes them into UPSC_QUIZ_BANKS.
window._normQuizBanks = function () {
  if (!window.UPSC_QUIZ_BANKS) window.UPSC_QUIZ_BANKS = {};

  const push = function (key, arr) {
    if (!window.UPSC_QUIZ_BANKS[key]) window.UPSC_QUIZ_BANKS[key] = [];
    if (arr && arr.length) window.UPSC_QUIZ_BANKS[key].push(...arr);
  };

  if (typeof QUESTION_BANK_History !== "undefined")
    push("history", QUESTION_BANK_History.history || []);

  if (typeof QUESTION_BANK_Geography !== "undefined")
    push("geography", QUESTION_BANK_Geography.geography || []);

  if (typeof QUESTION_BANK_Polity !== "undefined")
    push("polity", QUESTION_BANK_Polity.polity || []);

  if (typeof QUESTION_BANK_Economics !== "undefined")
    push("economy", QUESTION_BANK_Economics.economy || []);

  if (typeof QUESTION_BANK_Science !== "undefined")
    push("science", QUESTION_BANK_Science.science || []);

  if (typeof QUESTION_BANK_Env_Eco !== "undefined")
    push("env_eco", Object.values(QUESTION_BANK_Env_Eco).flat());

  if (typeof QUESTION_BANK_Int_Rel !== "undefined")
    push("int_rel", Object.values(QUESTION_BANK_Int_Rel).flat());
};

// ── getQBank(category) ────────────────────────────────────────────────────────
// Returns array of questions for a given category key, or all merged for 'all'.
// Safe to call even before all files finish loading — returns what's available.
window.getQBank = function (topic) {
  // Normalise any raw globals that haven't been pushed yet
  window._normQuizBanks();

  const banks = window.UPSC_QUIZ_BANKS || {};

  if (topic === "all") {
    // Merge every category
    let pool = [];
    Object.values(banks).forEach(function (arr) {
      pool = pool.concat(arr);
    });
    if (!pool.length) return _fallback();
    return _dedupe(pool);
  }

  const arr = banks[topic] || [];
  if (!arr.length) {
    console.warn('getQBank: no questions for topic "' + topic + '"');
    return [];
  }
  return _dedupe(arr);
};

// ── getTvQs() ─────────────────────────────────────────────────────────────────
// Returns a short shuffled set of questions for the TV Quiz slide.
window.getTvQs = function () {
  const pool = window.getQBank("all");
  if (!pool.length) return _fallback();
  const shuffled = [...pool].sort(function () {
    return Math.random() - 0.5;
  });
  return shuffled.slice(0, 8).map(function (q) {
    return Object.assign(
      {
        win: "🎯 Correct! Keep the streak alive!",
        lose: q.exp || "Study this one again.",
      },
      q,
    );
  });
};

// ── shuffleArr ────────────────────────────────────────────────────────────────
window.shuffleArr = function (arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function _dedupe(arr) {
  const seen = new Set();
  return arr.filter(function (q) {
    const key = q.q;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function _fallback() {
  return [
    {
      tag: "📜 POLITY",
      q: "Which article abolishes untouchability?",
      opts: ["Art. 14", "Art. 17", "Art. 21", "Art. 32"],
      ans: 1,
      exp: "Art. 17 abolishes untouchability.",
      win: "🎯 Correct!",
      lose: "Art. 17, not 14.",
    },
    {
      tag: "🗺️ GEO",
      q: "India's longest river by total length?",
      opts: ["Yamuna", "Narmada", "Godavari", "Ganga"],
      ans: 3,
      exp: "The Ganga (~2,525 km) is India's longest.",
      win: "💧 Correct!",
      lose: "The Ganga — Godavari is longest peninsular.",
    },
  ];
}

// ── Quiz Mode Config ──────────────────────────────────────────────────────────
window.MODE_CFG = {
  mixed: {
    label: "🎯 Mixed GK",
    timeS: 60,
    total: 10,
    xpPerQ: 25,
    lives: null,
    topic: "all",
  },
  daily: {
    label: "📅 Daily Quiz",
    timeS: 60,
    total: 5,
    xpPerQ: 30,
    lives: null,
    topic: "all",
  },
  speed: {
    label: "⚡ Speed Round",
    timeS: 8,
    total: 15,
    xpPerQ: 50,
    lives: null,
    topic: "all",
  },
  weekly: {
    label: "🥇 Weekly Battle",
    timeS: 60,
    total: 20,
    xpPerQ: 25,
    lives: null,
    topic: "all",
  },
  survival: {
    label: "❤️ Survival",
    timeS: 20,
    total: 999,
    xpPerQ: 20,
    lives: 3,
    topic: "all",
  },
  // Category-specific modes — topic maps to a key in UPSC_QUIZ_BANKS
  history: {
    label: "🏛️ History",
    timeS: 60,
    total: 10,
    xpPerQ: 25,
    lives: null,
    topic: "history",
  },
  geography: {
    label: "🗺️ Geography",
    timeS: 60,
    total: 10,
    xpPerQ: 25,
    lives: null,
    topic: "geography",
  },
  polity: {
    label: "📜 Polity",
    timeS: 60,
    total: 10,
    xpPerQ: 25,
    lives: null,
    topic: "polity",
  },
  economy: {
    label: "📈 Economy",
    timeS: 60,
    total: 10,
    xpPerQ: 25,
    lives: null,
    topic: "economy",
  },
  science: {
    label: "🔬 Science",
    timeS: 60,
    total: 10,
    xpPerQ: 25,
    lives: null,
    topic: "science",
  },
  env_eco: {
    label: "🌿 Env & Ecology",
    timeS: 60,
    total: 10,
    xpPerQ: 25,
    lives: null,
    topic: "env_eco",
  },
  int_rel: {
    label: "🌐 International",
    timeS: 60,
    total: 10,
    xpPerQ: 25,
    lives: null,
    topic: "int_rel",
  },
};

// ── State ─────────────────────────────────────────────────────────────────────
window.qzMode = "mixed";
window.qzTopic = "all";
window.qzQuestions = [];
window.qzIdx = 0;
window.qzScore = 0;
window.qzXP = 0;
window.qzCorrect = 0;
window.qzAnswered = false;
window.qzTimerI = null;
window.qzTimerS = 60;
window.qzCombo = 0;
window.qzLives = {};
window.qzTotal = 10;

// ── showQuiz(mode, topic?) ─────────────────────────────────────────────────────
window.showQuiz = function (mode, topic) {
  if (mode === "weekly" || mode === "survival") {
    switchTab("premium");
    return;
  }
  switchTab("quiz");
  window.resetToLobby();
  if (mode && MODE_CFG[mode])
    setTimeout(function () {
      startQuizMode(mode, topic);
    }, 0);
};

window.resetToLobby = function () {
  document.getElementById("qz-lobby").style.display = "block";
  document.getElementById("qz-active").style.display = "none";
  document.getElementById("qz-results").style.display = "none";
};

// ── startQuizMode(mode, topic?) ───────────────────────────────────────────────
window.startQuizMode = function (mode, topicOverride) {
  clearInterval(qzTimerI);
  qzMode = mode;
  const cfg = MODE_CFG[mode];
  if (!cfg) return;

  const topic = topicOverride || cfg.topic || "all";
  qzTopic = topic;
  qzTotal = cfg.total;
  qzIdx = 0;
  qzScore = 0;
  qzXP = 0;
  qzCorrect = 0;
  qzCombo = 0;
  qzLives = cfg.lives ? { hearts: cfg.lives } : {};

  const pool = getQBank(topic);
  if (!pool.length) {
    toast("⚠️ No questions for " + topic);
    return;
  }
  qzQuestions =
    mode === "survival" ? shuffleArr(pool) : shuffleArr(pool).slice(0, qzTotal);

  document.getElementById("qz-lobby").style.display = "none";
  document.getElementById("qz-active").style.display = "block";
  document.getElementById("qz-results").style.display = "none";

  document.getElementById("qzModeBadge").textContent = cfg.label;
  document.getElementById("qz-combo-bar").style.display =
    mode === "speed" ? "flex" : "none";
  document.getElementById("qz-lifelines").style.display =
    mode === "survival" ? "flex" : "none";
  document.getElementById("qzRapidRing").style.display =
    mode === "speed" ? "block" : "none";

  if (mode === "survival") {
    ["ll-50", "ll-skip", "ll-flip"].forEach(function (id) {
      const el = document.getElementById(id);
      el.textContent = "❤️";
      el.disabled = false;
      el.style.pointerEvents = "none";
    });
    document.getElementById("llXpDisplay").textContent = "3 lives";
  }
  loadQ();
};

// ── loadQ ─────────────────────────────────────────────────────────────────────
window.loadQ = function () {
  qzAnswered = false;
  clearInterval(qzTimerI);
  const cfg = MODE_CFG[qzMode];
  const q = qzQuestions[qzIdx];

  document.getElementById("qTag").textContent = q.tag || "";
  document.getElementById("qTxt").textContent = q.q;
  document.getElementById("qNum").textContent = qzIdx + 1 + " / " + qzTotal;
  document.getElementById("qXp").textContent = "+" + qzXP + " XP";
  document.getElementById("qpf").style.width = (qzIdx / qzTotal) * 100 + "%";

  const expEl = document.getElementById("qExp");
  expEl.className = "exp";
  expEl.textContent = "";
  const wcEl = document.getElementById("qz-wildcard");
  if (wcEl) wcEl.style.display = "none";
  document.getElementById("qNxt").style.display = "none";

  const optsEl = document.getElementById("qOpts");
  optsEl.innerHTML = "";
  q.opts.forEach(function (opt, i) {
    const d = document.createElement("div");
    d.className = "opt";
    d.dataset.i = i;
    d.innerHTML =
      '<div class="opt-k">' +
      String.fromCharCode(65 + i) +
      '</div><div class="opt-lbl">' +
      opt +
      "</div>";
    d.onclick = function () {
      pickOpt(i);
    };
    optsEl.appendChild(d);
  });

  qzTimerS = cfg.timeS;
  renderTimer();
  qzTimerI = setInterval(function () {
    qzTimerS--;
    renderTimer();
    if (qzTimerS <= 0) {
      clearInterval(qzTimerI);
      if (!qzAnswered) revealAnswer(-1);
    }
  }, 1000);
  if (qzMode === "speed") updateRapidRing();
};

window.pickOpt = function (idx) {
  if (!qzAnswered) revealAnswer(idx);
};

window.revealAnswer = function (chosen) {
  if (qzAnswered) return;
  qzAnswered = true;
  clearInterval(qzTimerI);
  const q = qzQuestions[qzIdx];
  const ok = chosen === q.ans;
  const cfg = MODE_CFG[qzMode];

  document.querySelectorAll(".opt").forEach(function (el, i) {
    if (i === q.ans) el.classList.add("cor");
    else if (i === chosen) el.classList.add("wrg");
  });

  let earned = 0;
  if (ok) {
    qzCorrect++;
    qzCombo++;
    let mult = qzMode === "speed" ? Math.min(qzCombo, 4) : 1;
    earned = cfg.xpPerQ * mult;
    qzXP += earned;
    toast("⚡ +" + earned + " XP" + (mult > 1 ? " ×" + mult + " COMBO!" : ""));
    if (qzCombo % 3 === 0) confetti();
  } else {
    qzCombo = 0;
    if (qzMode === "survival" && typeof qzLives.hearts === "number") {
      qzLives.hearts--;
      ["ll-50", "ll-skip", "ll-flip"].forEach(function (id, i) {
        const el = document.getElementById(id);
        if (el) el.textContent = i < qzLives.hearts ? "❤️" : "🖤";
      });
      if (qzLives.hearts <= 0) {
        document.getElementById("qNxt").textContent = "Game Over →";
        qzTotal = qzIdx + 1;
      }
    }
  }

  if (qzMode === "speed") {
    const flames = ["💀", "🔥", "🔥🔥", "🔥🔥🔥", "🔥🔥🔥🔥"];
    const el = document.getElementById("qzComboFlames");
    const ml = document.getElementById("qzComboMult");
    if (el) el.textContent = flames[Math.min(qzCombo, 4)];
    if (ml) ml.textContent = "×" + (Math.min(qzCombo, 4) || 1);
  }

  const expEl = document.getElementById("qExp");
  if (expEl && q.exp) {
    const verdict = ok
      ? "✅ Correct!"
      : chosen === -1
        ? "⏱ Time up!"
        : "❌ Not quite!";
    expEl.innerHTML = "<strong>" + verdict + "</strong> " + q.exp;
    expEl.className = "exp show";
    setTimeout(function () {
      expEl.style.transition = "opacity 0.5s";
      expEl.style.opacity = "0";
      setTimeout(function () {
        expEl.style.opacity = "1";
        expEl.style.transition = "";
      }, 4500);
    }, 4000);
  }

  document.getElementById("qNxt").style.display = "block";
  document.getElementById("qNxt").textContent =
    qzIdx + 1 >= qzTotal ? "See Results →" : "Next →";
  document.getElementById("qXp").textContent = "+" + qzXP + " XP";
};

window.nextQ = function () {
  qzIdx++;
  if (qzIdx >= qzTotal) showResults();
  else loadQ();
};

window.refreshLifelines = function () {
  ["50", "skip", "flip"].forEach(function (ll) {
    const el = document.getElementById("ll-" + ll);
    if (el) el.disabled = !qzLives[ll];
  });
};

window.useLifeline = function (ll) {
  if (!qzLives[ll] || qzAnswered) return;
  qzLives[ll] = false;
  refreshLifelines();
  const q = qzQuestions[qzIdx];
  if (ll === "50") {
    let elim = 0;
    document.querySelectorAll(".opt").forEach(function (el, i) {
      if (i !== q.ans && elim < 2) {
        el.classList.add("hidden50");
        elim++;
      }
    });
    showWildcard("50/50 — Two wrong answers eliminated!");
  }
  if (ll === "skip") {
    clearInterval(qzTimerI);
    showWildcard("⏭ Question skipped — no XP lost!");
    qzAnswered = true;
    document.getElementById("qNxt").style.display = "block";
  }
  if (ll === "flip") {
    const pool = getQBank(qzTopic);
    const fresh = shuffleArr(
      pool.filter(function (x) {
        return !qzQuestions.includes(x);
      }),
    );
    if (fresh.length) {
      qzQuestions[qzIdx] = fresh[0];
      clearInterval(qzTimerI);
      qzAnswered = false;
      loadQ();
      showWildcard("🔄 New question loaded!");
    }
  }
};

window.showWildcard = function (msg) {
  const wc = document.getElementById("qz-wildcard");
  if (wc) {
    wc.textContent = msg;
    wc.style.display = "block";
  }
};

window.showResults = function () {
  clearInterval(qzTimerI);
  document.getElementById("qz-active").style.display = "none";
  document.getElementById("qz-results").style.display = "flex";
  const pct = Math.round((qzCorrect / qzTotal) * 100);
  const trophy = pct >= 80 ? "🏆" : pct >= 60 ? "🥈" : pct >= 40 ? "🥉" : "📚";
  const title =
    pct >= 80
      ? "Outstanding!"
      : pct >= 60
        ? "Good Job!"
        : pct >= 40
          ? "Keep Going!"
          : "Keep Practising!";
  document.getElementById("qzrTrophy").textContent = trophy;
  document.getElementById("qzrTitle").textContent = title;
  document.getElementById("qzrScore").textContent = qzCorrect + " / " + qzTotal;
  document.getElementById("qzrXp").textContent = "+" + qzXP + " XP earned";
  document.getElementById("qzrStats").innerHTML =
    '<div class="qzr-stat"><div class="qzr-stat-v">' +
    pct +
    '%</div><div class="qzr-stat-l">Accuracy</div></div>' +
    '<div class="qzr-stat"><div class="qzr-stat-v">' +
    qzCombo +
    '</div><div class="qzr-stat-l">Best Combo</div></div>' +
    '<div class="qzr-stat"><div class="qzr-stat-v">' +
    qzXP +
    '</div><div class="qzr-stat-l">XP Earned</div></div>';
  if (pct >= 80) confetti();
};

window.restartQuiz = function () {
  document.getElementById("qz-results").style.display = "none";
  startQuizMode(qzMode);
};

window.quitQuiz = function () {
  clearInterval(qzTimerI);
  resetToLobby();
};

window.renderTimer = function () {
  const e = document.getElementById("qzT");
  const d = document.getElementById("qzDot");
  const cfg = MODE_CFG[qzMode];
  const secs = qzTimerS;
  if (e) {
    e.textContent =
      cfg.timeS >= 60
        ? "0" +
          Math.floor(secs / 60) +
          ":" +
          (secs % 60).toString().padStart(2, "0")
        : secs + "s";
    e.style.color =
      secs <= 5
        ? "#f87171"
        : secs <= Math.floor(cfg.timeS * 0.3)
          ? "#ffd700"
          : "var(--txt)";
  }
  if (d) {
    d.style.background = secs <= 5 ? "#f87171" : "#4ade80";
    d.style.boxShadow = secs <= 5 ? "0 0 9px #f87171" : "0 0 9px #4ade80";
  }
  if (qzMode === "speed") updateRapidRing();
};

window.updateRapidRing = function () {
  const arc = document.getElementById("rapidArc");
  const num = document.getElementById("rapidNum");
  const cfg = MODE_CFG.speed;
  const pct = qzTimerS / cfg.timeS;
  if (arc) {
    arc.style.strokeDashoffset = 81.7 * (1 - pct);
    arc.style.stroke =
      qzTimerS <= 3 ? "#f87171" : qzTimerS <= 5 ? "#ffd700" : "#00ff88";
  }
  if (num) num.textContent = qzTimerS;
};
