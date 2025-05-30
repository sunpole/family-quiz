// answers.js

window.SHEETDB_BASE = window.SHEETDB_BASE || "https://sheetdb.io/api/v1/jmjjg8jhv0yvi";

// ===== ЗАГРУЗКА ОТВЕТОВ ДЛЯ ВОПРОСА =====
async function loadAnswers(questionId) {
  try {
    window.currentQuestionId = questionId;
    if (typeof showPage === "function") showPage("answers-page");
    const answerField = document.getElementById("answer-text");
    if (answerField) answerField.value = "";
    if (typeof renderAnswersTitle === "function") {
      renderAnswersTitle(questionId);
    }
    const res = await fetch(
      `${window.SHEETDB_BASE}/search?sheet=answers&question_id=${encodeURIComponent(questionId)}`
    );
    const answers = await res.json();
    await renderAnswers(answers);

    const form = document.getElementById("answer-form");
    if (form) {
      const user = getCurrentUser && getCurrentUser();
      form.style.display = user ? "" : "none";
    }
  } catch (err) {
    notify && notify("Не удалось загрузить ответы", "error");
  }
}

// ===== ВЫВОД ОТВЕТОВ С РЕЙТИНГОМ (-2..2) =====
async function renderAnswers(answers) {
  const list = document.getElementById('answers-list');
  if (!list) return;
  list.innerHTML = '';
  for (let a of answers) {
    const score = await (typeof getAnswerScore === "function"
      ? getAnswerScore(a.id)
      : Promise.resolve(0));
    list.insertAdjacentHTML('beforeend', `
      <div class="a-card" data-id="${a.id}">
        <div class="answer">${a.answer}</div>
        <div class="author">${a.author_id || "?"} | ${a.date ? a.date : ''}</div>
        ${typeof renderRatingBlock === "function" ? renderRatingBlock(a.id, score) : ""}
      </div>
    `);
  }
  if (!answers.length) {
    list.innerHTML = `<div class="text-muted">Ответов пока нет — станьте первым!</div>`;
  }
}

// ===== ДОБАВИТЬ ОТВЕТ =====
async function addAnswer(questionId, answerText) {
  const user = getCurrentUser && getCurrentUser();
  if (!user) throw new Error("Авторизуйтесь для ответа");
  if (!answerText.trim()) throw new Error("Введите текст ответа");

  const ans = {
    id: crypto.randomUUID ? crypto.randomUUID() : (Date.now() + Math.random()).toString(16),
    question_id: questionId,
    author_id: user.id,
    answer: answerText,
    date: (new Date()).toISOString().slice(0, 10)
  };
  try {
    await fetch(`${window.SHEETDB_BASE}/sheet/answers`, {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ data: [ans] })
    });
    notify && notify("Ответ добавлен!", "success");
    const answerForm = document.getElementById('answer-form');
    if (answerForm) answerForm.reset();
    await loadAnswers(questionId);
  } catch (e) {
    notify && notify("Не удалось добавить ответ", "error");
  }
}

// ===== СЛУШАТЕЛЬ ДЛЯ ЗАГРУЗКИ ОТВЕТОВ ПО ВЫБОРУ ВОПРОСА =====
window.addEventListener('DOMContentLoaded', () => {
  const questionsBlock = document.getElementById('question-list');
  if (questionsBlock) {
    questionsBlock.addEventListener('click', (e) => {
      const card = e.target.closest('.q-card');
      if (card) {
        const questionId = card.dataset.id;
        loadAnswers(questionId);
      }
    });
  }
  const answersBack = document.getElementById('answers-back');
  if (answersBack) {
    answersBack.onclick = () => {
      if (typeof showPage === "function") showPage("questions-page");
    };
  }
  const answerForm = document.getElementById('answer-form');
  if (answerForm) {
    answerForm.onsubmit = async (e) => {
      e.preventDefault();
      try {
        const txt = document.getElementById('answer-text').value;
        await addAnswer(window.currentQuestionId, txt);
      } catch (err) {
        notify && notify(err.message || "Ошибка", "error");
      }
    };
  }
});
