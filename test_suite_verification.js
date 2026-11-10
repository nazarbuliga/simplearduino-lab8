const puppeteer = require('puppeteer-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('=== ЗАПУСК ПОВНОГО ТЕСТУВАННЯ FRONTEND & ARCHITECTURE ===\n');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
    }
  }

  // ТЕСТ 1: Перевірка index.html
  console.log('--- ТЕСТУВАННЯ ГОЛОВНОЇ СТОРІНКИ (index.html) ---');
  const pageIndex = await browser.newPage();
  await pageIndex.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  pageIndex.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const indexPath = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
  await pageIndex.goto(indexPath, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  // 1.1 Перевірка шапки навігації (Header Desktop)
  const navText = await pageIndex.$eval('nav[aria-label="Головна навігація"]', el => el.innerText);
  assert(navText.includes('Медіа & Схеми'), 'Шапка містить об\'єднаний пункт "Медіа & Схеми"');
  assert(!navText.includes('Конфігуратор набору'), 'Конфігуратор вилучено з шапки десктопу (перенесено на окрему сторінку)');
  assert(!navText.includes('Медіа-хаб (10 відео)'), 'Старий розбитий пункт "Медіа-хаб (10 відео)" відсутній');
  assert(!navText.includes('Галерея схем'), 'Окремий пункт "Галерея схем" вилучено з десктопного меню');

  // 1.2 Перевірка висоти та перенесення рядків у шапці
  const headerHeight = await pageIndex.$eval('header', el => el.offsetHeight);
  assert(headerHeight <= 85, `Висота шапки компактна (80px, факт: ${headerHeight}px) без мультирядкових перенесень`);

  // 1.3 Перевірка кнопок "Зібрати свій набір"
  const heroBtnConfigurator = await pageIndex.$('#hero-btn-configurator');
  assert(heroBtnConfigurator !== null, 'У Hero-секції присутня помітна кнопка "Зібрати свій набір"');
  if (heroBtnConfigurator) {
    const heroBtnHref = await pageIndex.$eval('#hero-btn-configurator', el => el.getAttribute('href'));
    assert(heroBtnHref === 'configurator.html', 'Кнопка Hero веде на "configurator.html"');
  }

  // 1.4 Перевірка банера після модуля рівнів
  const levelsBannerBtn = await pageIndex.$('a[href="configurator.html"]');
  assert(levelsBannerBtn !== null, 'Присутній банер переходу до конфігуратора на сторінці');

  // 1.5 Перевірка перемикача вкладок Медіахабу (#media-hub)
  const btnVideos = await pageIndex.$('#media-tab-videos-toggle');
  const btnCircuits = await pageIndex.$('#media-tab-circuits-toggle');
  const panelVideos = await pageIndex.$('#media-videos-panel');
  const panelCircuits = await pageIndex.$('#media-circuits-panel');

  assert(btnVideos !== null && btnCircuits !== null, 'Присутні кнопки перемикання вкладок у Єдиному Медіа-Хабі');
  assert(panelVideos !== null && panelCircuits !== null, 'Присутні панелі Відеоуроків та Апаратної галереї');

  // Перемикання на схеми
  await pageIndex.click('#media-tab-circuits-toggle');
  await new Promise(r => setTimeout(r, 200));

  const isCircuitsVisible = await pageIndex.$eval('#media-circuits-panel', el => !el.classList.contains('hidden'));
  const isVideosHidden = await pageIndex.$eval('#media-videos-panel', el => el.classList.contains('hidden'));
  assert(isCircuitsVisible && isVideosHidden, 'Вкладка "Галерея схем (Fancybox v5)" успішно відкривається');

  // Перевірка 6 карток схем
  const circuitCardsCount = await pageIndex.$$eval('#media-circuits-panel article', els => els.length);
  assert(circuitCardsCount === 6, `Вкладка схем містить рівно 6 карток (знайдено: ${circuitCardsCount})`);

  // Перемикання назад на відео
  await pageIndex.click('#media-tab-videos-toggle');
  await new Promise(r => setTimeout(r, 200));
  const isVideosVisibleAgain = await pageIndex.$eval('#media-videos-panel', el => !el.classList.contains('hidden'));
  assert(isVideosVisibleAgain, 'Повернення до відеоуроків працює коректно');

  // 1.6 Перевірка відправки форми зворотного зв'язку
  console.log('\n--- ТЕСТУВАННЯ ВІДПРАВКИ ФОРМИ ЗВОРОТНОГО ЗВ\'ЯЗКУ ---');
  await pageIndex.type('#username', 'Назарій Тестер');
  await pageIndex.type('#email', 'student.lpnu@gmail.com');
  await pageIndex.type('#phone', '+380501234567');
  await pageIndex.type('#message', 'Тестове повідомлення для викладача та перевірки отримання на пошту.');
  await pageIndex.click('#consent');

  // Імітація успішної відправки через FormSubmit API
  await pageIndex.setRequestInterception(true);
  pageIndex.on('request', req => {
    if (req.url().includes('formsubmit.co/ajax')) {
      console.log(`  📡 [INTERCEPT] Перехоплено запит до FormSubmit API: ${req.url()}`);
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: "true", message: "Form submitted successfully" })
      });
    } else {
      req.continue();
    }
  });

  await pageIndex.click('#submitBtn');
  await new Promise(r => setTimeout(r, 600));

  const isModalOpen = await pageIndex.$eval('#successModal', el => !el.classList.contains('hidden'));
  assert(isModalOpen, 'Модальне вікно успішної відправки відкрилося після сабміту');

  const modalDescText = await pageIndex.$eval('#modalDesc', el => el.innerText);
  assert(modalDescText.includes('nazarii.bulyha.pp.2025@lpnu.ua'), 'У тексті модального вікна чітко зазначено пошту "nazarii.bulyha.pp.2025@lpnu.ua"');

  await pageIndex.close();

  // ТЕСТ 2: Перевірка configurator.html
  console.log('\n--- ТЕСТУВАННЯ ОКРЕМОЇ СТОРІНКИ КОНФІГУРАТОРА (configurator.html) ---');
  const pageConfig = await browser.newPage();
  await pageConfig.setViewport({ width: 1440, height: 900 });

  const configPath = 'file:///' + path.resolve(__dirname, 'configurator.html').replace(/\\/g, '/');
  await pageConfig.goto(configPath, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  // 2.1 Перевірка елементів сторінки
  const configTitle = await pageConfig.title();
  assert(configTitle.includes('Конфігуратор інженерного набору SimpleArduino Kit'), 'Заголовок сторінки конфігуратора коректний');

  // 2.2 Перевірка наявності калькулятора
  const qtyVal = await pageConfig.$eval('#calc-kit-qty', el => el.value);
  assert(qtyVal === '1', 'Початкова кількість наборів = 1');

  // Збільшення кількості кнопкою +
  await pageConfig.click('#calc-qty-plus');
  const qtyAfterPlus = await pageConfig.$eval('#calc-kit-qty', el => el.value);
  assert(qtyAfterPlus === '2', 'Кнопка "+" збільшила кількість наборів до 2');

  // 2.3 Перевірка блоку маркетплейсів (AliExpress, Temu, Prom.ua)
  const aliLinkHref = await pageConfig.$eval('#marketplace-ali-link', el => el.getAttribute('href'));
  const temuLinkHref = await pageConfig.$eval('#marketplace-temu-link', el => el.getAttribute('href'));
  const promLinkHref = await pageConfig.$eval('#marketplace-prom-link', el => el.getAttribute('href'));

  assert(aliLinkHref.includes('aliexpress.com') && aliLinkHref.includes('arduino'), 'Посилання на AliExpress сформовано коректно');
  assert(temuLinkHref.includes('temu.com') && temuLinkHref.includes('arduino'), 'Посилання на Temu сформовано коректно');
  assert(promLinkHref.includes('prom.ua') && promLinkHref.includes('arduino'), 'Посилання на Prom.ua сформовано коректно');

  // 2.4 Перевірка динамічної зміни маркетплейсів при виборі "Просунутий"
  await pageConfig.select('#calc-kit-level', 'advanced');
  await new Promise(r => setTimeout(r, 300));

  const updatedAliLink = await pageConfig.$eval('#marketplace-ali-link', el => el.getAttribute('href'));
  const updatedAliPrice = await pageConfig.$eval('#marketplace-ali-price', el => el.innerText);
  assert(updatedAliLink.includes('robot'), 'При виборі просунутого рівня пошуковий запит на AliExpress адаптовано до "robot"');
  assert(updatedAliPrice.includes('1 380') || updatedAliPrice.includes('1950'), `Ціна маркетплейсу оновилася на просунуту (${updatedAliPrice})`);

  // 2.5 Перевірка тестування граничних станів (Edge Cases)
  await pageConfig.click('#qa-test-overflow');
  await new Promise(r => setTimeout(r, 200));
  const isErrorShown = await pageConfig.$eval('#calc-qty-error', el => !el.classList.contains('hidden'));
  assert(isErrorShown, 'Гвард граничного значення: при астрономічному числі 9999999999 активовано захисний бар\'єр помилки');

  await pageConfig.close();
  await browser.close();

  console.log(`\n=== РЕЗУЛЬТАТ ТЕСТУВАННЯ: ${passedTests} / ${totalTests} ПРОЙДЕНО УСПІШНО ===\n`);
  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
})();
