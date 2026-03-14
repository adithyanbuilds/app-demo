/* ══════════════════════════════════════════════════════════
   jump-bear.js  —  Quiz Celebration Animation
   Path: bear/jump-bear.js
   Bear image: assets/Jump-bear.png
   ══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ══════════════════════════════════════════════════════
     SECTION 1 — CONFIG
  ══════════════════════════════════════════════════════ */
  var BEAR_IMG    = "assets/Jump-bear.png";
  var THRESHOLD   = 0.5;   /* 0.6 = 60% minimum to trigger bear */
  var JUMP_COUNT  = 3;     /* how many jumps before bear leaves  */
  var JUMP_HEIGHT = 50;    /* px the bear rises per jump         */
  var JUMP_MS     = 700;   /* ms per full jump cycle             */


  /* ══════════════════════════════════════════════════════
     SECTION 2 — STYLES
  ══════════════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById("jb-css")) return;
    var s = document.createElement("style");
    s.id = "jb-css";
    s.textContent =

      /* ── Bear wrapper ────────────────────────────────
         position:absolute inside #app
         contains BOTH the bubble and the image
         so they always move together                    */
      "#jb-bear{" +
        "position:absolute;" +
        "bottom:-220px;" +
        "left:50%;" +
        "transform:translateX(-50%);" +
        "z-index:9999;" +
        "width:150px;" +
        "pointer-events:none;" +
        "will-change:bottom;" +
        "transition:bottom .4s cubic-bezier(.22,1,.36,1);" +
        "display:flex;" +
        "flex-direction:column;" +
        "align-items:center;" +
        "gap:2px;" +               /* space between bubble and bear image */
      "}" +

      "#jb-bear img{" +
        "width:100%;" +
        "height:auto;" +
        "display:block;" +
        "object-fit:contain;" +
        "mix-blend-mode:screen;" +
        "filter:drop-shadow(0 10px 22px rgba(0,0,0,.65));" +
      "}" +

      /* ── Speech bubble — sits ABOVE the bear image ───
         Because it's inside #jb-bear with flex-column,
         it's always glued right above the bear's head.
         Comic style: warm bg, thick ink border, offset shadow */
     "#jb-msg{" +
  "background:#fffde7;" +
  "color:#1a1a1a;" +
  "font-family:'Syne',sans-serif;" +
  "font-size:12px;" +
  "font-weight:900;" +
  "line-height:1.3;" +
  "white-space:nowrap;" +
  "padding:8px 14px;" +
  "border-radius:16px 16px 16px 4px;" +
  "margin-left:150px;" +
  "border:2.5px solid #1a1a1a;" +
  "box-shadow:3px 3px 0 #1a1a1a;" +
  "position:relative;" +
  "opacity:0;" +
  "margin-bottom:-25px;" +          // ← pushes text into bear
  "transform:scale(0.6) translateY(8px);" +
  "transform-origin:bottom center;" +
  "transition:opacity .2s ease, transform .25s cubic-bezier(.175,.885,.32,1.5);" +
"}" +



      /* ── Sparkles ─────────────────────────────────── */
      ".jb-sp{position:absolute;font-size:18px;z-index:10001;pointer-events:none;" +
      "animation:jbSp .85s ease-out forwards;}" +
      "@keyframes jbSp{" +
        "0%{opacity:1;transform:translate(0,0) scale(1);}" +
        "100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(.2);}}" +

      /* ── Confetti ─────────────────────────────────── */
      ".jb-conf{position:absolute;width:7px;height:7px;border-radius:2px;" +
      "z-index:9998;pointer-events:none;" +
      "animation:jbConf var(--d) ease-out forwards;}" +
      "@keyframes jbConf{" +
        "0%{opacity:1;transform:translate(0,0) rotate(0);}" +
        "100%{opacity:0;transform:translate(var(--cx),var(--cy)) rotate(700deg);}}";

    document.head.appendChild(s);
  }


  /* ══════════════════════════════════════════════════════
     SECTION 3 — CLEANUP
  ══════════════════════════════════════════════════════ */
  function cleanup() {
    var bear = document.getElementById("jb-bear");
    if (bear) bear.remove();
    /* msg is inside bear so it's removed automatically */
    document.querySelectorAll(".jb-sp,.jb-conf").forEach(function(e){ e.remove(); });
  }


  /* ══════════════════════════════════════════════════════
     SECTION 4 — BUILD
     Bear div contains:
       1. #jb-msg  (bubble — on top in flex column)
       2. <img>    (bear image — below bubble)
     They move as one unit. No separate positioning needed.
  ══════════════════════════════════════════════════════ */
  function build(text) {
    cleanup();
    var phone = document.getElementById("app") || document.body;

    var bear = document.createElement("div");
    bear.id = "jb-bear";
    bear.innerHTML =
      '<div id="jb-msg">' + text + '</div>' +
      '<img src="' + BEAR_IMG + '" alt="Celebrating Bear">';

    phone.appendChild(bear);
    return { bear: bear, phone: phone };
  }


  /* ══════════════════════════════════════════════════════
     SECTION 5 — SPARKLES
  ══════════════════════════════════════════════════════ */
  function doSparkles(phone, bearEl) {
    var icons = ["⭐","✨","🌟","💫","🎊","🎉"];
    var br = bearEl.getBoundingClientRect();
    var pr = phone.getBoundingClientRect();
    var cx = br.left - pr.left + br.width  / 2;
    var cy = br.top  - pr.top  + br.height * 0.5;

    for (var i = 0; i < 10; i++) {
      (function(i){
        var sp = document.createElement("div");
        sp.className = "jb-sp";
        var angle = (Math.PI * 2 * i) / 10;
        var dist  = 48 + Math.random() * 52;
        sp.style.cssText =
          "left:" + cx + "px;top:" + cy + "px;" +
          "--tx:" + (Math.cos(angle)*dist) + "px;" +
          "--ty:" + (Math.sin(angle)*dist) + "px;" +
          "animation-delay:" + (Math.random()*0.12) + "s;";
        sp.textContent = icons[Math.floor(Math.random() * icons.length)];
        phone.appendChild(sp);
        setTimeout(function(){ sp.remove(); }, 1000);
      })(i);
    }
  }


  /* ══════════════════════════════════════════════════════
     SECTION 6 — CONFETTI
  ══════════════════════════════════════════════════════ */
  function doConfetti(phone) {
    var cols = ["#f472b6","#facc15","#34d399","#60a5fa","#fb923c","#a78bfa","#f87171"];
    var pw = phone.getBoundingClientRect().width;

    for (var i = 0; i < 90; i++) {
      (function(){
        var c  = document.createElement("div");
        c.className = "jb-conf";
        var x  = Math.random() * pw;
        var cx = (Math.random() - 0.5) * 160;
        var cy = 480 + Math.random() * 80;
        var d  = 1.2 + Math.random() * 0.4;
        c.style.cssText =
          "left:" + x + "px;top:4px;" +
          "background:" + cols[Math.floor(Math.random()*cols.length)] + ";" +
          "--cx:" + cx + "px;--cy:" + cy + "px;--d:" + d + "s;" +
          "animation-delay:" + (Math.random()*0.35) + "s;";
        phone.appendChild(c);
        setTimeout(function(){ c.remove(); }, (d + 0.55) * 1000);
      })();
    }
  }


  /* ══════════════════════════════════════════════════════
     SECTION 7 — JUMP LOOP
     Clean jumps, no squash or stretch.
  ══════════════════════════════════════════════════════ */
  function doJumps(bear, phone, onDone) {
    var done = 0;
    var BASE = 28; /* resting bottom px */

    function oneJump() {
      if (done >= JUMP_COUNT) { onDone(); return; }

      /* RISE */
      bear.style.transition = "bottom " + (JUMP_MS * 0.44) + "ms cubic-bezier(.22,1,.36,1)";
      bear.style.bottom = (BASE + JUMP_HEIGHT) + "px";

      setTimeout(function(){
        /* FALL */
        bear.style.transition = "bottom " + (JUMP_MS * 0.5) + "ms cubic-bezier(.55,0,1,.45)";
        bear.style.bottom = BASE + "px";

        setTimeout(function(){
          doSparkles(phone, bear);
          done++;
          setTimeout(oneJump, 80);
        }, JUMP_MS * 0.5);

      }, JUMP_MS * 0.44);
    }

    oneJump();
  }


  /* ══════════════════════════════════════════════════════
     SECTION 8 — SLIDE OUT
  ══════════════════════════════════════════════════════ */
  function slideOut(bear) {
    /* Fade bubble first */
    var msg = document.getElementById("jb-msg");
    if (msg) {
      msg.style.opacity   = "0";
      msg.style.transform = "scale(0.5) translateY(8px)";
    }
    /* Then slide whole bear down */
    setTimeout(function(){
      bear.style.transition = "bottom .45s cubic-bezier(.55,0,1,.45)";
      bear.style.bottom     = "-220px";
      setTimeout(cleanup, 550);
    }, 200);
  }


  /* ══════════════════════════════════════════════════════
     SECTION 9 — PUBLIC API

     Call from quiz-engine.js inside showResults():

       if (typeof JumpBear !== "undefined")
         JumpBear.celebrate({ score: qzCorrect, total: qzTotal });
  ══════════════════════════════════════════════════════ */
  window.JumpBear = {

    celebrate: function (opts) {
      var score = opts.score || 0;
      var total = opts.total || 1;
      var ratio = score / total;

      if (ratio < THRESHOLD) return;

      /* Pick message */
var text = "Not bad! 😤";
if (ratio === 1)       text = "FLAWLESS! 🔥👑";
else if (ratio >= 0.9) text = "Almost perfect! ⚡";
else if (ratio >= 0.8) text = "On fire! 🔥";
else if (ratio >= 0.7) text = "Solid! Keep going 💪";
else if (ratio >= 0.6) text = "Getting there! 📈";
else if (ratio < 0.6)  text = "Rise up! 💀📚";

      injectStyles();
      var els   = build(text);   /* bubble text passed into build */
      var bear  = els.bear;
      var phone = els.phone;

      doConfetti(phone);

      /* Slide bear (+ bubble inside it) up */
      requestAnimationFrame(function(){
        setTimeout(function(){ bear.style.bottom = "28px"; }, 20);
      });

      /* After bear lands, pop bubble in */
      setTimeout(function(){
        var msg = document.getElementById("jb-msg");
        if (msg) {
          msg.style.opacity   = "1";
          msg.style.transform = "scale(1) translateY(0)";
        }

        /* Start jumping — bubble rides along inside bear div */
        doJumps(bear, phone, function(){
          setTimeout(function(){ slideOut(bear); }, 1100);
        });

      }, 480);
    }

  };

})();