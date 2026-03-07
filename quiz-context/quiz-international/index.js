/**
 * quiz-context/quiz-international/index.js
 * To add more questions: drop .js file here (must define QUESTION_BANK_Int_Rel),
 * then add filename to _FILES below.
 */
(function () {
  if (!window.UPSC_QUIZ_BANKS) window.UPSC_QUIZ_BANKS = {};
  if (!window.UPSC_QUIZ_BANKS["int_rel"])
    window.UPSC_QUIZ_BANKS["int_rel"] = [];

  const _FILES = [
    "quiz-internaninal-rel.js",
    // 'quiz-international-part2.js', ← add here
  ];

  const _base = "quiz-context/quiz-international/";
  _FILES.forEach(function (fname) {
    const s = document.createElement("script");
    s.src = _base + fname;
    s.dataset.quizFolder = "int_rel";
    document.head.appendChild(s);
  });
})();
