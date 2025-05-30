// main.js

// Config
const SHEETDB_BASE = "https://sheetdb.io/api/v1/jmjjg8jhv0yvi";
const LS_USER_KEY = "family_quiz_user";

// --- Основная логика показа страниц ---
function showPage(pageId) {
  // Спрячь все секции
  [
    "questions-page", "ask-page", "answers-page",
    "search-page", "login-page", "register-page", "admin-panel"
  ].forEach(id => {
    let el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  // Покажи выбранную
  let pageEl = document.getElementById(pageId);
  if (pageEl) pageEl.style.display = "";

  // Admin таб в navbar
  let user = getCurrentUser();
  let adminLink = document.getElementById('admin-nav-link');
  if (adminLink)
    adminLink.style.display = (user && user.status === "admin") ? "" : "none";
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
    if (userInfo) userInfo.textContent = user.login;
    if (logoutBtn) logoutBtn.style.display = "";
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
  } else {
    if (userInfo) userInfo.textContent = "";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (loginBtn) loginBtn.style.display = "";
    if (registerBtn) registerBtn.style.display = "";
  }
  updateUserStatusIndicator(user);
}

function updateUserStatusIndicator(user) {
  const indicator = document.getElementById('user-status-indicator');
  if (!indicator) return;
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
  if (!n) return;
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
  login = (login || "").trim();
  if (!login) throw new Error('Введите логин!');
  // Проверка на дублирование
  let resp = await fetch(`${SHEETDB_BASE}/search?sheet=users&login=${encodeURIComponent(login)}`);
  let exist = await resp.json();
  if (exist.length) throw new Error("Этот логин уже занят");
  // Проверяем есть ли админ в базе
  let adminsResp = await fetch(`${SHEETDB_BASE}/search?sheet=users&status=admin`);
  let admins = await adminsResp.json();
  let status = admins.length === 0 ? "admin" : "user";
  let user = {
    id: crypto.randomUUID ? crypto.randomUUID() : (Date.now() + Math.random()).toString(16),
    login: login,
    password: "0000",
    reg_date: (new Date()).toISOString().slice(0,10),
    status: status
  };
  await fetch(`${SHEETDB_BASE}/sheet/users`, {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({data: [user]})
  });
  // После регистрации сразу логиним!
  await loginUser(login, "0000");
}

// --- Логин ---
async function loginUser(login, password) {
  login = (login || "").trim();
  if (!login || !password) throw new Error("Введите логин и пароль");
  let resp = await fetch(`${SHEETDB_BASE}/search?sheet=users&login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`);
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
  showPage("questions-page");
  resetForms();

  // Проверка на наличие элементов перед назначением обработчиков
  let loginBtn = document.getElementById('login-btn');
  if (loginBtn) loginBtn.onclick = () => { showPage('login-page'); resetForms(); };
  let registerBtn = document.getElementById('register-btn');
  if (registerBtn) registerBtn.onclick = () => { showPage('register-page'); resetForms(); };
  let logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.onclick = () => { logoutUser(); notify('Вы вышли', 'success'); };
  let loginToRegister = document.getElementById('login-to-register');
  if (loginToRegister) loginToRegister.onclick = () => { showPage('register-page'); resetForms(); };
  let registerToLogin = document.getElementById('register-to-login');
  if (registerToLogin) registerToLogin.onclick = () => { showPage('login-page'); resetForms(); };
  let navQuestions = document.getElementById('nav-questions');
  if (navQuestions) navQuestions.onclick = () => showPage('questions-page');
  let navAsk = document.getElementById('nav-ask');
  if (navAsk) navAsk.onclick = () => showPage('ask-page');
  let navSearch = document.getElementById('nav-search');
  if (navSearch) navSearch.onclick = () => showPage('search-page');
  let adminNavLink = document.getElementById('admin-nav-link');
  if (adminNavLink) adminNavLink.onclick = () => showPage('admin-panel');

  // Форма Логин
  let loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.onsubmit = async (e) => {
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
  let registerForm = document.getElementById('register-form');
  if (registerForm) registerForm.onsubmit = async (e) => {
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
