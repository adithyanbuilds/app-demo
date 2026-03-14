/**
 * quiz-engine.js
 * ══════════════════════════════════════════════════════════
 * Central Quiz Engine — reads from window.UPSC_QUIZ_BANKS
 */

"use strict";

/* ── NORMALISER ───────────────────────────────────────── */

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

/* ── getQBank ───────────────────────────────────────── */

window.getQBank = function (topic) {
  window._normQuizBanks();

  const banks = window.UPSC_QUIZ_BANKS || {};

  if (topic === "all") {
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

/* ── TV SLIDE MODE ───────────────────────────────────── */
window.getTvQs = function () {
  const pool = window.getQBank("all");
  if (!pool.length) return _fallbackTv();
  const shuffled = [...pool].sort(function () { return Math.random() - 0.5; });
  return shuffled.slice(0, 20).map(function (q) {
    return { tag: q.tag || "", question: q.q, answer: q.opts[q.ans] };
  });
};

window.getRandomTvQuestion = function () {
  const pool = window.getQBank("all");
  if (!pool.length) return _fallbackTv()[0];
  const q = pool[Math.floor(Math.random() * pool.length)];
  return { tag: q.tag || "", question: q.q, answer: q.opts[q.ans] };
};

/* ── shuffleArr ─────────────────────────────────────── */
window.shuffleArr = function (arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ── Helpers ────────────────────────────────────────── */
function _dedupe(arr) {
  const seen = new Set();
  return arr.filter(function (q) {
    if (seen.has(q.q)) return false;
    seen.add(q.q);
    return true;
  });
}

function _fallbackTv() {
  return [
    { tag: "📜 POLITY", question: "Which article abolishes untouchability?", answer: "Article 17" },
    { tag: "🗺️ GEO", question: "India's longest river by total length?", answer: "Ganga" },
  ];
}

function _fallback() {
  return [
    { tag: "📜 POLITY", q: "Which article abolishes untouchability?", opts: ["Art. 14", "Art. 17", "Art. 21", "Art. 32"], ans: 1, exp: "Art. 17 abolishes untouchability.", win: "🎯 Correct!", lose: "Art. 17, not 14." },
    { tag: "🗺️ GEO", q: "India's longest river by total length?", opts: ["Yamuna", "Narmada", "Godavari", "Ganga"], ans: 3, exp: "The Ganga (~2,525 km) is India's longest.", win: "💧 Correct!", lose: "The Ganga — Godavari is longest peninsular." },
  ];
}

/* ── XP & Daily Persistence Systems ───────────────────── */

window.checkAndResetWeeklyXP = function() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  const weekStr = d.getUTCFullYear() + '-W' + weekNo;

  const lastReset = localStorage.getItem('upsc_week_reset');
  if (lastReset !== weekStr) {
    localStorage.setItem('upsc_week_reset', weekStr);
    localStorage.setItem('upsc_user_xp', '0');
    localStorage.setItem('upsc_mastery', '{}'); // Wipe mastery on Monday too!
    if (window.toast) toast("📅 New week! XP and Mastery have been reset for Monday.");
  }
  window.UPSC_USER_XP = parseInt(localStorage.getItem('upsc_user_xp') || '0', 10);
};

window.checkDailyLock = function() {
  const lastPlayed = localStorage.getItem('upsc_daily_played');
  const today = new Date().toDateString();
  if (lastPlayed === today) {
    const now = new Date();
    const tmr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diff = tmr - now;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `Locked. Come back in ${hrs}h ${mins}m for the next Daily Quiz!`;
  }
  return null;
};

// Real user stats start empty and populate on play
const defMastery = '{}';
window.UPSC_MASTERY = JSON.parse(localStorage.getItem('upsc_mastery') || defMastery);

// Initial verification on load
window.checkAndResetWeeklyXP();


/* ── Quiz Mode Config ───────────────────────────────── */

window.MODE_CFG = {
  mixed: {
    label: "🎯 Mixed GK", timeS: 60, total: 10, xpPerQ: 10, lives: null, topic: "all",
  },
  daily: {
    label: "📅 Daily Quiz", timeS: 60, total: 10, xpPerQ: 40, lives: null, topic: "all",
  },
  speed: {
    label: "⚡ Speed Round", timeS: 8, total: 15, xpPerQ: 50, lives: null, topic: "all",
  },
  subject_mode: {
    label: "📚 Topic Quiz", timeS: 60, total: 10, xpPerQ: 25, lives: null, topic: "all", // topic overridden at start
  },
  // the rest is fallback map logic
  history:   { label: "🏛️ History", timeS: 60, total: 10, xpPerQ: 25, lives: null, topic: "history" },
  geography: { label: "🗺️ Geography", timeS: 60, total: 10, xpPerQ: 25, lives: null, topic: "geography" },
  polity:    { label: "📜 Polity", timeS: 60, total: 10, xpPerQ: 25, lives: null, topic: "polity" },
  economy:   { label: "📈 Economy", timeS: 60, total: 10, xpPerQ: 25, lives: null, topic: "economy" },
  science:   { label: "🔬 Science", timeS: 60, total: 10, xpPerQ: 25, lives: null, topic: "science" },
  env_eco:   { label: "🌿 Env & Ecology", timeS: 60, total: 10, xpPerQ: 25, lives: null, topic: "env_eco" },
  int_rel:   { label: "🌐 International", timeS: 60, total: 10, xpPerQ: 25, lives: null, topic: "int_rel" },
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
  // Check daily lock IMMEDIATELY
  if (mode === "daily") {
    const lockMsg = window.checkDailyLock();
    if (lockMsg) {
      if (window.toast) toast(lockMsg);
      return; 
    }
  }

  if (mode === "weekly" || mode === "survival") {
    // Should be hijacked anyway, but catch just in case
    window.showSubjectPicker();
    return;
  }
  switchTab("quiz");
  window.resetToLobby();
  if (mode && MODE_CFG[mode]) {
    setTimeout(function () {
      startQuizMode(mode, topic);
    }, 0);
  }
};

window.resetToLobby = function () {
  document.getElementById("qz-lobby").style.display = "block";
  document.getElementById("qz-active").style.display = "none";
  document.getElementById("qz-results").style.display = "none";
};

// ── UI Injection for Subject Picker ──────────────────────────────────────────
window.showSubjectPicker = function() {
  if (document.getElementById('sys-sub-picker')) {
    document.getElementById('sys-sub-picker').style.display = 'flex';
    return;
  }
  const div = document.createElement('div');
  div.id = 'sys-sub-picker';
  div.style.cssText = "display:flex; position:fixed; inset:0; background:rgba(0,5,15,0.85); backdrop-filter:blur(10px); z-index:99999; flex-direction:column; align-items:center; justify-content:center; gap:12px;";
  
  const hd = document.createElement('div');
  hd.style.color = '#fff'; hd.style.fontSize = '24px'; hd.style.fontWeight = '900'; 
  hd.style.fontFamily = "'Syne', sans-serif"; hd.style.marginBottom = '10px';
  hd.textContent = "Select Topic";
  div.appendChild(hd);

  const topics = [
    {k: 'history', n: '🏛️ History'},
    {k: 'geography', n: '🗺️ Geography'},
    {k: 'polity', n: '📜 Polity'},
    {k: 'economy', n: '📈 Economy'},
    {k: 'science', n: '🔬 Science'}
  ];

  topics.forEach(t => {
    const btn = document.createElement('button');
    btn.innerHTML = `<span style="font-size:18px">${t.n.split(' ')[0]}</span> ${t.n.split(' ')[1]}`;
    btn.style.cssText = "padding:16px 24px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:16px; width:220px; font-weight:800; font-family:'Plus Jakarta Sans', sans-serif; display:flex; gap:10px; align-items:center; transition:0.2s;";
    btn.onclick = () => { 
      div.style.display = 'none'; 
      switchTab('quiz'); 
      startQuizMode('subject_mode', t.k); 
    };
    div.appendChild(btn);
  });
  
  const close = document.createElement('button');
  close.textContent = "Cancel";
  close.style.cssText = "padding:12px 24px; background:transparent; color:rgba(255,255,255,0.5); font-weight:700; border:none; margin-top:10px; font-family:'Plus Jakarta Sans', sans-serif;";
  close.onclick = () => { div.style.display = 'none'; };
  div.appendChild(close);
  
  document.body.appendChild(div);
};

// Intercept original hard-coded UI buttons so we don't need to change learn.html
window.syncUIExperiencePoints = function() {
  if (typeof window.UPSC_USER_XP === 'undefined') return;
  const currentXPStr = window.UPSC_USER_XP.toLocaleString("en-US");
  
  // Update memory objects
  if (window.shoutoutData) {
    window.shoutoutData.forEach(d => { if (d.you) d.xp = currentXPStr; });
  }
  if (window.tickerItems) {
    window.tickerItems.forEach(t => { 
      if (t.txt.includes('Your XP:')) t.txt = `⚡ Your XP: ${currentXPStr}`; 
    });
  }
  
  // Update DOM text spans native to the HTML
  document.querySelectorAll('.sync-xp').forEach(el => el.textContent = currentXPStr);
  const rem = Math.max(0, 3500 - window.UPSC_USER_XP);
  document.querySelectorAll('.sync-xp-rem').forEach(el => el.textContent = rem.toLocaleString("en-US"));
  
  // Update XP Progress Bars
  const xpPct = Math.min(100, Math.max(0, (window.UPSC_USER_XP / 3500) * 100));
  document.querySelectorAll('.sync-xp-bar').forEach(el => el.style.width = xpPct + '%');
};

window.syncUIMastery = function() {
  const m = window.UPSC_MASTERY || {};
  const subjects = ['history', 'science', 'geography', 'polity', 'economy'];
  
  subjects.forEach(k => {
    let stat = m[k];
    let pct = 0;
    if (stat && stat.t > 0) pct = Math.round((stat.c / stat.t)*100);
    
    let pctEls = document.querySelectorAll('.mast-' + k + '-pct');
    let barEls = document.querySelectorAll('.mast-' + k + '-bar');
    pctEls.forEach(el => el.textContent = pct + '%');
    barEls.forEach(el => el.style.width = pct + '%');
  });
};

// Polling interval to ensure initial sync runs after index.html fetches the templates
const _syncInterval = setInterval(() => {
  if (document.querySelector('.sync-xp')) {
    window.syncUIExperiencePoints();
    window.syncUIMastery();
    clearInterval(_syncInterval);
  }
}, 100);

// ── startQuizMode(mode, topic?) ───────────────────────────────────────────────
window.startQuizMode = function (mode, topicOverride) {
  clearInterval(qzTimerI);

  if (mode === "daily") {
    const lockMsg = window.checkDailyLock();
    if (lockMsg) { if (window.toast) toast(lockMsg); return; }
  }

  qzMode = mode;
  const cfg = MODE_CFG[mode];
  if (!cfg) return;

  const topic = topicOverride || cfg.topic || "all";
  qzTopic = topic;
  qzTotal = cfg.total;
  qzIdx = 0; qzScore = 0; qzXP = 0; qzCorrect = 0; qzCombo = 0;
  qzLives = cfg.lives ? { hearts: cfg.lives } : {};

  const pool = getQBank(topic);
  if (!pool.length) {
    if (window.toast) toast("⚠️ No questions for " + topic);
    return;
  }
  qzQuestions = shuffleArr(pool).slice(0, qzTotal);

  document.getElementById("qz-lobby").style.display = "none";
  document.getElementById("qz-active").style.display = "block";
  document.getElementById("qz-results").style.display = "none";

  // Dynamic Badge update for Topic Mode
  let badgeTxt = cfg.label;
  if (mode === 'subject_mode') badgeTxt = `📚 ${topic.toUpperCase()}`;
  document.getElementById("qzModeBadge").textContent = badgeTxt;

  document.getElementById("qz-combo-bar").style.display = mode === "speed" ? "flex" : "none";
  document.getElementById("qz-lifelines").style.display = mode === "survival" ? "flex" : "none";
  document.getElementById("qzRapidRing").style.display = mode === "speed" ? "block" : "none";

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
    d.className = "opt"; d.dataset.i = i;
    d.innerHTML = '<div class="opt-k">' + String.fromCharCode(65 + i) + '</div><div class="opt-lbl">' + opt + "</div>";
    d.onclick = function () { pickOpt(i); };
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

  // Track Mastery dynamically based on tags or topic
  let sub = qzTopic;
  if (sub === 'all' && q.tag) {
     const t = q.tag.toLowerCase();
     if(t.includes('hist')) sub = 'history';
     else if(t.includes('geo')) sub = 'geography';
     else if(t.includes('poli')) sub = 'polity';
     else if(t.includes('eco')) sub = 'economy';
     else if(t.includes('sci')) sub = 'science';
     else if(t.includes('env')) sub = 'env_eco';
     else if(t.includes('int')) sub = 'int_rel';
  }
  if (sub && sub !== 'all') {
     if (!window.UPSC_MASTERY[sub]) window.UPSC_MASTERY[sub] = {c:0, t:0};
     window.UPSC_MASTERY[sub].t++;
     if (ok) window.UPSC_MASTERY[sub].c++;
     localStorage.setItem('upsc_mastery', JSON.stringify(window.UPSC_MASTERY));
  }

  let earned = 0;
  if (ok) {
    qzCorrect++;
    qzCombo++;
    let mult = qzMode === "speed" ? Math.min(qzCombo, 4) : 1;
    earned = cfg.xpPerQ * mult;
    qzXP += earned;
    if (window.toast) toast("⚡ +" + earned + " XP" + (mult > 1 ? " ×" + mult + " COMBO!" : ""));
    if (qzCombo % 3 === 0 && window.confetti) confetti();
  } else {
    qzCombo = 0;
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
    const verdict = ok ? "✅ Correct!" : chosen === -1 ? "⏱ Time up!" : "❌ Not quite!";
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
  document.getElementById("qNxt").textContent = qzIdx + 1 >= qzTotal ? "See Results →" : "Next →";
  document.getElementById("qXp").textContent = "+" + qzXP + " XP";
};

window.nextQ = function () {
  qzIdx++;
  if (qzIdx >= qzTotal) showResults();
  else loadQ();
};

window.useLifeline = function() { /* deprecated for now in this flow */ };

window.showResults = function () {
  clearInterval(qzTimerI);
  document.getElementById("qz-active").style.display = "none";
  document.getElementById("qz-results").style.display = "flex";
  
  // ── Finalize Daily Record ──
  if (qzMode === 'daily') {
    localStorage.setItem('upsc_daily_played', new Date().toDateString());
    // Give a nice completion bonus for Daily!
    qzXP += 100;
  }

  // ── Save Global XP ──
  window.checkAndResetWeeklyXP();
  window.UPSC_USER_XP += qzXP;
  localStorage.setItem('upsc_user_xp', window.UPSC_USER_XP.toString());

  // Sync to all DOM elements and UI dynamically
  window.syncUIExperiencePoints();
  window.syncUIMastery();

  const pct = Math.round((qzCorrect / qzTotal) * 100);
  const trophy = pct >= 80 ? "🏆" : pct >= 60 ? "🥈" : pct >= 40 ? "🥉" : "📚";
  const title = pct >= 80 ? "Outstanding!" : pct >= 60 ? "Good Job!" : pct >= 40 ? "Keep Going!" : "Keep Practising!";
  
  document.getElementById("qzrTrophy").textContent = trophy;
  document.getElementById("qzrTitle").textContent = title;
  document.getElementById("qzrScore").textContent = qzCorrect + " / " + qzTotal;
  document.getElementById("qzrXp").textContent = "+" + qzXP + " XP earned";
  document.getElementById("qzrStats").innerHTML =
    '<div class="qzr-stat"><div class="qzr-stat-v">' + pct + '%</div><div class="qzr-stat-l">Accuracy</div></div>' +
    '<div class="qzr-stat"><div class="qzr-stat-v">' + window.UPSC_USER_XP + '</div><div class="qzr-stat-l">Total XP</div></div>' +
    '<div class="qzr-stat"><div class="qzr-stat-v">' + qzXP + '</div><div class="qzr-stat-l">XP Earned</div></div>';
  
  if (pct >= 80 && window.confetti) confetti();

  if (typeof JumpBear !== "undefined") JumpBear.celebrate({ score: qzCorrect, total: qzTotal });
  if (typeof SadBear !== "undefined") SadBear.appear({ score: qzCorrect, total: qzTotal });
};

window.restartQuiz = function () {
  document.getElementById("qz-results").style.display = "none";
  startQuizMode(qzMode, qzTopic);
};

window.quitQuiz = function () {
  clearInterval(qzTimerI);
  resetToLobby();
};

window.renderTimer = function () {
  const e = document.getElementById("qzT");
  const d = document.getElementById("qzDot");
  const cfg = MODE_CFG[qzMode] || MODE_CFG.mixed;
  const secs = qzTimerS;
  if (e) {
    e.textContent = cfg.timeS >= 60
        ? "0" + Math.floor(secs / 60) + ":" + (secs % 60).toString().padStart(2, "0")
        : secs + "s";
    e.style.color = secs <= 5 ? "#f87171" : secs <= Math.floor(cfg.timeS * 0.3) ? "#ffd700" : "var(--txt)";
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
  const cfg = MODE_CFG.speed || { timeS: 8 };
  const pct = qzTimerS / cfg.timeS;
  if (arc) {
    arc.style.strokeDashoffset = 81.7 * (1 - pct);
    arc.style.stroke = qzTimerS <= 3 ? "#f87171" : qzTimerS <= 5 ? "#ffd700" : "#00ff88";
  }
  if (num) num.textContent = qzTimerS;
};
