// tags.js

window.filterQuestionsByTag = async function(tag) {
  tag = (tag || '').toLowerCase();
  // Если есть глобальный кэш, фильтруем его — быстрее!
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
  // Если кэша нет — загружаем из SheetDB
  const res = await fetch(`${SHEETDB_BASE}/sheet/questions`);
  let questions = await res.json();
  questions = questions.filter(q =>
    (q.tags||'').toLowerCase().split(',').map(t=>t.trim()).includes(tag)
  );
  if (typeof renderQuestions === "function") renderQuestions(questions);
  // Очистить поле поиска, если оно есть
  const searchInp = document.getElementById('question-search');
  if (searchInp) searchInp.value = '';
};
