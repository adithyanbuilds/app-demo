/**
 * quiz-context/quiz-science/index.js
 * To add more questions: drop .js file here (must define QUESTION_BANK_Science),
 * then add filename to _FILES below.
 */
(function () {
  if (!window.UPSC_QUIZ_BANKS) window.UPSC_QUIZ_BANKS = {};
  if (!window.UPSC_QUIZ_BANKS["science"])
    window.UPSC_QUIZ_BANKS["science"] = [];

  const _FILES = [
    "quiz-science.js",
    // 'quiz-science-part2.js', ← add here
  ];

  const _base = "quiz-context/quiz-science/";
  _FILES.forEach(function (fname) {
    const s = document.createElement("script");
    s.src = _base + fname;
    s.dataset.quizFolder = "science";
    document.head.appendChild(s);
  });
})();
