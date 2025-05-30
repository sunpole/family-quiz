// main.js

const LS_USER_KEY = "family_quiz_user";

// --- Показывать секцию по id, скрыть остальные ---
function showPage(pageId) {
  [
    "questions-page", "ask-page", "answers-page",
    "search-page", "login-page", "register-page", "admin-panel"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  const pageEl = document.getElementById(pageId);
  if (pageEl) pageEl.style.display = "";

  // Админка в навигации (только если статус admin)
  const user = getCurrentUser();
  const adminLink = document.getElementById('admin-nav-link');
  if (adminLink)
    adminLink.style.display = (user && user.status === "admin") ? "" : "none";
}

// --- User localStorage ---
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(LS_USER_KEY));
  } catch {
    return null;
  }
}
function saveUser(user) {
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
}
function clearUser() {
  localStorage.removeItem(LS_USER_KEY);
}

// --- Панель пользователя, статус ---
function updateUserPanel() {
  const user = getCurrentUser();
  const userInfo = document.getElementById('user-info');
  const logoutBtn = document.getElementById('logout-btn');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  if (userInfo) userInfo.textContent = user ? user.login : '';
  if (logoutBtn) logoutBtn.style.display = user ? '' : 'none';
  if (loginBtn) loginBtn.style.display = user ? 'none' : '';
  if (registerBtn) registerBtn.style.display = user ? 'none' : '';
  updateUserStatusIndicator(user);

  // Перестраховка: обновить admin-nav при смене пользователя
  const adminLink = document.getElementById('admin-nav-link');
  if (adminLink)
    adminLink.style.display = (user && user.status === "admin") ? "" : "none";
}
function updateUserStatusIndicator(user) {
  const indicator = document.getElementById('user-status-indicator');
  if (!indicator) return;
  let label = 'Гость', dotClass = 'status-guest';
  if (user && user.status) {
    if (user.status === 'admin') { label = 'Админ'; dotClass = 'status-admin'; }
    else { label = 'Пользователь'; dotClass = 'status-user'; }
  }
  indicator.innerHTML = `<span class="status-dot ${dotClass}"></span> <span>${label}</span>`;
}

// --- Мини-уведомления ---
function notify(msg, type) {
  const n = document.getElementById('notify');
  if (!n) return;
  n.className = type ? type : '';
  n.textContent = msg;
  n.style.display = "";
  setTimeout(() => { n.style.display = "none"; }, 3000);
}

// --- Сбросить все формы (login/register/ask/answer) ---
function resetForms() {
  ['login-form', 'register-form', 'ask-form', 'answer-form'].forEach(id => {
    const f = document.getElementById(id);
    if (f) f.reset();
  });
}

// --- Регистрация пользователя ---
async function registerUser(login) {
  login = (login || "").trim();
  if (!login) throw new Error('Введите логин!');
  let resp, exist, adminsResp, admins, status;
  try {
    resp = await fetch(`${window.SHEETDB_BASE}/search?sheet=users&login=${encodeURIComponent(login)}`);
    exist = await resp.json();
  } catch (e) { throw new Error("Ошибка соединения с базой"); }
  if (exist.length) throw new Error("Этот логин уже занят");
  try {
    adminsResp = await fetch(`${window.SHEETDB_BASE}/search?sheet=users&status=admin`);
    admins = await adminsResp.json();
  } catch (e) { admins = []; }
  status = admins.length === 0 ? "admin" : "user";
  const user = {
    id: crypto.randomUUID ? crypto.randomUUID() : (Date.now() + Math.random()).toString(16),
    login: login,
    password: "0000",
    reg_date: (new Date()).toISOString().slice(0,10),
    status
  };
  try {
    await fetch(`${window.SHEETDB_BASE}?sheet=users`, {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({data: [user]})
    });
  } catch (e) { throw new Error("Ошибка связи с базой"); }
  await loginUser(login, "0000");
}

// --- Логин пользователя ---
async function loginUser(login, password) {
  login = (login || "").trim();
  if (!login || !password) throw new Error("Введите логин и пароль");
  let resp, users;
  try {
    resp = await fetch(`${window.SHEETDB_BASE}/search?sheet=users&login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`);
    users = await resp.json();
  } catch (e) { throw new Error("Нет ответа от базы"); }
  if (!users.length) throw new Error("Неверный логин или пароль");
  const user = users[0];
  saveUser(user);
  updateUserPanel();
  showPage("questions-page");
}

// --- Выход пользователя ---
function logoutUser() {
  clearUser();
  updateUserPanel();
  showPage("questions-page");
}

// --- Обработчики переходов, кнопок и форм ---
window.addEventListener('DOMContentLoaded', () => {
  updateUserPanel();
  showPage("questions-page");
  resetForms();

  // Навигация
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) loginBtn.onclick = () => { showPage('login-page'); resetForms(); };
  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) registerBtn.onclick = () => { showPage('register-page'); resetForms(); };
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.onclick = () => { logoutUser(); notify('Вы вышли', 'success'); };
  const loginToRegister = document.getElementById('login-to-register');
  if (loginToRegister) loginToRegister.onclick = () => { showPage('register-page'); resetForms(); };
  const registerToLogin = document.getElementById('register-to-login');
  if (registerToLogin) registerToLogin.onclick = () => { showPage('login-page'); resetForms(); };
  const navQuestions = document.getElementById('nav-questions');
  if (navQuestions) navQuestions.onclick = () => showPage('questions-page');
  const navAsk = document.getElementById('nav-ask');
  if (navAsk) navAsk.onclick = () => showPage('ask-page');
  const navSearch = document.getElementById('nav-search');
  if (navSearch) navSearch.onclick = () => showPage('search-page');
  const adminNavLink = document.getElementById('admin-nav-link');
  if (adminNavLink) adminNavLink.onclick = () => showPage('admin-panel');

  // Форма Логин
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const login = document.getElementById('login-login').value;
      const password = document.getElementById('login-password').value;
      await loginUser(login, password);
      notify("Вы вошли!", "success");
    } catch (err) {
      notify(err.message || "Ошибка входа", "error");
    }
  };

  // Форма Регистрация
  const registerForm = document.getElementById('register-form');
  if (registerForm) registerForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const login = document.getElementById('register-login').value;
      await registerUser(login);
      notify("Регистрация успешна!", "success");
    } catch (err) {
      notify(err.message || "Ошибка регистрации", "error");
    }
  };
});
