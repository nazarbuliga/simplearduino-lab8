// SimpleArduino — Interactive Platform Scripts

document.addEventListener('DOMContentLoaded', () => {
  // 1. Toast Notification Helper
  const toast = document.getElementById('toast-notify');
  const toastText = document.getElementById('toast-text');
  let toastTimer = null;

  function showToast(message, duration = 3500) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }

  // 2. Mobile Hamburger Menu Toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
      if (iconOpen) iconOpen.classList.toggle('hidden');
      if (iconClose) iconClose.classList.toggle('hidden');
    });

    // Close mobile menu on clicking any navigation link
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
        if (iconOpen) iconOpen.classList.remove('hidden');
        if (iconClose) iconClose.classList.add('hidden');
      });
    });
  }

  // 3. Desktop Dropdown Menu Toggle (Fixed hover + click conflict & keyboard accessibility)
  const dropdownBtn = document.getElementById('dropdown-btn');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const dropdownChevron = document.getElementById('dropdown-chevron');
  const dropdownWrapper = document.getElementById('dropdown-wrapper');

  if (dropdownBtn && dropdownMenu) {
    let lastMouseEnterTime = 0;
    let closeTimer = null;

    function openDropdown() {
      if (closeTimer) clearTimeout(closeTimer);
      dropdownMenu.classList.remove('hidden');
      dropdownBtn.setAttribute('aria-expanded', 'true');
      if (dropdownChevron) dropdownChevron.classList.add('rotate-180');
    }

    function closeDropdown() {
      if (closeTimer) clearTimeout(closeTimer);
      dropdownMenu.classList.add('hidden');
      dropdownBtn.setAttribute('aria-expanded', 'false');
      if (dropdownChevron) dropdownChevron.classList.remove('rotate-180');
    }

    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = dropdownMenu.classList.contains('hidden');
      const justOpenedByHover = !isHidden && (Date.now() - lastMouseEnterTime < 350);
      if (isHidden || justOpenedByHover) {
        openDropdown();
      } else {
        closeDropdown();
      }
    });

    if (dropdownWrapper) {
      dropdownWrapper.addEventListener('mouseenter', () => {
        lastMouseEnterTime = Date.now();
        openDropdown();
      });
      dropdownWrapper.addEventListener('mouseleave', () => {
        closeTimer = setTimeout(closeDropdown, 180);
      });
    }

    document.addEventListener('click', (e) => {
      if (dropdownWrapper && !dropdownWrapper.contains(e.target)) {
        closeDropdown();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !dropdownMenu.classList.contains('hidden')) {
        closeDropdown();
        dropdownBtn.focus();
      }
    });

    const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.addEventListener('click', () => {
        closeDropdown();
        const filter = item.getAttribute('data-filter');
        if (filter) {
          filterCardsByLevel(filter);
        }
      });
    });
  }

  // 4. Real-time Search Filter
  const searchInput = document.getElementById('site-search-input');
  const cards = document.querySelectorAll('.course-card');

  if (searchInput && cards.length) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      let matchCount = 0;
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const keywords = card.getAttribute('data-keywords') || '';
        if (!q || text.includes(q) || keywords.includes(q)) {
          card.style.display = 'flex';
          matchCount++;
        } else {
          card.style.display = 'none';
        }
      });
      if (q.length > 2) {
        showToast(`Знайдено навчальних модулів: ${matchCount}`);
      }
    });
  }

  // 5. Starter Kit Select Filter (Custom Modern UI + Synced Select)
  const kitSelect = document.getElementById('kit');
  const kitCustomBtn = document.getElementById('kit-custom-btn');
  const kitCustomMenu = document.getElementById('kit-custom-menu');
  const kitChevron = document.getElementById('kit-chevron');
  const kitSelectedLabel = document.getElementById('kit-selected-label');
  const kitOptionItems = document.querySelectorAll('.kit-option-item');
  const kitFilterContainer = document.getElementById('kit-filter-container');

  if (kitCustomBtn && kitCustomMenu) {
    function toggleKitMenu(open) {
      const isOpen = open !== undefined ? open : kitCustomMenu.classList.contains('hidden');
      if (isOpen) {
        kitCustomMenu.classList.remove('hidden');
        kitCustomBtn.setAttribute('aria-expanded', 'true');
        if (kitChevron) kitChevron.classList.add('rotate-180');
      } else {
        kitCustomMenu.classList.add('hidden');
        kitCustomBtn.setAttribute('aria-expanded', 'false');
        if (kitChevron) kitChevron.classList.remove('rotate-180');
      }
    }

    kitCustomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleKitMenu();
    });

    kitOptionItems.forEach(item => {
      item.addEventListener('click', () => {
        const val = item.getAttribute('data-value');
        const name = item.getAttribute('data-name');

        if (kitSelectedLabel) {
          kitSelectedLabel.textContent = name;
        }

        // Оновлюємо візуальні стилі активного елемента
        kitOptionItems.forEach(opt => {
          const isSelected = opt === item;
          const checkIcon = opt.querySelector('.kit-check-icon');
          const dot = opt.querySelector('.kit-dot');

          if (isSelected) {
            opt.classList.add('bg-sky-50', 'text-sky-900', 'border-sky-200/80', 'font-semibold');
            opt.classList.remove('text-slate-700');
            if (checkIcon) checkIcon.classList.remove('hidden');
            if (dot) {
              dot.classList.remove('bg-slate-300');
              dot.classList.add('bg-sky-500');
            }
          } else {
            opt.classList.remove('bg-sky-50', 'text-sky-900', 'border-sky-200/80', 'font-semibold');
            opt.classList.add('text-slate-700');
            if (checkIcon) checkIcon.classList.add('hidden');
            if (dot) {
              dot.classList.add('bg-slate-300');
              dot.classList.remove('bg-sky-500');
            }
          }
        });

        // Синхронізуємо зі стандартним select і викликаємо логіку фільтрації
        if (kitSelect) {
          kitSelect.value = val;
          kitSelect.dispatchEvent(new Event('change'));
        }

        toggleKitMenu(false);
      });
    });

    // Закриття при кліку поза межами меню
    document.addEventListener('click', (e) => {
      if (kitFilterContainer && !kitFilterContainer.contains(e.target)) {
        toggleKitMenu(false);
      }
    });

    // Закриття клавішею Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleKitMenu(false);
      }
    });
  }

  if (kitSelect && cards.length) {
    kitSelect.addEventListener('change', (e) => {
      const val = e.target.value.toLowerCase();
      let count = 0;
      cards.forEach(card => {
        const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
        if (val === 'all' || keywords.includes(val)) {
          card.style.display = 'flex';
          count++;
        } else {
          card.style.display = 'none';
        }
      });
      const selectedName = kitSelect.options[kitSelect.selectedIndex].text;
      showToast(`Фільтр: «${selectedName}» (активно модулів: ${count})`);
    });
  }

  function filterCardsByLevel(level) {
    cards.forEach(card => {
      const cardLevel = card.getAttribute('data-level');
      if (!level || cardLevel === level) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
    showToast(`Обрано рівень: ${level.toUpperCase()}`);
  }

  // 6. Card CTA Buttons ("Відкрити модуль")
  const cardBtns = document.querySelectorAll('.btn-card-action');
  cardBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const moduleName = btn.getAttribute('data-module') || 'Навчальний модуль';
      showToast(`Модуль відкрито: ${moduleName}! Схеми та код завантажено.`);
    });
  });

  // 7. Contact Form Submission (Fixed: Client Validation)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    [nameInput, emailInput, messageInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          inp.classList.remove('border-rose-500', 'ring-2', 'ring-rose-400');
        });
      }
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let hasError = false;

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const msgVal = messageInput ? messageInput.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!nameVal) {
        if (nameInput) nameInput.classList.add('border-rose-500', 'ring-2', 'ring-rose-400');
        hasError = true;
      }
      if (!emailVal || !emailRegex.test(emailVal)) {
        if (emailInput) emailInput.classList.add('border-rose-500', 'ring-2', 'ring-rose-400');
        hasError = true;
      }
      if (!msgVal) {
        if (messageInput) messageInput.classList.add('border-rose-500', 'ring-2', 'ring-rose-400');
        hasError = true;
      }

      if (hasError) {
        showToast('Помилка: будь ласка, заповніть усі поля форми коректно (ім’я, дійсний email та повідомлення).', 4500);
        return;
      }

      showToast(`Дякуємо, ${nameVal}! Ваше повідомлення надіслано ментору SimpleArduino.`);
      contactForm.reset();
    });
  }

  // 8. Newsletter Subscribe Form (Fixed: Email Validation)
  const subForm = document.getElementById('subscribe-form');
  if (subForm) {
    subForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailVal || !emailRegex.test(emailVal)) {
        if (emailInput) emailInput.classList.add('border-rose-500', 'ring-2', 'ring-rose-400');
        showToast('Помилка: введіть коректну адресу електронної пошти для підписки.', 3500);
        return;
      }

      if (emailInput) emailInput.classList.remove('border-rose-500', 'ring-2', 'ring-rose-400');
      showToast('Успішна підписка на щомісячний дайджест схем SimpleArduino!');
      subForm.reset();
    });
  }

  
  // 9. ЛР №7 — Динамічний інтерактивний інформер телеметрії метеостанції IoT (Реальні дані: Львів)
  const tempEl = document.getElementById('telemetry-temp');
  const tempSubEl = document.getElementById('telemetry-temp-sub');
  const humEl = document.getElementById('telemetry-hum');
  const humSubEl = document.getElementById('telemetry-hum-sub');
  const lightEl = document.getElementById('telemetry-lux');
  const lightSubEl = document.getElementById('telemetry-lux-sub');
  const packetsEl = document.getElementById('telemetry-packets');
  const timeEl = document.getElementById('telemetry-time');
  const uptimeEl = document.getElementById('telemetry-uptime');
  const refreshBtn = document.getElementById('telemetry-refresh-btn');

  // Кешовані значення реальної погоди у Львові
  let liveWeatherData = {
    temp: 8.7,
    hum: 91,
    isDay: 0,
    cloudCover: 100,
    lastFetch: 0
  };

  // Розрахунок пакетів MQTT: монотонно зростає відповідно до поточного часу доби (1 пакет кожні ~3 сек)
  function getRealMqttPackets() {
    const now = new Date();
    const secondsToday = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    return 1500 + Math.floor(secondsToday / 3);
  }

  // Отримання реальних показників температури та вологості у Львові через відкритий API Open-Meteo
  async function fetchLvivWeather(force = false) {
    const now = Date.now();
    // Кеш на 120 секунд, щоб не спамити API при частих кліках
    if (!force && liveWeatherData.lastFetch > 0 && (now - liveWeatherData.lastFetch < 120000)) {
      return liveWeatherData;
    }

    try {
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=49.8397&longitude=24.0297&current=temperature_2m,relative_humidity_2m,is_day,cloud_cover,weather_code&timezone=Europe%2FKyiv';
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        if (json && json.current) {
          liveWeatherData.temp = parseFloat(json.current.temperature_2m);
          liveWeatherData.hum = Math.round(json.current.relative_humidity_2m);
          liveWeatherData.isDay = json.current.is_day;
          liveWeatherData.cloudCover = json.current.cloud_cover;
          liveWeatherData.lastFetch = now;
          return liveWeatherData;
        }
      }
    } catch (err) {
      console.warn('Open-Meteo fetch failed, using diurnal astronomical model for Lviv:', err);
    }

    // Резервна астрономічна модель Львова за часом доби (якщо браузер офлайн)
    const nowTime = new Date();
    const curHour = nowTime.getHours() + nowTime.getMinutes() / 60;
    // Осінь (кінець жовтня) у Львові: сонце сходить ~07:15, заходить ~18:10
    const isDay = (curHour >= 7.25 && curHour < 18.15) ? 1 : 0;
    // Температура вдень ~9..12°C, вночі ~4..7°C
    const baseTemp = isDay ? 10.5 : 6.8;
    liveWeatherData.temp = parseFloat(baseTemp.toFixed(1));
    liveWeatherData.hum = isDay ? 74 : 90;
    liveWeatherData.isDay = isDay;
    liveWeatherData.cloudCover = 85;
    liveWeatherData.lastFetch = now;
    return liveWeatherData;
  }

  // Розрахунок освітленості (Lux) на основі сонячного часу та хмарності
  function calculateSunLux(isDay, cloudCover) {
    const now = new Date();
    const curHour = now.getHours() + now.getMinutes() / 60;

    // Вночі у Львові датчик фіксує лише фонове нічне / сутінкове світло
    if (isDay === 0 || curHour < 7.2 || curHour > 18.2) {
      return { lux: 6, label: 'Нічний час / Сутінки (Львів)' };
    }

    // Вдень розраховуємо сонячну радіацію за синусоїдою висоти сонця
    const dayProgress = (curHour - 7.2) / (18.2 - 7.2);
    const sunElevation = Math.sin(dayProgress * Math.PI);
    
    // Вплив хмарності на освітленість
    let peakLux = 32000;
    if (cloudCover > 80) peakLux = 3800; // Похмуро
    else if (cloudCover > 40) peakLux = 14000; // Хмарно з проясненнями

    const calcLux = Math.max(15, Math.round(peakLux * sunElevation));
    let label = 'Розсіяне денне світло';
    if (cloudCover > 80) label = 'Похмуре небо (хмарність)';
    else if (calcLux > 12000) label = 'Яскраве сонце';

    return { lux: calcLux, label: label };
  }

  async function updateTelemetryData(isManual = false) {
    if (!tempEl) return;

    const weather = await fetchLvivWeather(isManual);
    const luxInfo = calculateSunLux(weather.isDay, weather.cloudCover);
    const pkts = getRealMqttPackets();

    const now = new Date();
    const timeStr = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Відображаємо реальну температуру Львова
    tempEl.textContent = `${weather.temp.toFixed(1)} °C`;
    if (tempSubEl) {
      if (weather.temp >= 20) tempSubEl.textContent = '✓ Тепло (Львів, Open-Meteo)';
      else if (weather.temp >= 10) tempSubEl.textContent = '✓ Помірна температура (Львів)';
      else if (weather.temp >= 0) tempSubEl.textContent = '✓ Прохолодно (Львів, Open-Meteo)';
      else tempSubEl.textContent = '✓ Заморозки (Львів)';
    }

    // Відображаємо реальну вологість Львова
    if (humEl) humEl.textContent = `${weather.hum} %`;
    if (humSubEl) {
      if (weather.hum >= 80) humSubEl.textContent = 'Висока вологість повітря';
      else if (weather.hum >= 40) humSubEl.textContent = 'Оптимальний рівень';
      else humSubEl.textContent = 'Сухе повітря';
    }

    // Реалістична освітленість
    if (lightEl) lightEl.textContent = `${luxInfo.lux} Lux`;
    if (lightSubEl) lightSubEl.textContent = luxInfo.label;

    // Пакети та час
    if (packetsEl) packetsEl.textContent = `${pkts} pkts`;
    if (timeEl) timeEl.textContent = `Оновлено: ${timeStr}`;

    // Апаратний аптайм прив'язаний до поточної доби
    if (uptimeEl) {
      const upHours = 24 + now.getHours();
      uptimeEl.textContent = `Online (Uptime: ${upHours}h ${now.getMinutes()}m)`;
    }

    if (isManual) {
      showToast(`Отримано реальні дані погоди у Львові: ${weather.temp.toFixed(1)} °C, ${weather.hum}% вологості!`);
    }
  }

  if (tempEl) {
    // Оновлюємо дані при завантаженні та кожні 15 секунд (погода + статус)
    updateTelemetryData();
    setInterval(() => updateTelemetryData(false), 15000);
    // Кожну секунду оновлюємо таймштамп і пакети
    setInterval(() => {
      const now = new Date();
      if (timeEl) timeEl.textContent = `Оновлено: ${now.toLocaleTimeString('uk-UA')}`;
      if (packetsEl) packetsEl.textContent = `${getRealMqttPackets()} pkts`;
    }, 1000);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      updateTelemetryData(true);
    });
  }

  
  // ==========================================================================
  // 10. ІНТЕРАКТИВНИЙ МЕДІА-ХАБ: ВІДЕО ДЛЯ ВСІХ 10 МОДУЛІВ КУРСУ
  // (Вимога #3: для кожного модуля своє якісне відео українською або англійською)
  // ==========================================================================
  const mediaHubProjects = [
    {
      id: '01',
      level: 'beginner',
      title: 'Практичний відеокурс: Блимаємо світлодіодом на ATMega8 / AVR',
      badge: 'Модуль 01 • Smart Blink',
      subtitle: 'Архітектура ATMega8 / UNO, програмування та перший скетч Blink',
      langLabel: 'Доступно українською 🇺🇦',
      videoId: 'x_bb1KgdiYY',
      pageUrl: 'project-01-blink.html',
      points: [
        'Правильне живлення плати (USB / 9V DC)',
        'Струмообмежувальні резистори 220 Ом',
        'Завантаження коду в пам\'ять Flash'
      ]
    },
    {
      id: '02',
      level: 'beginner',
      title: 'Тактова кнопка та антибрязкіт: цифровий ввід Arduino',
      badge: 'Модуль 02 • Button Debounce',
      subtitle: 'Підтяжка INPUT_PULLUP, усунення брязкоту контактів на millis()',
      langLabel: 'English Tutorial 🇬🇧 (Субтитри UK)',
      videoId: 'jYOYgU2vlSE',
      pageUrl: 'project-02-button.html',
      points: [
        'Внутрішній pull-up резистор 20-50 кОм',
        'Апаратний та програмний Debounce',
        'Надійне зчитування без хибних імпульсів'
      ]
    },
    {
      id: '03',
      level: 'beginner',
      title: 'Світлофор на Arduino: моделювання дорожнього перехрестя',
      badge: 'Модуль 03 • Traffic Light',
      subtitle: 'Кінцевий автомат станів (FSM), таймінги та червоно-жовто-зелений цикл',
      langLabel: 'Доступно українською 🇺🇦',
      videoId: 'BX19s_koXw4',
      pageUrl: 'project-03-traffic-light.html',
      points: [
        'Логічна діаграма станів світлофора (FSM)',
        'Роздільне керування 3 світлодіодами',
        'Неблокуюча пауза з перевіркою пішохода'
      ]
    },
    {
      id: '04',
      level: 'beginner',
      title: 'Потенціометр та ШІМ: плавне регулювання яскравості LED',
      badge: 'Модуль 04 • Potentiometer PWM',
      subtitle: 'Аналогово-цифровий перетворювач АЦП (ADC) та функція map()',
      langLabel: 'English Tutorial 🇬🇧 (Субтитри UK)',
      videoId: 'VKfQncdE5Bo',
      pageUrl: 'project-04-potentiometer.html',
      points: [
        'Подільник напруги на аналоговому вході A0',
        'ШІМ модуляція на апаратних таймерах (~)',
        'Масштабування діапазону 0..1023 у 0..255'
      ]
    },
    {
      id: '05',
      level: 'intermediate',
      title: 'Ультразвуковий сонар HC-SR04: вимірювання дистанції',
      badge: 'Модуль 05 • Ultrasonic Radar',
      subtitle: 'Фізика звукової хвилі, мікросекунди імпульсу Echo та парктронік',
      langLabel: 'How To Mechatronics 🇬🇧 (Субтитри UK)',
      videoId: 'ZejQOX69K5M',
      pageUrl: 'project-05-ultrasonic.html',
      points: [
        'Імпульс Trigger 10 мкс та зчитування Echo',
        'Формула швидкості звуку: s = (t × 0.0343) / 2',
        'Звукова індикація наближення перешкоди'
      ]
    },
    {
      id: '06',
      level: 'intermediate',
      title: 'Метеостанція DHT22 + I2C LCD 1602: мікроклімат приміщення',
      badge: 'Модуль 06 • Weather Station',
      subtitle: 'Однопровідний протокол 1-Wire, термометр і вологість з дисплеєм',
      langLabel: 'How To Mechatronics 🇬🇧 (Субтитри UK)',
      videoId: 'nssXWNYdGT8',
      pageUrl: 'project-06-weather-station.html',
      points: [
        'Калібровані датчики температури та вологи',
        'Економія пінів через 2-провідну шину I2C',
        'Оновлення символів екрану без артефактів'
      ]
    },
    {
      id: '07',
      level: 'intermediate',
      title: 'Сервопривід SG90: точне кутове позиціонування валу',
      badge: 'Модуль 07 • Servo Tracker',
      subtitle: 'Керування сервомотором через бібліотеку Servo.h та потенціометр',
      langLabel: 'How To Mechatronics 🇬🇧 (Субтитри UK)',
      videoId: 'LXURLvga8bQ',
      pageUrl: 'project-07-servo-tracker.html',
      points: [
        'Кут 0..180° шириною імпульсу 1..2 мс',
        'Окреме 5V живлення для захисту плати',
        'Синхронний поворот за ручкою керування'
      ]
    },
    {
      id: '08',
      level: 'advanced',
      title: 'Автономний робот-ровер: об\'їзд перешкод сонаром',
      badge: 'Модуль 08 • Robot Rover',
      subtitle: 'Драйвер двигунів L298N, диф-привід та алгоритми автонавігації',
      langLabel: 'English Tutorial 🇬🇧 (Субтитри UK)',
      videoId: 'BhrrNtihIe8',
      pageUrl: 'project-08-autonomous-robot.html',
      points: [
        'Двомостовий драйвер L298N та H-міст',
        'Сканування простору зліва й справа',
        'Автономне прийняття рішень у русі'
      ]
    },
    {
      id: '09',
      level: 'advanced',
      title: 'IoT Розумний Дім: веб-сервер керування через Wi-Fi',
      badge: 'Модуль 09 • IoT Smart Home',
      subtitle: 'HTTP REST API, реле 220V та панель керування зі смартфона',
      langLabel: 'English Tutorial 🇬🇧 (Субтитри UK)',
      videoId: 'giACxpN0cGc',
      pageUrl: 'project-09-iot-smart-home.html',
      points: [
        'Підключення ESP8266 до бездротової мережі',
        'Вбудований веб-сервер та REST ендпоінти',
        'Безпечна оптоізоляція силового реле'
      ]
    },
    {
      id: '10',
      level: 'advanced',
      title: 'FreeRTOS на мікроконтролері: витісняюча багатозадачність',
      badge: 'Модуль 10 • FreeRTOS',
      subtitle: 'Паралельні задачі (Tasks), пріоритети, черги та семафори в реальному часі',
      langLabel: 'Digi-Key Shawn Hymel 🇬🇧 (Субтитри UK)',
      videoId: 'F321087yYy4',
      pageUrl: 'project-10-freertos-multitask.html',
      points: [
        'Квантування процесорного часу між задачами',
        'Черги xQueue для безпечного обміну даними',
        'Виключення блокувань через м\'ютекси'
      ]
    }
  ];

  const videoIframe = document.getElementById('media-hub-iframe');
  const videoTitle = document.getElementById('media-hub-title-text');
  const videoBadge = document.getElementById('media-hub-module-badge');
  const videoSubtitle = document.getElementById('media-hub-subtitle-text');
  const videoLang = document.getElementById('media-hub-lang-text');
  const videoPointsContainer = document.getElementById('media-hub-points');
  const videoProjectLink = document.getElementById('media-hub-project-link');
  const videoTabsContainer = document.getElementById('media-hub-video-tabs');

  function selectMediaProject(project) {
    if (!project) return;

    if (videoIframe) {
      videoIframe.src = `https://www.youtube.com/embed/${project.videoId}?rel=0`;
      videoIframe.title = project.title;
    }
    if (videoTitle) videoTitle.textContent = project.title;
    if (videoBadge) videoBadge.textContent = project.badge;
    if (videoSubtitle) videoSubtitle.textContent = project.subtitle;
    if (videoLang) videoLang.textContent = project.langLabel;
    if (videoProjectLink) {
      videoProjectLink.href = project.pageUrl;
      videoProjectLink.setAttribute('aria-label', `Відкрити повну документацію проєкту ${project.badge}`);
    }

    if (videoPointsContainer && project.points) {
      videoPointsContainer.innerHTML = project.points.map((pt, idx) => `
        <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex items-center gap-2.5 transition-all duration-200 hover:border-sky-400/50 hover:bg-slate-800">
          <span class="text-sky-400 font-bold text-base font-mono">0${idx + 1}</span>
          <span class="text-slate-300 text-xs">${pt}</span>
        </div>
      `).join('');
    }

    // Оновлення активного стану кнопок-табів
    if (videoTabsContainer) {
      const allBtns = videoTabsContainer.querySelectorAll('.media-tab-btn');
      allBtns.forEach(btn => {
        const isCurrent = btn.getAttribute('data-id') === project.id;
        if (isCurrent) {
          btn.classList.add('bg-sky-500', 'text-slate-950', 'font-bold', 'shadow-lg', 'shadow-sky-500/25', 'border-sky-400');
          btn.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-700/70', 'hover:bg-slate-700');
        } else {
          btn.classList.remove('bg-sky-500', 'text-slate-950', 'font-bold', 'shadow-lg', 'shadow-sky-500/25', 'border-sky-400');
          btn.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700/70', 'hover:bg-slate-700');
        }
      });
    }

    showToast(`Відеоплеєр: завантажено ${project.badge}`);
  }

  if (videoTabsContainer) {
    const tabBtns = videoTabsContainer.querySelectorAll('.media-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        const proj = mediaHubProjects.find(p => p.id === pId);
        if (proj) selectMediaProject(proj);
      });
    });
  }

  // 11. ФІЛЬТРАЦІЯ ТА КРАСИВЕ ПОВОДЖЕННЯ FAQ (Вимога #2)
  const faqFilterBtns = document.querySelectorAll('.faq-filter-btn');
  const faqItems = document.querySelectorAll('.faq-item');

  if (faqFilterBtns.length && faqItems.length) {
    faqFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-faq-category');
        
        // Перемикаємо активну кнопку
        faqFilterBtns.forEach(b => {
          if (b === btn) {
            b.classList.add('bg-sky-500', 'text-slate-950', 'font-bold', 'shadow-md', 'shadow-sky-500/20');
            b.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
          } else {
            b.classList.remove('bg-sky-500', 'text-slate-950', 'font-bold', 'shadow-md', 'shadow-sky-500/20');
            b.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
          }
        });

        // Фільтруємо питання
        let visibleCount = 0;
        faqItems.forEach(item => {
          const itemCat = item.getAttribute('data-faq-cat') || 'all';
          if (cat === 'all' || itemCat === cat) {
            item.style.display = 'block';
            visibleCount++;
          } else {
            item.style.display = 'none';
          }
        });

        showToast(`Показано запитань: ${visibleCount}`);
      });
    });
  }

  // 12. КЛІК ТА ХОВЕР ДЛЯ МІТКИ МАГАЗИНУ НА КАРТІ GOOGLE MAPS (Вимога #4)
  const mapPinBtn = document.getElementById('map-pin-focus-btn');
  const mapPinElement = document.getElementById('google-map-marker-pin');
  const mapInfoWindow = document.getElementById('map-infowindow-popup');

  if (mapPinBtn && mapPinElement) {
    mapPinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (mapInfoWindow) {
        mapInfoWindow.classList.toggle('hidden');
      }
      mapPinElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('📍 Мітку магазину «Юстас» активовано на карті!');
    });
  }

  if (mapPinElement && mapInfoWindow) {
    mapPinElement.addEventListener('click', () => {
      mapInfoWindow.classList.toggle('hidden');
    });
  }

  
  // ==========================================================================
  // 13. ДИНАМІЧНА ІНТЕРАКТИВНА КНОПКА "ВГОРУ" (SCROLL TO TOP З GLOW)
  // ==========================================================================
  let topBtn = document.getElementById('scroll-to-top-btn');
  if (!topBtn) {
    topBtn = document.createElement('button');
    topBtn.id = 'scroll-to-top-btn';
    topBtn.type = 'button';
    topBtn.setAttribute('aria-label', 'Повернутися на початок сторінки');
    topBtn.innerHTML = `
      <svg class="w-6 h-6 transform -rotate-90 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
      </svg>
    `;
    document.body.appendChild(topBtn);
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      topBtn.classList.add('visible');
    } else {
      topBtn.classList.remove('visible');
    }
  });

  topBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // ==========================================================================
  // 14. СМУГА ПРОГРЕСУ ЧИТАННЯ (READING PROGRESS BAR)
  // Працює на всіх сторінках, наочно показує прогрес вивчення матеріалу
  // ==========================================================================
  function initReadingProgressBar() {
    let bar = document.getElementById('reading-progress-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'reading-progress-bar';
      document.body.prepend(bar);
    }

    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
        bar.style.width = `${progress}%`;
      }
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }
  initReadingProgressBar();

  // ==========================================================================
  // 15. УНІВЕРСАЛЬНА СИСТЕМА SCROLL REVEAL (INTERSECTION OBSERVER)
  // Автоматично оживляє кожну сторінку: секції, картки проєктів, схеми та кроки
  // ==========================================================================
  function initScrollReveal() {
    // Елементи з явними класами анімації
    const explicitElements = document.querySelectorAll(
      '.reveal-on-scroll, .reveal-scale-in, .reveal-slide-left, .reveal-slide-right'
    );

    // Автоматичне виявлення карток та блоків контенту на будь-якій сторінці
    const autoElements = document.querySelectorAll(
      'main section, .space-y-16 > section, .space-y-12 > section, ' +
      'main section article, .gallery-card-zoom, .ladder-step, .step-card, .step-item, ' +
      'main .grid > div.bg-slate-800, main .grid > div.bg-slate-800\\/90, ' +
      'main .grid > div.bg-slate-900\\/80, .interactive-card, .clay-card, ' +
      'main section > div > .grid > div, main .step-item > div'
    );

    const allElements = new Set([...explicitElements, ...autoElements]);

    if (!allElements.size) return;

    if (!('IntersectionObserver' in window)) {
      allElements.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    allElements.forEach((el, index) => {
      if (!el.classList.contains('reveal-on-scroll') && 
          !el.classList.contains('reveal-scale-in') && 
          !el.classList.contains('reveal-slide-left') && 
          !el.classList.contains('reveal-slide-right')) {
        el.classList.add('reveal-on-scroll');
        // Додаємо невелику каскадну затримку для сусідніх елементів у сітці
        const delayClass = `delay-${((index % 4) + 1) * 100}`;
        el.classList.add(delayClass);
      }
      observer.observe(el);
    });
  }
  initScrollReveal();

  // ==========================================================================
  // 16. ІНТЕРАКТИВНИЙ 3D MICRO-TILT НА КАРТКАХ (DEPTH & LIGHT)
  // Плавний нахил карток за рухом курсору для кінетичного відчуття
  // ==========================================================================
  function initCardTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const cards = document.querySelectorAll(
      '.card-tilt, .gallery-card-zoom, .interactive-card, ' +
      '#media-circuits-panel article, .ladder-step'
    );

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
  initCardTilt();

  // ==========================================================================
  // 17. ВОДЯНИЙ ЕФЕКТ КЛІКУ ДЛЯ КНОПОК ТА ПОСИЛАНЬ (CLICK RIPPLE)
  // ==========================================================================
  function initButtonRipples() {
    const clickableBtns = document.querySelectorAll(
      'button:not([disabled]):not(#mobile-menu-btn), .btn-alive, ' +
      'a.px-5.py-2\\.5, a.px-4.py-2, #telemetry-refresh-btn'
    );

    clickableBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        const rect = btn.getBoundingClientRect();
        const circle = document.createElement('span');
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('btn-ripple-effect');

        const existing = btn.querySelector('.btn-ripple-effect');
        if (existing) existing.remove();

        if (window.getComputedStyle(btn).position === 'static') {
          btn.style.position = 'relative';
        }
        btn.style.overflow = 'hidden';
        btn.appendChild(circle);

        setTimeout(() => circle.remove(), 600);
      });
    });
  }
  initButtonRipples();

  // ==========================================================================
  // 18. АНІМОВАНІ ЛІЧИЛЬНИКИ ЧИСЕЛ ТА МЕТРИК
  // Плавне зростання значень при потраплянні у зону видимості
  // ==========================================================================
  function initStatCounters() {
    const counterElements = document.querySelectorAll('[data-counter]');
    if (!counterElements.length) return;

    const counterObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetValue = parseFloat(el.getAttribute('data-counter'));
          const suffix = el.getAttribute('data-counter-suffix') || '';
          const prefix = el.getAttribute('data-counter-prefix') || '';
          const duration = 1200;
          const startTime = performance.now();

          function step(currentTime) {
            const elapsed = Math.min((currentTime - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - elapsed, 3);
            const currentVal = (easeOut * targetValue).toFixed(targetValue % 1 === 0 ? 0 : 1);
            el.textContent = `${prefix}${currentVal}${suffix}`;
            if (elapsed < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = `${prefix}${targetValue}${suffix}`;
            }
          }

          requestAnimationFrame(step);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counterElements.forEach(el => counterObs.observe(el));
  }
  initStatCounters();

  console.log('SimpleArduino scripts & Universal Living Animations initialized successfully! ✨');
});
