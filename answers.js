// answers.js

// ЗАГРУЗКА ОТВЕТОВ ДЛЯ ВОПРОСА
async function loadAnswers(questionId) {
  try {
    const res = await fetch(`${SHEETDB_BASE}/search?sheet=answers&question_id=${encodeURIComponent(questionId)}`);
    const answers = await res.json();
    renderAnswers(answers);
  } catch (err) {
    notify("Не удалось загрузить ответы", "error");
  }
}

function renderAnswers(answers) {
  const list = document.getElementById('answers-list');
  list.innerHTML = '';
  answers.forEach(a => {
    list.insertAdjacentHTML('beforeend', `
      <div class="a-card" data-id="${a.id}">
        <div class="answer">${a.answer}</div>
        <div class="author">${a.author_id} | ${a.date ?? ''}</div>
      </div>
    `);
  });
}

// ДОБАВИТЬ ОТВЕТ
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

window.addEventListener('DOMContentLoaded', () => {
  // Пример работы: автозагрузка ответов при выборе вопроса
  // Реализуй выбор вопроса (например, по клику на .q-card)
});
