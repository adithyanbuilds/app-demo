/**
 * quiz-context/quiz-polity/index.js
 * To add more questions: drop .js file here (must define QUESTION_BANK_Polity),
 * then add filename to _FILES below.
 */
(function () {
  if (!window.UPSC_QUIZ_BANKS) window.UPSC_QUIZ_BANKS = {};
  if (!window.UPSC_QUIZ_BANKS["polity"]) window.UPSC_QUIZ_BANKS["polity"] = [];

  const _FILES = [
    "quiz-polity.js",
    // 'quiz-polity-part2.js', ← add here
  ];

  const _base = "quiz-context/quiz-polity/";
  _FILES.forEach(function (fname) {
    const s = document.createElement("script");
    s.src = _base + fname;
    s.dataset.quizFolder = "polity";
    document.head.appendChild(s);
  });
})();
