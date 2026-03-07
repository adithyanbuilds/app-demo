/**
 * quiz-context/quiz-history/index.js
 * ─────────────────────────────────
 * Aggregator for ALL history quiz files in this folder.
 * To add more questions: drop a new .js file here, then
 * add one line below: loadQuizFile('your-new-file.js')
 *
 * Each .js file must define: const QUESTION_BANK_History = { history: [...] }
 * OR push directly to window.UPSC_QUIZ_BANKS['history']
 */

(function () {
  if (!window.UPSC_QUIZ_BANKS) window.UPSC_QUIZ_BANKS = {};
  if (!window.UPSC_QUIZ_BANKS["history"])
    window.UPSC_QUIZ_BANKS["history"] = [];

  // ── FILES IN THIS FOLDER (add new file names here when you drop them in) ──
  const _FILES = [
    "quiz-history.js",
    // 'quiz-history-2025.js',  ← uncomment / add here
  ];

  // ── Internal loader: runs synchronously via inline script tags ──────────
  const _base = "quiz-context/quiz-history/";

  // We cannot dynamically `fetch()` and eval() inline synchronously,
  // so we use document.write / script-tag injection before DOMContentLoaded.
  // This index.js itself is loaded as a <script> by index.html,
  // so at this point the DOM is still being parsed — we can append siblings.
  _FILES.forEach(function (fname) {
    const s = document.createElement("script");
    s.src = _base + fname;
    s.dataset.quizFolder = "history";
    document.head.appendChild(s);
  });
})();
