# family-quiz

Q&A system for family use with user roles and data storage in Google Sheets via SheetDB API.

---

## English

### What is this project?

**family-quiz** is a simple Q&A web app to organize fun quiz games or surveys for families, classes, or small communities.  
All questions, answers, ratings, and user accounts are stored in a Google Spreadsheet via a free SheetDB API.

### Key Features

- User roles: guest, user, admin
- User registration/authorization
- Add and answer questions
- Rate answers
- Google Sheets as backend (all data is editable in the spreadsheet)
- 100% static: deploy on GitHub Pages, Netlify, Vercel, etc.

### Project Links

- **SheetDB API Endpoint:**  
  [https://sheetdb.io/api/v1/jmjjg8jhv0yvi](https://sheetdb.io/api/v1/jmjjg8jhv0yvi)
- **Google Spreadsheet:**  
  [https://docs.google.com/spreadsheets/d/1S9nJ_rhan9L88bxMi6wRUip2xr7r0eraZ5nacRFfgUE/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1S9nJ_rhan9L88bxMi6wRUip2xr7r0eraZ5nacRFfgUE/edit?usp=sharing)

### How to use

1. **Clone this repository**
2. **Open `index.html` in the browser**  
   _Or deploy to GitHub Pages/Netlify for online access_
3. **Set up "admin" in spreadsheet manually if needed**
   - The very first registered user can be admin, or you can edit the spreadsheet to change role/status any time.
4. **Edit API key**  
   - Open `main.js` and insert your API URL (already filled for demo)
5. **Ready!** All questions and answers will synchronize in real time with your Google Sheet.

### Technologies

- JavaScript (Vanilla)
- HTML/CSS
- Google Sheets + [SheetDB.io](https://sheetdb.io/) (no own backend)

---

## Русский

### Что это за проект?

**family-quiz** — веб-приложение "Вопросы-Ответы" для семьи, класса или малого коллектива.  
Все учетные записи, вопросы, ответы и оценки хранятся в Google Таблице через бесплатный API сервиса SheetDB.

### Основные возможности

- Роли: гость, пользователь, админ
- Регистрация и авторизация
- Добавление и ответы на вопросы
- Оценка ответов
- Хранение и просмотр всех данных прямо в Google-таблице
- 100% статическое решение, не требует серверов

### Важные ссылки

- **SheetDB API**:  
  [https://sheetdb.io/api/v1/jmjjg8jhv0yvi](https://sheetdb.io/api/v1/jmjjg8jhv0yvi)
- **Google Таблица**:  
  [https://docs.google.com/spreadsheets/d/1S9nJ_rhan9L88bxMi6wRUip2xr7r0eraZ5nacRFfgUE/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1S9nJ_rhan9L88bxMi6wRUip2xr7r0eraZ5nacRFfgUE/edit?usp=sharing)

### Как пользоваться

1. **Склонируйте репозиторий**
2. **Откройте `index.html` в браузере**  
   _или сразу разместите сайт на GitHub Pages, Netlify, Vercel — все работает "из коробки"_
3. **Назначьте админа**  
   - Первый зарегистрированный человек становится "admin" автоматически, либо измените роль в таблице вручную.
4. **Проверьте API-ключ**  
   - В `main.js` вставьте актуальный SheetDB API (уже заполнен для демо)
5. **Готово!** Все вопросы, ответы, оценки сразу отображаются из гугл-таблицы.

### Технологии

- Чистый JavaScript
- HTML/CSS
- Google Таблицы + SheetDB (API)

---

## Security & Privacy

All data you input (accounts, questions, answers) is stored in the provided Google Spreadsheet.  
API and spreadsheet IDs are visible to users — do not store sensitive data!

---

## Quick demo setup

1. Use the provided spreadsheet and API or create your own copy in Google Sheets and SheetDB.
2. Clone or fork this repo.
3. Open `index.html` (or deploy).
4. You are ready to quiz!

---

_License: MIT_
