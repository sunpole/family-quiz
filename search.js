// search.js

// ПОИСК ВОПРОСОВ по тексту и тегам
async function searchQuestions(query) {
  // SheetDB фильтрует только по строгому совпадению (ограничение фри-версии)
  // Альтернатива: получить все вопросы и фильтровать на клиенте
  const res = await fetch(`${SHEETDB_BASE}/sheet/questions`);
  const questions = await res.json();
  query = query.toLowerCase();
  return questions.filter(q =>
    (q.question && q.question.toLowerCase().includes(query))
    || (q.tags && q.tags.toLowerCase().includes(query))
  );
}

window.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.onsubmit = async (e) => {
      e.preventDefault();
      const q = document.getElementById('search-query').value.trim();
      let results = await searchQuestions(q);
      renderQuestions(results);
    };
  }
});
