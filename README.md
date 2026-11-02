# 🚀 SimpleArduino — Інтерактивна освітня платформа з робототехніки та мікроконтролерів

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Netlify Status](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://simplearduino-lab8.netlify.app)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white)](https://nazarbuliga.github.io/simplearduino-lab8/)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG_2.2_AA-success?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)

> **Лабораторна робота №8** з дисципліни *«Веб-розробка та дизайн»*  
> **Тема:** *«Деплой проєкту. Контроль версій Git та GitHub»*  
> **Автор:** студент групи ПП-25 Булига Назарій  
> **Кафедра:** «Систем автоматизованого проектування», НУ «Львівська політехніка»

---

## 🌐 Живі демонстраційні посилання (Live Demos)

| Платформа хостингу | Статус | Публічне посилання | Опис середовища |
| :--- | :---: | :--- | :--- |
| **Netlify** | ✅ Active | [simplearduino-lab8.netlify.app](https://simplearduino-lab8.netlify.app) | Production CDN, HTTP/2, SSL, gzip/brotli, `netlify.toml` |
| **GitHub Pages** | ✅ Active | [nazarbuliga.github.io/simplearduino-lab8](https://nazarbuliga.github.io/simplearduino-lab8/) | Native GitHub Static Hosting із гілки `main` |
| **Віддалений репозиторій** | ✅ Public | [github.com/nazarbuliga/simplearduino-lab8](https://github.com/nazarbuliga/simplearduino-lab8) | Повний вихідний код, історія комітів, гілки |

---

## 📖 Про проєкт (Project Overview)

**SimpleArduino** — це сучасний високопродуктивний навчальний веб-хаб, розроблений для швидкого, інтуїтивного та захопливого опанування мікроконтролерів Arduino, мови C/C++ та схемотехніки. Проєкт розв'язує проблему високого порогу входу для початківців у сфері Embedded/IoT через поетапну методологію навчання **Learning Ladder** («Сходинки майстерності»).

### Ключові функціональні модулі:
- **Interactive Learning Ladder:** Чітке розбиття навчального процесу на 3 рівні:
  - 🟢 **Початківець (Beginner):** 12 базових схем (Blink, кнопка, світлофор, потенціометр), робота у хмарному симуляторі Autodesk Tinkercad.
  - 🟡 **Практик (Intermediate):** 8 практичних систем (ультразвуковий далекомір, цифрова метеостанція, сервоприводи, LCD/OLED дисплеї).
  - 🔴 **Інженер (Advanced):** 6 комплексних розробок (автономні колісні роботи, IoT Smart Home на ESP32/Arduino, FreeRTOS багатозадачність).
- **Multi-Page Ecosystem:** 10 деталізованих сторінок апаратних проєктів із підключенням інтерактивних схем Tinkercad, принципових схем, вихідного коду C++ та інструкцій налагодження.
- **Media Hub & Interactive Specs:** Вбудовані інтерактивні карти лабораторій, інструкції, довідник компонентів, FAQ-акордеон та система пошуку схем у реальному часі.
- **Responsive & Accessible UI:** Повна адаптивність за методологією Mobile-First, висока контрастність WCAG 2.2 Level AA, оптимізовані тач-зони (min 44x44px).

---

## 🛠 Стек технологій (Tech Stack)

- **Семантична розмітка:** HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`) з повними ARIA-атрибутами.
- **Стилізація та утилітарний CSS:** [Tailwind CSS v3+](https://tailwindcss.com/) (підключення через високошвидкісний CDN та кастомізація палітри `#0EA5E9 Sky`, `#0F172A Slate-900`, `#F8FAFC`).
- **Спеціальні ефекти:** Користувацький CSS (`css/custom-styles.css`) — м'які тіні Claymorphism, плавний скролінг `scroll-behavior: smooth`, стилізація вебкіт-скролбару.
- **Клієнтська логіка:** Vanilla JavaScript (ES6+) — модуль керування мобільним навігаційним меню, фільтрація рівнів складності, інтерактивні стани карток.
- **Контроль версій та DevOps:**
  - **Git 2.x:** Розподілена система контролю версій, семантичні коміти [Conventional Commits](https://www.conventionalcommits.org/).
  - **GitHub:** Хмарний хаб коду, гілкова модель feature branching, об'єднання змін та Pull Requests.
  - **GitHub Pages & Netlify:** Автоматизований багаторівневий CI/CD деплой.

---

## 📁 Архітектура файлової системи (Repository Structure)

```text
simplearduino-lab8/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Автоматизований workflow деплою в GitHub Pages
├── assets/
│   ├── icons/                  # Векторні SVG-іконки (апаратні, інтерфейсні, брендові)
│   └── images/                 # Оптимізована растрово-векторна графіка та схеми
├── css/
│   └── custom-styles.css       # Додаткові стилі бренду (claymorphism, keyframes, scrollbar)
├── js/
│   └── main.js                 # Клієнтський скрипт керування UI-станами та мобільним меню
├── .gitignore                  # Перелік виключень системних та сміттєвих файлів
├── 404.html                    # Фірмова сторінка помилки 404 для SPA/хостингу
├── about.html                  # Сторінка «Про платформу та команду розробників»
├── advanced.html               # Каталог схем інженерного рівня
├── beginner.html               # Каталог схем початкового рівня
├── index.html                  # Головний лендинг освітнього хабу SimpleArduino
├── intermediate.html           # Каталог схем рівня «Практик»
├── learning-ladder.html        # Детальна інтерактивна дорожня карта Learning Ladder
├── netlify.toml                # Конфігурація заголовків кешування та редиректів Netlify
├── project-01-blink.html       # Проєкт 1: Лабораторний світлодіодний маяк (Blink)
├── project-02-button.html      # Проєкт 2: Тактова кнопка та антидребезг контактів
├── project-03-traffic-light.html # Проєкт 3: Адаптивний 3-фазний світлофор
├── project-04-potentiometer.html # Проєкт 4: Аналогове регулювання PWM (потенціометр)
├── project-05-ultrasonic.html  # Проєкт 5: Ультразвуковий парктронік HC-SR04
├── project-06-weather-station.html # Проєкт 6: Метеостанція DHT11 + LCD1602 I2C
├── project-07-servo-tracker.html # Проєкт 7: Двоосьовий трекер сонячного світла (SG90)
├── project-08-autonomous-robot.html # Проєкт 8: Автономний робот на моторному щиті L298N
├── project-09-iot-smart-home.html # Проєкт 9: IoT розумний дім (ESP32 / MQTT / Relay)
├── project-10-freertos-multitask.html # Проєкт 10: Реальний час FreeRTOS багатозадачність
└── README.md                   # Документація проєкту та технічний паспорт репозиторію
```

---

## ⚙️ Локальний запуск та встановлення (Quick Start)

Для розгортання та перегляду проєкту на локальній машині не потрібно встановлювати важкі фреймворки або налаштовувати компілятори. Достатньо мати встановлений Git та будь-який локальний веб-сервер.

### 1. Клонування репозиторію
```bash
# Клонування віддаленого репозиторію через HTTPS
git clone https://github.com/nazarbuliga/simplearduino-lab8.git

# Перехід у робочу директорію проєкту
cd simplearduino-lab8
```

### 2. Запуск локального середовища
Оберіть один із зручних для вас способів:

- **Спосіб А (VS Code Live Server):**
  1. Відкрийте папку в Visual Studio Code (`code .`).
  2. Встановіть розширення *Live Server* (Five Server або Live Server by Ritwick Dey).
  3. Клікніть правою кнопкою миші на файлі `index.html` → **«Open with Live Server»**.
  4. Сайт відкриється за адресою `http://127.0.0.1:5500/`.

- **Спосіб Б (Python вбудований HTTP-сервер):**
  ```bash
  python -m http.server 8000
  ```
  Після цього відкрийте у браузері: `http://localhost:8000`.

- **Спосіб В (Node.js npx serve):**
  ```bash
  npx serve .
  ```

---

## 🔄 Модель гілкування та культура комітів (Branching & Commits)

У проєкті суворо дотримується стандарт **Conventional Commits 1.0.0**:

- `feat:` додавання нового функціоналу або нової сторінки проєкту.
- `fix:` виправлення багів верстки, доступності чи скриптів.
- `style:` оновлення класів оформлення, відступів, кольорів Tailwind CSS без зміни логіки.
- `docs:` зміни в документації (`README.md`, коментарях, інструкціях).
- `refactor:` рефакторинг та оптимізація структури коду.
- `chore:` технічні оновлення конфігурацій хостингу (`netlify.toml`, `.gitignore`).

### Створення робочої гілки (Feature Branch):
```bash
# Створення нової гілки для функціоналу та перехід на неї
git checkout -b feature/seo-meta-optimization

# Перевірка стану робочої області
git status

# Фіксація змін
git add .
git commit -m "feat(seo): implement Open Graph tags and JSON-LD structured data"

# Повернення в основну гілку та злиття
git checkout main
git merge feature/seo-meta-optimization
```

---

## 👨‍💻 Автор та контакти

- **Виконавець:** Булига Назарій  
- **Академічна група:** ПП-25 (Факультет комп'ютерних наук та інформаційних технологій)  
- **Кафедра:** «Систем автоматизованого проектування» (САПР)  
- **Навчальний заклад:** Національний університет «Львівська політехніка»  
- **Електронна пошта:** `nazariy.bulyha@lpnu.ua`  
- **GitHub профіль:** [@nazarbuliga](https://github.com/nazarbuliga)

---

## 📄 Ліцензія

Проєкт створено в навчальних цілях у рамках курсу «Веб-розробка та дизайн». Код поширюється за відкритою ліцензією [MIT](LICENSE).
