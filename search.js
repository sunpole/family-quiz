// --- search.js ---

// --- КАСТОМНЫЙ РЕНДЕР для search-results, не трогает основной список ---
function renderSearchQuestions(questions) {
  const list = document.getElementById('search-results');
  if (!list) return;
  list.innerHTML = '';
  if (!questions.length) {
    list.innerHTML = `<div style="color:var(--font-muted);margin:1em 0;">Ничего не найдено.</div>`;
    return;
  }
  questions.forEach(q => {
    const tags = q.tags ? q.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const html = `
      <div class="q-card" data-id="${q.id}">
        <div class="question">${q.question}</div>
        <div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join(' ')}</div>
        <div class="author">${q.author_id || ''} | ${q.date || ''}</div>
      </div>`;
    list.insertAdjacentHTML('beforeend', html);
  });
}

// --- ПОИСК ВОПРОСОВ по тексту и тегам ---
async function searchQuestions(query, additionalTags=[]) {
  try {
    const res = await fetch(`${window.SHEETDB_BASE}?sheet=questions`);
    const questions = await res.json();
    query = (query || "").toLowerCase();
    additionalTags = (additionalTags || []).map(t => t.trim().toLowerCase()).filter(Boolean);

    return questions.filter(q => {
      const textMatch =
        (!query && !additionalTags.length) ||
        (q.question && q.question.toLowerCase().includes(query)) ||
        (q.tags && q.tags.toLowerCase().includes(query));

      const tagMatch = additionalTags.length
        ? (q.tags && additionalTags.some(tag =>
            q.tags.toLowerCase().split(',').map(t => t.trim()).includes(tag)
          ))
        : true;
      return textMatch && tagMatch;
    });
  } catch (e) {
    notify && notify("Ошибка поиска", "error");
    return [];
  }
}

// --- Привязка к UI ---
window.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  const searchTagsInput = document.getElementById('search-tags');
  const searchResults = document.getElementById('search-results');

  if (searchBtn && searchInput && searchTagsInput && searchResults) {
    const doSearch = async () => {
      const query = searchInput.value.trim();
      const tags = searchTagsInput.value
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      const results = await searchQuestions(query, tags);
      renderSearchQuestions(results);
    };
    searchBtn.onclick = doSearch;
    [searchInput, searchTagsInput].forEach(el => {
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          doSearch();
        }
      });
    });

    // Дополнительно: переход по клику на найденный вопрос
    searchResults.addEventListener('click', e => {
      const card = e.target.closest('.q-card');
      if (card && typeof loadAnswers === "function") {
        loadAnswers(card.dataset.id);
      }
    });
  }
});
