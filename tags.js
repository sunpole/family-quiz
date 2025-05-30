// tags.js

// Показать только вопросы с данным тегом
async function filterQuestionsByTag(tag) {
  const res = await fetch(`${SHEETDB_BASE}/sheet/questions`);
  let questions = await res.json();
  tag = tag.toLowerCase();
  questions = questions.filter(q =>
    (q.tags||'').toLowerCase().split(',').map(t=>t.trim()).includes(tag)
  );
  renderQuestions(questions);
}
