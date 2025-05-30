// Config
const SHEETDB_BASE = "https://sheetdb.io/api/v1/jmjjg8jhv0yvi";
const LS_USER_KEY = "family_quiz_user";

// --- Основная логика показа страниц ---
function showPage(pageId) {
  // Спрячь все секции
  ["questions-page", "ask-page", "answers-page", "search-page", "login-page", "register-page", "admin-panel"]
    .forEach(id => document.getElementById(id).style.display = "none");
  // Покажи выбранную
  if (document.getElementById(pageId))
    document.getElementById(pageId).style.display = '';

  // Admin таб в navbar
  let user = getCurrentUser();
  document.getElementById('admin-nav-link').style.display =
    user && user.status === "admin" ? "" : "none";
}

// --- Работа с текущим юзером ---
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(LS_USER_KEY));
  } catch (e) { return null; }
}
function saveUser(user) {
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
}
function clearUser() {
  localStorage.removeItem(LS_USER_KEY);
}

// --- Статус и панель пользователя ---
function updateUserPanel() {
  const user = getCurrentUser();
  const userInfo = document.getElementById('user-info');
  const logoutBtn = document.getElementById('logout-btn');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');

  if (user) {
    userInfo.textContent = user.login;
    logoutBtn.style.display = "";
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
  } else {
    userInfo.textContent = "";
    logoutBtn.style.display = "none";
    loginBtn.style.display = "";
    registerBtn.style.display = "";
  }
  updateUserStatusIndicator(user);
}

function updateUserStatusIndicator(user) {
  const indicator = document.getElementById('user-status-indicator');
  let status = 'guest', label = 'Гость', dotClass = 'status-guest';
  if (user && user.status) {
    status = user.status;
    if (status === 'admin') { label = 'Админ'; dotClass = 'status-admin'; }
    else                   { label = 'Пользователь'; dotClass = 'status-user'; }
  }
  indicator.innerHTML = `<span class="status-dot ${dotClass}"></span> <span>${label}</span>`;
}

// --- Уведомление ---
function notify(msg, type) {
  const n = document.getElementById('notify');
  n.className = type ? type : '';
  n.textContent = msg;
  n.style.display = "";
  setTimeout(() => { n.style.display = "none"; }, 3000);
}

// --- Сброс форм ---
function resetForms() {
  ['login-form', 'register-form'].forEach(id => {
    let f = document.getElementById(id);
    if (f) f.reset();
  });
}

// --- Регистрация ---
async function registerUser(login) {
  login = login.trim();
  if (!login) throw new Error('Введите логин!');
  // Проверка на дублирование
  let resp = await fetch(`${SHEETDB_BASE}/search?login=${encodeURIComponent(login)}`);
  let exist = await resp.json();
  if (exist.length) throw new Error("Этот логин уже занят");
  // Проверяем есть ли админ в базе
  let adminsResp = await fetch(`${SHEETDB_BASE}/search?status=admin`);
  let admins = await adminsResp.json();
  let status = admins.length === 0 ? "admin" : "user";
  let user = {
    id: crypto.randomUUID ? crypto.randomUUID() : (Date.now() + Math.random()).toString(16),
    login: login,
    password: "0000",
    reg_date: (new Date()).toISOString().slice(0,10),
    status: status
  };
  await fetch(SHEETDB_BASE, {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({data: [user]})
  });
  // После регистрации сразу логиним!
  await loginUser(login, "0000");
}

// --- Логин ---
async function loginUser(login, password) {
  login = login.trim();
  if (!login || !password) throw new Error("Введите логин и пароль");
  let resp = await fetch(`${SHEETDB_BASE}/search?login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`);
  let users = await resp.json();
  if (!users.length) throw new Error("Неверный логин или пароль");
  let user = users[0];
  saveUser(user);
  updateUserPanel();
  showPage("questions-page");
}

// --- Выход ---
function logoutUser() {
  clearUser();
  updateUserPanel();
  showPage("questions-page");
}

// --- Обработчики форм и переходов ---
window.addEventListener('DOMContentLoaded', () => {
  updateUserPanel();
  showPage("questions-page"); // или авто-вопросы
  resetForms();

  // Кнопки авторизации
  document.getElementById('login-btn').onclick = () => { showPage('login-page'); resetForms(); };
  document.getElementById('register-btn').onclick = () => { showPage('register-page'); resetForms(); };
  document.getElementById('logout-btn').onclick = () => { logoutUser(); notify('Вы вышли', 'success'); };
  document.getElementById('login-to-register').onclick = () => { showPage('register-page'); resetForms(); };
  document.getElementById('register-to-login').onclick = () => { showPage('login-page'); resetForms(); };

  // Навигация между страницами
  document.getElementById('nav-questions').onclick = () => showPage('questions-page');
  document.getElementById('nav-ask').onclick = () => showPage('ask-page');
  document.getElementById('nav-search').onclick = () => showPage('search-page');
  document.getElementById('admin-nav-link').onclick = () => showPage('admin-panel');

  // Форма Логин
  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
      let login = document.getElementById('login-login').value;
      let password = document.getElementById('login-password').value;
      await loginUser(login, password);
      notify("Вы вошли!", "success");
    } catch (err) {
      notify(err.message || "Ошибка входа", "error");
    }
  };

  // Форма Регистрация
  document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
      let login = document.getElementById('register-login').value;
      await registerUser(login);
      notify("Регистрация успешна!", "success");
    } catch (err) {
      notify(err.message || "Ошибка регистрации", "error");
    }
  };
});
