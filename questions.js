// questions.js

// ===========================
// ВЫВОД ВСЕХ ВОПРОСОВ (+ фильтр)
// ===========================
let allQuestions = []; // для фильтрации

async function loadQuestions() {
  try {
    const res = await fetch(`${window.SHEETDB_BASE}/sheet/questions?sort=date&sort_by=desc`);
    const questions = await res.json();
    allQuestions = questions;
    renderQuestions(questions);
  } catch (err) {
    notify && notify("Ошибка загрузки вопросов", "error");
  }
}

function renderQuestions(questions) {
  const list = document.getElementById('question-list');
  if (!list) return;
  list.innerHTML = '';
  if (!questions.length) {
    list.innerHTML = `<div class="text-muted my-2">Вопросов пока нет.</div>`;
    return;
  }
  questions.forEach(q => {
    const tags = q.tags ? q.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const html = `
      <div class="q-card" data-id="${q.id}">
        <div class="question">${q.question}</div>
        <div class="tags">${tags.map(t => 
          `<span class="tag" onclick="filterQuestionsByTag('${encodeURIComponent(t)}')">${t}</span>`
        ).join(' ')}</div>
        <div class="author">${q.author_id || ''} | ${q.date || ''}</div>
      </div>`;
    list.insertAdjacentHTML('beforeend', html);
  });
}

// ===========================
// ФИЛЬТР ПОИСКА И ТЕГАМ
// ===========================
function filterQuestionsByText(str) {
  str = (str || "").toLowerCase().trim();
  if (!str) { renderQuestions(allQuestions); return; }
  renderQuestions(allQuestions.filter(q =>
    (q.question && q.question.toLowerCase().includes(str)) ||
    (q.tags && q.tags.toLowerCase().includes(str))
  ));
}

function filterQuestionsByTag(tag) {
  tag = decodeURIComponent(tag).toLowerCase();
  renderQuestions(allQuestions.filter(q =>
    q.tags && q.tags.toLowerCase().split(',').map(t => t.trim()).includes(tag)
  ));
  // Очищает input поиска для UX
  const qs = document.getElementById('question-search');
  if (qs) qs.value = '';
}

// ===========================
// ДОБАВИТЬ ВОПРОС
// ===========================
async function addQuestion(questionText, tags) {
  const user = (typeof getCurrentUser === "function" && getCurrentUser()) || null;
  if (!user) throw new Error("Войдите для добавления вопроса!");
  questionText = (questionText || "").trim();
  tags = (tags || []).map(t => t.trim().toLowerCase()).filter(Boolean);
  if (!questionText) throw new Error("Поле вопроса не может быть пустым!");
  const q = {
    id: crypto.randomUUID ? crypto.randomUUID() : (Date.now() + Math.random()).toString(16),
    author_id: user.id,
    question: questionText,
    date: (new Date()).toISOString().slice(0, 10),
    tags: tags.join(', ')
  };
  try {
    await fetch(`${window.SHEETDB_BASE}/sheet/questions`, {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ data: [q] })
    });
  } catch (e) {
    notify && notify("Ошибка при добавлении вопроса", "error");
    return;
  }
  notify && notify("Вопрос добавлен!", "success");
  await loadQuestions();
  await loadTags();
}

// ===========================
// УДАЛИТЬ ВОПРОС (для админа/автора в будущем)
// ===========================
async function deleteQuestion(questionId) {
  notify && notify("Удаление доступно только в Google Sheets или через SheetDB Premium", "error");
}

// ===========================
// ТЕГИ — облако тегов
// ===========================
async function loadTags() {
  try {
    const res = await fetch(`${window.SHEETDB_BASE}/sheet/questions`);
    const questions = await res.json();
    let tagSet = new Set();
    questions.forEach(q =>
      q.tags && q.tags.split(',').forEach(t => tagSet.add(t.trim().toLowerCase()))
    );
    renderTagCloud([...tagSet].filter(Boolean));
  } catch (e) {
    // обычно нет смысла ругаться на теги
  }
}

function renderTagCloud(tags) {
  const tagCloud = document.getElementById("tag-cloud");
  if (!tagCloud) return;
  if (!tags.length) {
    tagCloud.innerHTML = `<span class="text-muted">Тегов пока нет</span>`;
    return;
  }
  tagCloud.innerHTML = tags.map(
    t => `<span class="tag" onclick="filterQuestionsByTag('${encodeURIComponent(t)}')">${t}</span>`
  ).join(' ');
}

// ===========================
// СОБЫТИЯ UI
// ===========================
window.addEventListener('DOMContentLoaded', () => {
  loadQuestions();
  loadTags();

  // -- Добавление вопроса
  const askForm = document.getElementById('ask-form');
  if (askForm) {
    askForm.onsubmit = async (e) => {
      e.preventDefault();
      const qtxt = document.getElementById('ask-question').value;
      const tagsVal = document.getElementById('ask-tags').value;
      let tagsArr = tagsVal.split(',').map(t => t.trim());
      try {
        await addQuestion(qtxt, tagsArr);
        askForm.reset();
        showPage && showPage('questions-page');
      } catch (err) {
        notify && notify(err.message, "error");
      }
    };
    // Отмена - возврат к вопросам
    const cancelBtn = document.getElementById('ask-cancel');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        showPage && showPage('questions-page');
        askForm.reset();
      };
    }
  }

  // -- Фильтр по поиску (input)
  const questionSearch = document.getElementById('question-search');
  if (questionSearch) {
    questionSearch.oninput = () => {
      filterQuestionsByText(questionSearch.value);
    };
  }
});

window.filterQuestionsByTag = filterQuestionsByTag; // для onclick из html тегов
