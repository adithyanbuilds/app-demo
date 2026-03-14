/* ══════════════════════════════════════════════════════════
   sad-bear.js  —  Quiz Disappointment Animation
   Path: bear/sad-bear.js
   Sad bear image: assets/sad-bear.png
   Triggers when score < 60%
   ══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ═══════════════════════════;═══════════════════════════
     SECTION 1 — CONFIG
  ══════════════════════════════════════════════════════ */
  var SAD_IMG = "assets/sad-bear.png";
  var THRESHOLD = 0.5; /* below this = sad bear triggers  */
  var SAD_STAY_MS = 3000; /* ms bear stays before leaving    */

  /* ══════════════════════════════════════════════════════
     SECTION 2 — STYLES
  ══════════════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById("sb-css")) return;
    var s = document.createElement("style");
    s.id = "sb-css";
    s.textContent =
      /* ── Bear wrapper ────────────────────────────────
         Same structure as jump-bear — bubble + image
         inside one div so they always move together     */
      "#sb-bear{" +
      "position:absolute;" +
      "bottom:-220px;" +
      "left:85%;" +
      "transform:translateX(-50%);" +
      "z-index:9999;" +
      "width:150px;" /* bear size — change to resize */ +
      "pointer-events:none;" +
      "will-change:bottom;" +
      "transition:bottom .6s cubic-bezier(.22,1,.36,1);" /* slower slide than happy bear */ +
      "display:flex;" +
      "flex-direction:column;" +
      "align-items:center;" +
      "gap:0px;" +
      "}" +
      "#sb-bear img{" +
      "width:100%;" +
      "height:auto;" +
      "display:block;" +
      "object-fit:contain;" +
      "mix-blend-mode:screen;" +
      "filter:drop-shadow(0 10px 22px rgba(0,0,0,.65));" +
      "}" +
      /* ── Speech bubble ───────────────────────────────
         Cool blue-grey = sad/disappointed feel
         Same comic style as jump-bear bubble           */
      "#sb-msg{" +
      "background:#e8eaf6;" /* cool blue-grey */ +
      "color:#1a1a1a;" +
      "font-family:'Syne',sans-serif;" +
      "font-size:12px;" +
      "font-weight:900;" +
      "line-height:1.3;" +
      "white-space:nowrap;" +
      "padding:8px 14px;" +
      "border-radius:16px 16px 4px 16px;" +
      "border:2.5px solid #1a1a1a;" +
      "box-shadow:3px 3px 0 #1a1a1a;" +
      "position:relative;" +
      "opacity:0;" +
      "margin-bottom:-30px;" +
      "margin-left:-250px;" +
      "transform:scale(0.6) translateY(8px);" +
      "transform-origin:bottom center;" +
      "transition:opacity .2s ease,transform .25s cubic-bezier(.175,.885,.32,1.5);" +
      "}" +
      /* ── Head shake — slow disappointed side-to-side ─
         Plays once when bear lands
         Duration controlled by animation time below    */
 
      /* ── Slump — bear droops down after shake ────────
         Simulates a sad slouch                         */
      "@keyframes sbSlump{" +
      "0%  {transform:translateY(0px);}" +
      "40% {transform:translateY(12px);}" +
      "100%{transform:translateY(12px);}" /* stays drooped */ +
      "}" +
      /* ── Tear drops that fall from bear's eyes ───────
         Small blue circles that fall and fade          */
      ".sb-tear{" +
      "position:absolute;" +
      "width:4px;" +
      "height:9px;" +
      "background:linear-gradient(180deg,#93c5fd,#3b82f6);" /* gradient = realistic water */ +
      "border-radius:50% 50% 50% 50% / 20% 20% 80% 80%;" +
      "z-index:10001;" +
      "pointer-events:none;" +
      "opacity:0.9;" +
      "animation:sbTear var(--d) cubic-bezier(.4,0,1,1) forwards;" +
      "}" +
      "@keyframes sbTear{" +
      "0%  {opacity:0.9;transform:translate(0,0) scaleY(1);}" +
      "20% {opacity:1;transform:translate(0,6px) scaleY(1.2);}" /* stretches as it gains speed */ +
      "80% {opacity:0.8;transform:translate(var(--tx),32px) scaleY(1);}" +
      "100%{opacity:0;transform:translate(var(--tx),44px) scaleY(0.8);}" +
      "}";

    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════
     SECTION 3 — CLEANUP
  ══════════════════════════════════════════════════════ */
  function cleanup() {
    var bear = document.getElementById("sb-bear");
    if (bear) bear.remove();
    document.querySelectorAll(".sb-tear").forEach(function (e) {
      e.remove();
    });
  }

  /* ══════════════════════════════════════════════════════
     SECTION 4 — BUILD
     Bubble on top, image below — move as one unit
  ══════════════════════════════════════════════════════ */
  function build(text) {
    cleanup();
    var phone = document.getElementById("app") || document.body;

    var bear = document.createElement("div");
    bear.id = "sb-bear";
    bear.innerHTML =
      '<div id="sb-msg">' +
      text +
      "</div>" +
      '<img src="' +
      SAD_IMG +
      '" alt="Sad Bear">';

    phone.appendChild(bear);
    return { bear: bear, phone: phone };
  }

  /* ══════════════════════════════════════════════════════
     SECTION 5 — TEAR DROPS
     Two tears fall from eye positions on the bear
     Called after head shake settles
  ══════════════════════════════════════════════════════ */
  function doTears(phone, bearEl) {
    var br = bearEl.getBoundingClientRect();
    var pr = phone.getBoundingClientRect();

    /* Approximate eye positions — left and right eye */
    var eyeY =
      br.top - pr.top + br.height * 0.38; /* 38% from top = eye height */
    var eyeL = br.left - pr.left + br.width * 0.35; /* left eye  */
    var eyeR = br.left - pr.left + br.width * 0.62; /* right eye */
    /*  Adjust 0.35 and 0.62 left/right if tears don't line up with bear's eyes */

    [eyeL, eyeR].forEach(function (x, i) {
      var t = document.createElement("div");
      t.className = "sb-tear";
      var d = 0.6 + Math.random() * 0.3;
      t.style.cssText =
        "left:" +
        x +
        "px;" +
        "top:" +
        eyeY +
        "px;" +
        "--tx:" +
        (i === 0 ? -2 : 2) +
        "px;" /* slight drift outward */ +
        "--d:" +
        d +
        "s;" +
        "animation-delay:" +
        i * 0.15 +
        "s;"; /* right eye slightly after left */
      phone.appendChild(t);
      setTimeout(
        function () {
          t.remove();
        },
        (d + 0.3) * 1000,
      );
    });
  }

  /* ══════════════════════════════════════════════════════
     SECTION 6 — SAD ANIMATION SEQUENCE
     1. Bear slides up
     2. Bubble pops in
     3. Head shakes (disappointment)
     4. Bear slumps down
     5. Tears fall
     6. Lingers SAD_STAY_MS
     7. Slides back out
  ══════════════════════════════════════════════════════ */
function doSadSequence(bear, phone, onDone) {
  setTimeout(function () {
    doTears(phone, bear);
    setTimeout(onDone, SAD_STAY_MS);
  }, 400); /* small pause after landing before tears */
}
  /* ══════════════════════════════════════════════════════
     SECTION 7 — SLIDE OUT
  ══════════════════════════════════════════════════════ */
  function slideOut(bear) {
    var msg = document.getElementById("sb-msg");
    if (msg) {
      msg.style.opacity = "0";
      msg.style.transform = "scale(0.5) translateY(8px)";
    }
    setTimeout(function () {
      bear.style.transition = "bottom .5s cubic-bezier(.55,0,1,.45)";
      bear.style.bottom = "-220px";
      setTimeout(cleanup, 600);
    }, 200);
  }

  /* ══════════════════════════════════════════════════════
     SECTION 8 — PUBLIC API

     Add in quiz-engine.js inside showResults(),
     right after the JumpBear call:

       if (typeof SadBear !== "undefined")
         SadBear.appear({ score: qzCorrect, total: qzTotal });
  ══════════════════════════════════════════════════════ */
  window.SadBear = {
    appear: function (opts) {
      var score = opts.score || 0;
      var total = opts.total || 1;
      var ratio = score / total;

      if (ratio >= THRESHOLD) return; /* 60%+ = jump bear handles it, not us */

      /* Pick sad message based on score */
var text = "Try again! 😢";
if (ratio < 0.2)      text = "Oops! Back to books 📚";
else if (ratio < 0.3) text = "Need more revision 😓";
else if (ratio < 0.4) text = "Keep grinding! 💀";
else if (ratio < 0.5) text = "Halfway there 😔";
else if (ratio < 0.6) text = "So close! 😣";

      injectStyles();
      var els = build(text);
      var bear = els.bear;
      var phone = els.phone;

      /* Slide bear up slowly */
      requestAnimationFrame(function () {
        setTimeout(function () {
          bear.style.bottom = "100px";
        }, 20);
      });

      /* After bear lands, pop bubble in then run sad sequence */
      setTimeout(function () {
        var msg = document.getElementById("sb-msg");
        if (msg) {
          msg.style.opacity = "1";
          msg.style.transform = "scale(1) translateY(0)";
        }
        doSadSequence(bear, phone, function () {
          slideOut(bear);
        });
      }, 650);
    },
  };
})();
