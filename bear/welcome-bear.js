(function () {

  // Dynamic message generator based on user's actual progress
  function generateBearMessage() {
    var msgs = [];
    
    // Time based
    var hr = new Date().getHours();
    if (hr >= 22 || hr < 4) msgs.push({ top: "🌙 LATE NIGHT?", main: "Late night grinding?\\nBear approves!" });
    if (hr >= 4 && hr <= 8) msgs.push({ top: "☕ EARLY BIRD", main: "Up early to study?\\nThat's how you win." });
    
    // Daily quiz check
    var lastDaily = localStorage.getItem('upsc_daily_played');
    if (lastDaily !== new Date().toDateString()) {
      msgs.push({ top: "📅 DAILY QUIZ", main: "You haven't played\\nthe Daily Quiz yet!" });
    } else {
      msgs.push({ top: "🔥 DAILY DONE", main: "Daily quiz completed!\\nGreat consistency." });
    }

    // XP based
    var xp = window.UPSC_USER_XP || 0;
    if (xp > 0) {
      msgs.push({ top: "⚡ YOUR XP", main: xp.toLocaleString() + " XP earned!\\nKeep pushing up!" });
    } else {
      msgs.push({ top: "👋 WELCOME!", main: "Ready to earn some XP?\\nLet's start a quiz." });
    }
    
    // Mastery based
    var m = window.UPSC_MASTERY || {};
    var bestSub = null;
    var worstSub = null;
    var bestPct = -1;
    var worstPct = 101;
    
    Object.keys(m).forEach(function(k) {
      if (m[k].t > 2) { // must have answered at least 3 questions
        var p = Math.round((m[k].c / m[k].t) * 100);
        var name = k.charAt(0).toUpperCase() + k.slice(1);
        if (p > bestPct) { bestPct = p; bestSub = name; }
        if (p < worstPct) { worstPct = p; worstSub = name; }
      }
    });

    if (bestSub && bestPct >= 65) {
      msgs.push({ top: "🏆 PRO TIP", main: "You're a PRO at " + bestSub + "\\n(" + bestPct + "% accuracy)!" });
    }
    if (worstSub && worstPct <= 45) {
      msgs.push({ top: "🧠 STUDY TIP", main: "Focus on " + worstSub + " today.\\nIt's at " + worstPct + "%. Let's fix it." });
    }
    if (!bestSub) {
      msgs.push({ top: "🎯 NEW JOURNEY", main: "Complete a Topic Quiz\\nto analyze your mastery!" });
    }

    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  var FIRST_DELAY   = 2400;
  var PEEK_DURATION = 4800;
  var MIN_INTERVAL  = 10000;
  var MAX_INTERVAL  = 15000;

  var CSS = [
    /* Wrap — slides in/out, no opacity so clipping works cleanly */
    "#wbWrap {",
    "  position: absolute;",
    "  right: 0;",
    "  bottom: 200px;",
    "  width: 50px;",
    "  z-index: 400;",
    "  cursor: pointer;",
    "  pointer-events: none;",
    "  transform: translateX(100%);",
    "  transition: transform 0.50s cubic-bezier(0.175,0.885,0.32,1.275);",
    "}",
    "#wbWrap.wb-on {",
    "  transform: translateX(15px);",
    "  pointer-events: auto;",
    "}",

    /* Image — invisible until wrap is active, prevents rotated corner leak */
    "#wbWrap img {",
    "  width: 90px;",
    "  height: auto;",
    "  display: block;",
    "  transform: rotate(-30deg);",
    "  transform-origin: bottom center;",
    "  filter: drop-shadow(-6px 0 12px rgba(0,0,0,0.7));",
    "  opacity: 0;",
    "  transition: opacity 0.3s ease;",
    "}",
    "#wbWrap.wb-on img {",
    "  opacity: 1;",
    "}",

    /* Bubble */
    "#wbBubble {",
    "  position: absolute;",
    "  bottom: 90px;",
    "  right: 48px;",
    "  width: 130px;",
    "  background: #ffffff;",
    "  border-radius: 12px 12px 12px 4px;",
    "  padding: 9px 11px;",
    "  box-shadow: 0 6px 24px rgba(0,0,0,0.45), 0 0 0 1.5px rgba(0,0,0,0.5);",
    "  opacity: 0;",
    "  transform: scale(0.7) translateY(10px);",
    "  transition: opacity 0.25s 0.28s ease, transform 0.28s 0.28s cubic-bezier(0.175,0.885,0.32,1.275);",
    "  pointer-events: none;",
    "}",
    "#wbWrap.wb-on #wbBubble {",
    "  opacity: 1;",
    "  transform: scale(1) translateY(0);",
    "}",
    "#wbBubble::after {",
    "  content: '';",
    "  position: absolute;",
    "  bottom: -8px;",
    "  right: 18px;",
    "  border: 8px solid transparent;",
    "  border-top-color: #fff;",
    "  border-bottom-width: 0;",
    "}",
    "#wbTop {",
    "  font-size: 7.5px;",
    "  font-weight: 700;",
    "  color: #999;",
    "  letter-spacing: 0.5px;",
    "  margin-bottom: 3px;",
    "  font-family: 'JetBrains Mono', monospace;",
    "}",
    "#wbMain {",
    "  font-size: 10px;",
    "  font-weight: 800;",
    "  color: #111;",
    "  line-height: 1.45;",
    "  font-family: 'JetBrains Mono', monospace;",
    "}"
  ].join("\n");

  var HTML = [
    '<div id="wbWrap">',
    '  <div id="wbBubble">',
    '    <div id="wbTop"></div>',
    '    <div id="wbMain"></div>',
    '  </div>',
    '  <img src="assets/welcome-bear.png" alt=""',
    '    onerror="document.getElementById(\'wbWrap\').style.display=\'none\'" />',
    '</div>'
  ].join("\n");

  var hideTimer = null;
  var injected  = false;

  function inject() {
    if (injected || document.getElementById("wbWrap")) { injected = true; return true; }
    var phone = document.getElementById("app");
    if (!phone) return false;
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    phone.insertAdjacentHTML("beforeend", HTML);
    document.getElementById("wbWrap").addEventListener("click", hide);
    injected = true;
    return true;
  }

  function show() {
    if (!inject()) { scheduleNext(); return; }
    var home = document.getElementById("home");
    if (!home || !home.classList.contains("active")) { scheduleNext(); return; }
    var wrap   = document.getElementById("wbWrap");
    var topEl  = document.getElementById("wbTop");
    var mainEl = document.getElementById("wbMain");
    if (!wrap) return;
    var m = generateBearMessage();
    topEl.textContent = m.top;
    mainEl.innerHTML  = m.main.replace(/\n/g, "<br>");
    wrap.classList.add("wb-on");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, PEEK_DURATION);
  }

  function hide() {
    clearTimeout(hideTimer);
    var wrap = document.getElementById("wbWrap");
    if (wrap) wrap.classList.remove("wb-on");
    scheduleNext();
  }

  function scheduleNext() {
    var delay = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
    setTimeout(show, delay);
  }

  setTimeout(show, FIRST_DELAY);

})();