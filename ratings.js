// ratings.js — 5-балльная оценка (-2..2) для answers

const SHEETDB_BASE = "https://sheetdb.io/api/v1/jmjjg8jhv0yvi";

// ===== ВЫСТАВИТЬ ОЦЕНКУ ОТВЕТУ (-2..2) =====
async function rateAnswer(answerId, ratingValue) {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("Войдите для оценки!");
    if (![ -2, -1, 0, 1, 2 ].includes(Number(ratingValue)))
      throw new Error("Оценка должна быть целым числом от -2 до 2!");

    // Один голос на ответ для каждого пользователя
    const checkResp = await fetch(
      `${SHEETDB_BASE}/search?sheet=ratings&answer_id=${encodeURIComponent(answerId)}&author_id=${encodeURIComponent(user.id)}`
    );
    const ratings = await checkResp.json();

    if (ratings.length) {
      notify("Вы уже оценили этот ответ", "error");
      return false;
    }

    const ratingObj = {
      id: crypto.randomUUID(),
      answer_id: answerId,
      author_id: user.id,
      rating: ratingValue,
      date: (new Date()).toISOString().slice(0, 10)
    };

    await fetch(`${SHEETDB_BASE}/sheet/ratings`, {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({data: [ratingObj]})
    });
    notify("Спасибо за вашу оценку!", "success");

    // После оценки обновить из answers.js (если такой метод есть)
    if (typeof loadAnswers === "function") {
      const currentForm = document.getElementById('answer-form');
      if (currentForm && currentForm.dataset.questionId) {
        loadAnswers(currentForm.dataset.questionId);
      }
    }
    return true;
  } catch (err) {
    notify(err.message || "Ошибка оценки", "error");
  }
}

// ======= Получить средний рейтинг ответа =========
async function getAnswerScore(answerId) {
  const resp = await fetch(`${SHEETDB_BASE}/search?sheet=ratings&answer_id=${encodeURIComponent(answerId)}`);
  const ratings = await resp.json();
  if (!ratings.length) return null;
  const sum = ratings.map(r => Number(r.rating) || 0).reduce((a, b) => a + b, 0);
  const avg = sum / ratings.length;
  return {
    count: ratings.length,
    sum,
    avg: Math.round(avg * 100) / 100
  };
}

// ======= Отрисовать блок рейтинга (UI) =========
function renderRatingBlock(answerId, scoreObj) {
  // scoreObj: результат getAnswerScore
  let ratingHTML = "";
  if (scoreObj) {
    ratingHTML = `<span>Средняя оценка: <b>${scoreObj.avg}</b> <small>(${scoreObj.count} голосов)</small></span>`;
  } else {
    ratingHTML = `<span>Пока не оценивали</span>`;
  }

  // Кнопки выставления оценки
  const user = getCurrentUser();
  let btns = "";
  if (user) {
    for (let i = -2; i <= 2; i++) {
      btns += `<button type="button" class="btn btn-sm" onclick="rateAnswer('${answerId}', ${i})">${i>0?'+':''}${i}</button>`;
    }
  } else {
    btns = `<span style="color:#ccc; font-size:.96em;">Только для вошедших пользователей</span>`;
  }

  return `<div class="rating-box" style="margin-top:12px;">${ratingHTML}
    <div class="rate-btns" style="margin-top:5px; gap:3px;">${btns}</div>
  </div>`;
}

// ===== Сбросить все оценки для ответа (только админ, опционально) =====
async function adminResetRatingsForAnswer(answerId) {
  notify("В бесплатном SheetDB удалять строки можно только вручную через Google Sheets!", "error");
}
