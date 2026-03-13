(function () {

  var MSGS = [
    { top: "⚡ YOUR XP",        main: "2,840 XP earned!\nRank #4 this week." },
    { top: "🔥 STREAK",         main: "12-day streak!\nDon't break it today." },
    { top: "📝 QUICK QUIZ",     main: "Try 5 Polity Qs\nbefore lunch!" },
    { top: "🎯 ACCURACY",       main: "74% accuracy —\nTop 10% nationally!" },
    { top: "💪 GRIND TIME",     main: "130 XP behind\nMeena — close it!" },
    { top: "🏆 LEADERBOARD",    main: "#4 of 1,248\nPush for #3 today!" },
    { top: "🧠 STUDY TIP",      main: "Economy is weak\nat 20%. Fix it now." },
    { top: "👋 WELCOME BACK",   main: "Ready to grind?\nYour rivals are!" },
    { top: "⏰ REMINDER",       main: "No quiz yet today.\nLet's go — 5 mins!" },
    { top: "🚀 UPSC 2026",      main: "310 days left.\nEvery session counts." },
    { top: "👀 PSST HEY",         main: "Still here?\nGood. Keep grinding." },
    { top: "☕ GOOD MORNING",     main: "Bear is up early.\nAre you?" },
    { top: "😤 NO EXCUSES",       main: "Bear studied today.\nWhat about you?" },
    { top: "🐻 BEAR SAYS",        main: "Close YouTube.\nOpen the quiz. Now." },
    { top: "🎉 HEY ARJUN!",       main: "You showed up.\nThat already counts." },
    { top: "🌙 LATE NIGHT?",      main: "Bear approves the\nlate night grind!" },
    { top: "💬 JUST SAYING",      main: "Toppers study now.\nJust saying..." },
    { top: "🙈 DON'T PANIC",     main: "310 days is\nactually a lot. Breathe." },
    { top: "🐾 YO ARJUN",         main: "Bear misses you\nwhen you skip days." },
    { top: "😴 WAKE UP",          main: "Bear hibernates.\nYou cannot. Study." },
    { top: "🎯 SMALL WINS",       main: "5 questions = \n+25 XP. Easy money." },
    { top: "🔑 PRO TIP",          main: "Polity is 30% of\nPrelims. Just saying." },
    { top: "🤙 KEEP IT UP",       main: "Rank #4 and rising.\nBear is proud." },
    { top: "😠 BEAR IS WATCHING", main: "Did you skip\nyesterday? Hmm." }
  ];

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
    var m = MSGS[Math.floor(Math.random() * MSGS.length)];
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