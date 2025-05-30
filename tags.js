// tags.js

window.filterQuestionsByTag = async function(tag) {
  tag = (tag || '').toLowerCase();
  // Быстрый фильтр по кэшу, если есть (allQuestions)
  if (window.allQuestions && Array.isArray(window.allQuestions)) {
    const filtered = window.allQuestions.filter(q =>
      (q.tags || '').toLowerCase().split(',').map(t => t.trim()).includes(tag)
    );
    if (typeof renderQuestions === "function") renderQuestions(filtered);
    // Очистить поле поиска если оно есть
    const searchInp = document.getElementById('question-search');
    if (searchInp) searchInp.value = '';
    return;
  }
  // Если кэша нет — загрузим из SheetDB
  try {
    const res = await fetch(`${window.SHEETDB_BASE}/sheet/questions`);
    let questions = await res.json();
    questions = questions.filter(q =>
      (q.tags || '').toLowerCase().split(',').map(t => t.trim()).includes(tag)
    );
    if (typeof renderQuestions === "function") renderQuestions(questions);
  } catch (e) {
    if (typeof notify === "function") notify("Ошибка загрузки вопросов по тегу", "error");
  }
  // Очистить поле поиска, если оно есть
  const searchInp = document.getElementById('question-search');
  if (searchInp) searchInp.value = '';
};
