/**
 * quiz-context/quiz-geography/index.js
 * To add more questions: drop .js file here (must define QUESTION_BANK_Geography),
 * then add filename to _FILES below.
 */
(function () {
  if (!window.UPSC_QUIZ_BANKS) window.UPSC_QUIZ_BANKS = {};
  if (!window.UPSC_QUIZ_BANKS["geography"])
    window.UPSC_QUIZ_BANKS["geography"] = [];

  const _FILES = [
    "quiz-geography.js",
    // 'quiz-geography-part2.js', ← add here
  ];

  const _base = "quiz-context/quiz-geography/";
  _FILES.forEach(function (fname) {
    const s = document.createElement("script");
    s.src = _base + fname;
    s.dataset.quizFolder = "geography";
    document.head.appendChild(s);
  });
})();
