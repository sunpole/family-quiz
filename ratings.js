// ratings.js

// Добавить или изменить оценку
async function rateAnswer(answerId, ratingValue) {
  const user = getCurrentUser();
  if (!user) throw new Error("Войдите, чтобы ставить оценки!");
  // Проверим, есть ли уже оценка от этого пользователя
  const res = await fetch(`${SHEETDB_BASE}/search?sheet=ratings&answer_id=${encodeURIComponent(answerId)}&author_id=${encodeURIComponent(user.id)}`);
  const rated = await res.json();
  if (rated.length) {
    // В SheetDB нет PATCH/PUT: или удаляем старую/добавляем новую (оставим только add для упрощения demo)
    notify("Вы уже ставили оценку!", "error");
    return;
  }
  const newRating = {
    id: crypto.randomUUID(),
    answer_id: answerId,
    author_id: user.id,
    rating: ratingValue,
    date: (new Date()).toISOString().slice(0, 10)
  };
  await fetch(`${SHEETDB_BASE}/sheet/ratings`, {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({data: [newRating]})
  });
  notify("Оценка сохранена!", "success");
  // Можно обновить UI рейтингового блока
}

// Функция для расчёта суммарного рейтинга ответа:
async function getAnswerRating(answerId) {
  const res = await fetch(`${SHEETDB_BASE}/search?sheet=ratings&answer_id=${encodeURIComponent(answerId)}`);
  const ratings = await res.json();
  return ratings.map(r => Number(r.rating) || 0).reduce((a, b) => a + b, 0);
}
