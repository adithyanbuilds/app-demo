/**
 * subject-context/gs-paper-1/index.js
 * ─────────────────────────────────────
 * Aggregator for ALL GS Paper 1 subject-reader files.
 * To add more cards: drop a new .js file here (must export an array like GsPaper1_XXXX),
 * then add its filename to _FILES below.
 *
 * Card format: { id, category, question, answer }
 */
(function () {
  if (!window.SUBJECT_CONTEXT_FILES) window.SUBJECT_CONTEXT_FILES = [];

  const _FILES = [
    "gs-p1-2025.js",
    "gs-p1-2024.js",
    // 'gs-p1-2023.js', ← add here when you drop the file in
  ];

  const _base = "subject-context/gs-paper-1/";
  _FILES.forEach(function (fname) {
    const s = document.createElement("script");
    s.src = _base + fname;
    s.dataset.subjectFolder = "gs-paper-1";
    document.head.appendChild(s);
  });
})();
