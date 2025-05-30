// answers.js

const SHEETDB_BASE = "https://sheetdb.io/api/v1/jmjjg8jhv0yvi";

// ===== ЗАГРУЗКА ОТВЕТОВ ДЛЯ ВОПРОСА =====
async function loadAnswers(questionId) {
  try {
    const res = await fetch(
      `${SHEETDB_BASE}/search?sheet=answers&question_id=${encodeURIComponent(questionId)}`
    );
    const answers = await res.json();
    await renderAnswers(answers); // Асинхронно, тк ждём рейтинги
  } catch (err) {
    notify("Не удалось загрузить ответы", "error");
  }
}

// ===== ВЫВОД ОТВЕТОВ С РЕЙТИНГОМ (-2..2) =====
async function renderAnswers(answers) {
  const list = document.getElementById('answers-list');
  list.innerHTML = '';
  for (let a of answers) {
    // ожидаем получение рейтинга для каждого ответа
    const score = await getAnswerScore(a.id); // функция из ratings.js
    list.insertAdjacentHTML('beforeend', `
      <div class="a-card" data-id="${a.id}">
        <div class="answer">${a.answer}</div>
        <div class="author">${a.author_id} | ${a.date ? a.date : ''}</div>
        ${renderRatingBlock(a.id, score)} <!-- функция из ratings.js -->
      </div>
    `);
  }
}

// ===== ДОБАВИТЬ ОТВЕТ =====
async function addAnswer(questionId, answerText) {
  const user = getCurrentUser();
  if (!user) throw new Error("Авторизуйтесь для ответа");
  const ans = {
    id: crypto.randomUUID(),
    question_id: questionId,
    author_id: user.id,
    answer: answerText,
    date: (new Date()).toISOString().slice(0, 10)
  };
  await fetch(`${SHEETDB_BASE}/sheet/answers`, {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({data: [ans]})
  });
  notify("Ответ добавлен!", "success");
  loadAnswers(questionId);
}

// ===== СЛУШАТЕЛЬ ДЛЯ ЗАГРУЗКИ ОТВЕТОВ ПО ВЫБОРУ ВОПРОСА =====
window.addEventListener('DOMContentLoaded', () => {
  // РЕАЛИЗУЙ обработку клика на вопрос, например:
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
