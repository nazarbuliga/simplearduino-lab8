/**
 * ==============================================================================
 * Лабораторна робота №10: Інтеграція динамічних медіакомпонентів та JS-бібліотек
 * Освітній вебпроєкт: SimpleArduino
 * Автор: Булига Назарій, група ПП-25
 * ==============================================================================
 * Підключені бібліотеки через CDN:
 * 1. Typed.js v2.1.0 — інтерактивна друкована анімація C++ коду в Hero-секції
 * 2. Swiper.js v11 — сенсорна адаптивна карусель відгуків з pauseOnMouseEnter
 * 3. Fancybox v5.0 — модальна мультимедійна галерея схем з зумом та повноекранним переглядом
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------------------------------------------
  // 1. Ініціалізація Typed.js (Завдання підвищеної складності: друкований ефект)
  // ----------------------------------------------------------------------------
  const typedElement = document.getElementById('typed-code-runner');
  if (typedElement && typeof Typed !== 'undefined') {
    new Typed('#typed-code-runner', {
      strings: [
        '^300void loop() { digitalWrite(LED_PIN, HIGH); }^800',
        '^300int sensorValue = analogRead(A0);^800',
        '^300myServo.write(map(val, 0, 1023, 0, 180));^800',
        '^300xTaskCreate(vTelemetryTask, "IoT", 128, NULL, 1, NULL);^800',
        '^300WiFi.begin(SSID, PASS); // SimpleArduino IoT Hub^800'
      ],
      typeSpeed: 40,        // Швидкість друку символу (мс)
      backSpeed: 25,        // Швидкість стирання символу (мс)
      backDelay: 1400,      // Затримка перед початком стирання (мс)
      startDelay: 500,      // Початкова пауза перед першим рядком
      loop: true,           // Нескінченне циклічне повторення
      showCursor: true,     // Відображення миготливого курсору
      cursorChar: '▋',      // Стилізований консольний курсор
      autoInsertCss: true,  // Автоматична вставка CSS для анімації курсору
    });
  }

  // ----------------------------------------------------------------------------
  // 2. Ініціалізація Swiper.js (Компонент 1: Інтерактивний адаптивний слайдер)
  // ----------------------------------------------------------------------------
  const swiperContainer = document.querySelector('.reviews-swiper');
  if (swiperContainer && typeof Swiper !== 'undefined') {
    new Swiper('.reviews-swiper', {
      // Базові параметри
      loop: true,                  // Безперервний циклічний рух (Infinite Loop)
      speed: 650,                  // Плавність анімації зміни слайда (мс)
      grabCursor: true,            // Курсор-рука при наведенні для сенсорного UX
      watchOverflow: true,         // Вимикає навігацію, якщо слайдів недостатньо
      spaceBetween: 20,            // Відступ між слайдами (px)

      // Автоматичне прогортання (Autoplay) з зупинкою при наведенні
      autoplay: {
        delay: 3800,               // Інтервал між прогортаннями (3.8 сек)
        disableOnInteraction: false, // Автоплей продовжується після свайпу користувачем
        pauseOnMouseEnter: true,   // Зручна фіча UX: зупинка при наведенні курсору
      },

      // Пагінація буллетами
      pagination: {
        el: '.swiper-pagination',
        clickable: true,           // Можливість кліку по буллетах для швидкого переходу
        dynamicBullets: true,      // Динамічне масштабування булетів для кращого вигляду
      },

      // Навігаційні стрілки «Вперед / Назад»
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      // Адаптивні брейкпоінти (Breakpoints) під різні пристрої
      breakpoints: {
        // Мобільні телефони (ширина від 320px)
        320: {
          slidesPerView: 1,
          spaceBetween: 16,
        },
        // Планшети (ширина від 640px)
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        // Десктопи та ноутбуки (ширина від 1024px)
        1024: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
      },

      // Доступність для клавіатури
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },

      // Спостереження за DOM для уникнення FOUC та збоїв розмірів
      observer: true,
      observeParents: true,
    });
  }

  // ----------------------------------------------------------------------------
  // 3. Ініціалізація Fancybox v5 (Компонент 2: Модальна галерея схем та макетів)
  // ----------------------------------------------------------------------------
  if (typeof Fancybox !== 'undefined') {
    Fancybox.bind('[data-fancybox="hardware-gallery"]', {
      // Анімації відкриття та закриття
      animated: true,
      showClass: 'f-fadeIn',
      hideClass: 'f-fadeOut',

      // Тулбар інструментів (Zoom, Слайдшоу, Повний екран, Мініатюри, Закрити)
      Toolbar: {
        display: {
          left: ['infobar'],
          middle: [
            'zoomIn',
            'zoomOut',
            'toggle1to1',
            'rotateCCW',
            'rotateCW',
            'flipX',
            'flipY',
          ],
          right: ['slideshow', 'thumbs', 'fullscreen', 'close'],
        },
      },

      // Налаштування мініатюр
      Thumbs: {
        autoStart: true,           // Автопоказ панелі мініатюр знизу
        type: 'modern',            // Сучасний стиль плиток
      },

      // Налаштування зуму
      Images: {
        zoom: true,
        wheel: 'zoom',             // Масштабування коліщатком миші
      },

      // Локалізація інтерфейсу українською мовою
      l10n: {
        CLOSE: 'Закрити (Esc)',
        NEXT: 'Наступне зображення',
        PREV: 'Попереднє зображення',
        MODAL: 'Ви можете закрити це модальне вікно клавішею ESC',
        ERROR: 'Помилка завантаження контенту',
        IMAGE_ERROR: 'Зображення не знайдено',
        ELEMENT_NOT_FOUND: 'HTML елемент не знайдено',
        AJAX_NOT_FOUND: 'Помилка завантаження AJAX: Не знайдено',
        AJAX_FORBIDDEN: 'Помилка завантаження AJAX: Заборонено',
        IFRAME_ERROR: 'Помилка завантаження сторінки',
        TOGGLE_ZOOM: 'Масштаб 100%',
        TOGGLE_THUMBS: 'Мініатюри',
        TOGGLE_SLIDESHOW: 'Слайдшоу',
        TOGGLE_FULLSCREEN: 'Повноекранний режим',
        DOWNLOAD: 'Завантажити оригінал',
      },
    });
  }

});
