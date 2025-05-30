// ratings.js — 5-балльная оценка (-2..2) для answers

// ===== ВЫСТАВИТЬ ОЦЕНКУ ОТВЕТУ (-2..2) =====
async function rateAnswer(answerId, ratingValue) {
  try {
    const user = (typeof getCurrentUser === "function") ? getCurrentUser() : null;
    if (!user) throw new Error("Войдите для оценки!");
    const val = Number(ratingValue);
    if (![ -2, -1, 0, 1, 2 ].includes(val))
      throw new Error("Оценка должна быть целым числом от -2 до 2!");

    // Один голос на ответ для каждого пользователя
    const checkResp = await fetch(
      `${window.SHEETDB_BASE}/search?sheet=ratings&answer_id=${encodeURIComponent(answerId)}&author_id=${encodeURIComponent(user.id)}`
    );
    const ratings = await checkResp.json();

    if (ratings.length) {
      notify && notify("Вы уже оценили этот ответ", "error");
      return false;
    }

    const ratingObj = {
      id: crypto.randomUUID ? crypto.randomUUID() : (Date.now() + Math.random()).toString(16),
      answer_id: answerId,
      author_id: user.id,
      rating: val,
      date: (new Date()).toISOString().slice(0, 10)
    };

    await fetch(`${window.SHEETDB_BASE}/sheet/ratings`, {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({data: [ratingObj]})
    });
    notify && notify("Спасибо за вашу оценку!", "success");

    // После оценки сразу обновить ответы (используем window.currentQuestionId)
    if (typeof loadAnswers === "function") {
      const questionId = window.currentQuestionId;
      if (questionId) loadAnswers(questionId);
    }
    return true;
  } catch (err) {
    notify && notify(err.message || "Ошибка оценки", "error");
  }
}

// ======= Получить средний рейтинг ответа =========
async function getAnswerScore(answerId) {
  try {
    const resp = await fetch(`${window.SHEETDB_BASE}/search?sheet=ratings&answer_id=${encodeURIComponent(answerId)}`);
    const ratings = await resp.json();
    if (!ratings.length) return null;
    const sum = ratings.map(r => Number(r.rating) || 0).reduce((a, b) => a + b, 0);
    const avg = sum / ratings.length;
    return {
      count: ratings.length,
      sum,
      avg: Math.round(avg * 100) / 100
    };
  } catch {
    return null;
  }
}

// ======= Отрисовать блок рейтинга (UI) =========
function renderRatingBlock(answerId, scoreObj) {
  let ratingHTML = "";
  if (scoreObj) {
    ratingHTML = `<span>Средняя оценка: <b>${scoreObj.avg}</b> <small>(${scoreObj.count} голос${scoreObj.count === 1 ? '' : 'ов'})</small></span>`;
  } else {
    ratingHTML = `<span>Пока не оценивали</span>`;
  }

  // Кнопки выставления оценки
  const user = (typeof getCurrentUser === "function") ? getCurrentUser() : null;
  let btns = "";
  if (user) {
    for (let i = -2; i <= 2; i++) {
      btns += `<button type="button" class="btn btn-outline-secondary btn-sm mx-1"
        onclick="rateAnswer('${answerId}', ${i})" aria-label="Поставить оценку ${i > 0 ? '+' : ''}${i}">${i > 0 ? '+' : ''}${i}</button>`;
    }
  } else {
    btns = `<span style="color:#ccc; font-size:.96em;">Оценки только для вошедших</span>`;
  }

  return `<div class="rating-box mt-2">${ratingHTML}
    <div class="rate-btns d-flex mt-1 gap-1">${btns}</div>
  </div>`;
}

// ===== Сбросить все оценки для ответа — только админ, опционально =====
async function adminResetRatingsForAnswer(answerId) {
  notify && notify("В бесплатном SheetDB удалять строки можно только вручную через Google Sheets!", "error");
}
