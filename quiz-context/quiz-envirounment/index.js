/**
 * quiz-context/quiz-envirounment/index.js
 * To add more questions: drop .js file here (must define QUESTION_BANK_Env_Eco),
 * then add filename to _FILES below.
 */
(function () {
  if (!window.UPSC_QUIZ_BANKS) window.UPSC_QUIZ_BANKS = {};
  if (!window.UPSC_QUIZ_BANKS["env_eco"])
    window.UPSC_QUIZ_BANKS["env_eco"] = [];

  const _FILES = [
    "quiz-envirounment.js",
    // 'quiz-environment-part2.js', ← add here
  ];

  const _base = "quiz-context/quiz-envirounment/";
  _FILES.forEach(function (fname) {
    const s = document.createElement("script");
    s.src = _base + fname;
    s.dataset.quizFolder = "env_eco";
    document.head.appendChild(s);
  });
})();
