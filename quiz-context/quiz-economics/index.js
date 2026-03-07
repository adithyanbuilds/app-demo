/**
 * quiz-context/quiz-economics/index.js
 * To add more questions: drop .js file here (must define QUESTION_BANK_Economics),
 * then add filename to _FILES below.
 */
(function () {
  if (!window.UPSC_QUIZ_BANKS) window.UPSC_QUIZ_BANKS = {};
  if (!window.UPSC_QUIZ_BANKS["economy"])
    window.UPSC_QUIZ_BANKS["economy"] = [];

  const _FILES = [
    "quiz-economy.js",
    // 'quiz-economics-part2.js', ← add here
  ];

  const _base = "quiz-context/quiz-economics/";
  _FILES.forEach(function (fname) {
    const s = document.createElement("script");
    s.src = _base + fname;
    s.dataset.quizFolder = "economy";
    document.head.appendChild(s);
  });
})();
