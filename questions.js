// questions.js  
const SHEETDB_BASE = "https://sheetdb.io/api/v1/jmjjg8jhv0yvi";  

// ===========================  
// ВЫВОД ВСЕХ ВОПРОСОВ  
// ===========================  
async function loadQuestions() {  
  try {  
    const res = await fetch(`${SHEETDB_BASE}/sheet/questions?sort=date&sort_by=desc`);  
    const questions = await res.json();  
    renderQuestions(questions);  
  } catch (err) {  
    notify("Ошибка загрузки вопросов", "error");  
  }  
}  

function renderQuestions(questions) {  
  const list = document.getElementById('question-list');  
  list.innerHTML = '';  
  questions.forEach(q => {  
    const tags = q.tags ? q.tags.split(',').map(t => t.trim()).filter(Boolean) : [];  
    const html = `  
      <div class="q-card" data-id="${q.id}">  
        <div class="question">${q.question}</div>  
        <div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join(' ')}</div>  
        <div class="author">${q.author_id} | ${q.date}</div>  
      </div>`;  
    list.insertAdjacentHTML('beforeend', html);  
  });  
}  

// ===========================  
// ДОБАВИТЬ ВОПРОС  
// ===========================  
async function addQuestion(questionText, tags) {  
  const user = getCurrentUser();  
  if (!user) throw new Error("Войдите для добавления вопроса!");  
  const q = {  
    id: crypto.randomUUID(),  
    author_id: user.id,  
    question: questionText,  
    date: (new Date()).toISOString().slice(0, 10),  
    tags: tags.map(t => t.trim().toLowerCase()).join(', ')  
  };  
  await fetch(`${SHEETDB_BASE}/sheet/questions`, {  
    method: "POST",  
    headers: {'Content-Type': 'application/json'},  
    body: JSON.stringify({data: [q]})  
  });  
  notify("Вопрос добавлен!", "success");  
  loadQuestions();  
}  

// ===========================  
// УДАЛИТЬ ВОПРОС (доступно админу или автору)  
// ===========================  
async function deleteQuestion(questionId) {  
  const user = getCurrentUser();  
  if (!user) throw new Error("Нет доступа");  
  // Имитация проверки — в идеале фильтровать на фронте списком вопросов юзера  
  if (!confirm("Удалить вопрос?")) return;  
  // В SheetDB нет метода удаления по id, только по API admin-паролю (детали см. SheetDB docs)  
  notify("Удаление доступно только в Google Sheets или через SheetDB Premium", "error");  
}  

// ===========================  
// ТЕГИ: собрать все теги (обновить облако/фильтр)  
// ===========================  
async function loadTags() {  
  const res = await fetch(`${SHEETDB_BASE}/sheet/questions`);  
  const questions = await res.json();  
  let tagSet = new Set();  
  questions.forEach(q =>  
    q.tags && q.tags.split(',').forEach(t => tagSet.add(t.trim().toLowerCase()))  
  );  
  renderTagCloud([...tagSet]);  
}  

function renderTagCloud(tags) {  
  const tagCloud = document.getElementById("tag-cloud");  
  if (!tagCloud) return;  
  tagCloud.innerHTML = tags.map(  
    t => `<span class="tag" onclick="filterQuestionsByTag('${t}')">${t}</span>`  
  ).join(' ');  
}  

window.addEventListener('DOMContentLoaded', () => {  
  loadQuestions();  
  loadTags();  

  // События добавления вопроса (пример)  
  const askForm = document.getElementById('ask-form');  
  if (askForm) {  
    askForm.onsubmit = async (e) => {  
      e.preventDefault();  
      const qtxt = document.getElementById('ask-question').value;  
      const tags = document.getElementById('ask-tags').value.split(',');  
      try {  
        await addQuestion(qtxt, tags);  
        askForm.reset();  
      } catch (err) {  
        notify(err.message, "error");  
      }  
    };  
  }  
});  
