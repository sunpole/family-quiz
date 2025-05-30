// ratings.js — 5-балльная оценка (-2..2) для answers

// SheetDB базовый URL уже должен быть в main.js, если что — дублируй тут
const SHEETDB_BASE = "https://sheetdb.io/api/v1/jmjjg8jhv0yvi";

// ===== ВЫСТАВИТЬ ОЦЕНКУ ОТВЕТУ (-2..2) =====
async function rateAnswer(answerId, ratingValue) {
  const user = getCurrentUser();
  if (!user) throw new Error("Войдите для оценки!");
  if (![ -2, -1, 0, 1, 2 ].includes(Number(ratingValue)))
    throw new Error("Оценка должна быть целым числом от -2 до 2!");

  // Проверить, не ставил ли этот пользователь уже оценку данному ответу
  const checkResp = await fetch(
    `${SHEETDB_BASE}/search?sheet=ratings&answer_id=${encodeURIComponent(answerId)}&author_id=${encodeURIComponent(user.id)}`
  );
  const ratings = await checkResp.json();

  // SheetDB бесплатно НЕ даёт удалять/обновлять — поэтому обычно можно только добавить оценку ОДИН РАЗ
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
  return true;
}

// ======= ПОЛУЧИТЬ СРЕДНИЙ РЕЙТИНГ ДЛЯ ОТВЕТА =========
async function getAnswerScore(answerId) {
  const resp = await fetch(`${SHEETDB_BASE}/search?sheet=ratings&answer_id=${encodeURIComponent(answerId)}`);
  const ratings = await resp.json();
  if (!ratings.length) return null;
  // Например, среднее арифметическое
  const sum = ratings.map(r => Number(r.rating) || 0).reduce((a, b) => a + b, 0);
  const avg = sum / ratings.length;
  return {
    count: ratings.length,
    sum,
    avg: Math.round(avg * 100) / 100
  };
}

// ===== Показать UI-оценки ***** (звёзды или +2/-2) ======
function renderRatingBlock(answerId, scoreObj) {
  // scoreObj: результат getAnswerScore (avg, sum, count)
  let ratingHTML = "";
  if (scoreObj) {
    ratingHTML = `<span>Средняя оценка: <b>${scoreObj.avg}</b> (${scoreObj.count} оценок)</span>`;
  } else {
    ratingHTML = `<span>Пока не оценивали</span>`;
  }

  // Блок для голосования
  let btns = '';
  for (let i = -2; i <= 2; i++) {
    btns += `<button onclick="rateAnswer('${answerId}', ${i})">${i}</button>`;
  }

  return `<div class="rating-box">${ratingHTML} <div class="rate-btns">${btns}</div></div>`;
}

// ===== Сбросить все оценки для ответа (только админ, опционально) =====
async function adminResetRatingsForAnswer(answerId) {
  notify("В бесплатном SheetDB удалять строки можно только вручную через Google Sheets!", "error");
}
