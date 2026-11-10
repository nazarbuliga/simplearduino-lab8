const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const siteUrl = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
const screenshotsDir = path.resolve(__dirname, 'lab-11-screenshots');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runLab11Audit() {
  console.log('================================================================');
  console.log('🚀 ПОЧАТОК АВТОМАТИЗОВАНОГО QA ТЕСТУВАННЯ ВІДЖЕТА (ЛР №11)');
  console.log('Цільовий URL:', siteUrl);
  console.log('Директорія скріншотів:', screenshotsDir);
  console.log('================================================================');

  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950, deviceScaleFactor: 2 });

  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      console.error('❌ [Browser Console Error]:', text);
    } else if (msg.type() === 'warn') {
      console.warn('⚠️ [Browser Console Warn]:', text);
    } else {
      console.log('ℹ️ [Browser Console Log]:', text);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.toString());
    console.error('💥 [Uncaught Page Error]:', err.message);
  });

  console.log('Завантаження сторінки...');
  await page.goto(siteUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(1000);

  // Скрол до віджета
  await page.evaluate(() => {
    const section = document.getElementById('kit-configurator');
    if (section) section.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(800);

  // ТЕСТ 1: Первинний стан віджета (Idle State, 1 базовий набір)
  console.log('\n--- ТЕСТ 1: Первинний рендеринг (Idle State) ---');
  const initialTotal = await page.$eval('#summary-total-cost', el => el.textContent.trim());
  console.log('Початковий кошторис:', initialTotal);
  await page.screenshot({
    path: path.join(screenshotsDir, '01_widget_desktop_initial.png'),
    fullPage: false
  });
  console.log('📸 Скріншот збережено: 01_widget_desktop_initial.png');

  // ТЕСТ 2: Happy Path — повноцінний вибір параметрів
  console.log('\n--- ТЕСТ 2: Happy Path розрахунок (5 наборів, Середній рівень, підручник ДСТУ, опції, промокод LP2026) ---');
  await page.click('#qa-test-happy');
  await sleep(600);
  const happyTotal = await page.$eval('#summary-total-cost', el => el.textContent.trim());
  const happyBulk = await page.$eval('#summary-bulk-discount', el => el.textContent.trim());
  const happyPromo = await page.$eval('#summary-promo-discount', el => el.textContent.trim());
  console.log(`Результат Happy Path: Разом = ${happyTotal}, Гуртова знижка = ${happyBulk}, Промокод = ${happyPromo}`);
  await page.screenshot({
    path: path.join(screenshotsDir, '02_widget_happy_path_calc.png'),
    fullPage: false
  });
  console.log('📸 Скріншот збережено: 02_widget_happy_path_calc.png');

  // ТЕСТ 3: Edge Case 1 — Порожнє поле
  console.log('\n--- ТЕСТ 3: Edge Case 1 (Порожнє поле кількості) ---');
  await page.click('#qa-test-empty');
  await sleep(500);
  const emptyError = await page.$eval('#calc-qty-error', el => el.textContent.trim());
  const emptyTotal = await page.$eval('#summary-total-cost', el => el.textContent.trim());
  console.log(`Повідомлення про помилку: "${emptyError}", Відображення ціни: "${emptyTotal}"`);
  await page.screenshot({
    path: path.join(screenshotsDir, '03_widget_edge_empty.png'),
    fullPage: false
  });
  console.log('📸 Скріншот збережено: 03_widget_edge_empty.png');

  // ТЕСТ 4: Edge Case 2 — Від'ємне число (-5)
  console.log('\n--- ТЕСТ 4: Edge Case 2 (Від\'ємне число: -5) ---');
  await page.click('#qa-test-negative');
  await sleep(500);
  const negError = await page.$eval('#calc-qty-error', el => el.textContent.trim());
  console.log(`Повідомлення про помилку: "${negError}"`);
  await page.screenshot({
    path: path.join(screenshotsDir, '04_widget_edge_negative.png'),
    fullPage: false
  });
  console.log('📸 Скріншот збережено: 04_widget_edge_negative.png');

  // ТЕСТ 5: Edge Case 3 — Нуль (0)
  console.log('\n--- ТЕСТ 5: Edge Case 3 (Нульова кількість: 0) ---');
  await page.click('#qa-test-zero');
  await sleep(500);
  const zeroError = await page.$eval('#calc-qty-error', el => el.textContent.trim());
  console.log(`Повідомлення про помилку: "${zeroError}"`);
  await page.screenshot({
    path: path.join(screenshotsDir, '05_widget_edge_zero.png'),
    fullPage: false
  });
  console.log('📸 Скріншот збережено: 05_widget_edge_zero.png');

  // ТЕСТ 6: Edge Case 4 — Астрономічне переповнення (9999999999)
  console.log('\n--- ТЕСТ 6: Edge Case 4 (Переповнення: 9999999999) ---');
  await page.click('#qa-test-overflow');
  await sleep(500);
  const overflowError = await page.$eval('#calc-qty-error', el => el.textContent.trim());
  console.log(`Повідомлення про помилку: "${overflowError}"`);
  await page.screenshot({
    path: path.join(screenshotsDir, '06_widget_edge_overflow.png'),
    fullPage: false
  });
  console.log('📸 Скріншот збережено: 06_widget_edge_overflow.png');

  // ТЕСТ 7: Edge Case 5 — Дробове число (3.5)
  console.log('\n--- ТЕСТ 7: Edge Case 5 (Дробове число: 3.5) ---');
  await page.click('#qa-test-decimal');
  await sleep(500);
  const decimalError = await page.$eval('#calc-qty-error', el => el.textContent.trim());
  console.log(`Повідомлення про помилку: "${decimalError}"`);
  await page.screenshot({
    path: path.join(screenshotsDir, '07_widget_edge_decimal.png'),
    fullPage: false
  });
  console.log('📸 Скріншот збережено: 07_widget_edge_decimal.png');

  // ТЕСТ 8: Edge Case 6 — Спроба XSS ін'єкції у поле промокоду
  console.log('\n--- ТЕСТ 8: Edge Case 6 (Спроба XSS ін\'єкції <script>) ---');
  await page.click('#qa-test-xss');
  await sleep(500);
  const xssMsg = await page.$eval('#calc-promo-msg', el => el.textContent.trim());
  const xssHtml = await page.$eval('#calc-promo-msg', el => el.innerHTML);
  console.log(`Безпечне текстове повідомлення: "${xssMsg}"`);
  console.log(`HTML вміст (екрановано browser DOM): "${xssHtml}"`);
  await page.screenshot({
    path: path.join(screenshotsDir, '08_widget_edge_xss_protection.png'),
    fullPage: false
  });
  console.log('📸 Скріншот збережено: 08_widget_edge_xss_protection.png');

  // ТЕСТ 9: Мобільна адаптивність (375x812 iPhone / Mobile First)
  console.log('\n--- ТЕСТ 9: Мобільна версія (375x812) ---');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.click('#qa-test-reset');
  await sleep(500);
  await page.evaluate(() => {
    document.getElementById('kit-configurator').scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(600);
  await page.screenshot({
    path: path.join(screenshotsDir, '09_widget_mobile_view.png'),
    fullPage: false
  });
  console.log('📸 Скріншот збережено: 09_widget_mobile_view.png');

  // ПІДСУМКОВИЙ АНАЛІЗ ЯКОСТІ ТА ВІДСУТНОСТІ RUNTIME ПОМИЛОК
  console.log('\n================================================================');
  console.log('📊 ПІДСУМОК ТЕХНІЧНОГО ТА БРАУЗЕРНОГО АУДИТУ:');
  console.log(`Загальна кількість console.log повідомлень: ${consoleLogs.length}`);
  console.log(`Загальна кількість неперехоплених помилок сторінки (Page Errors): ${pageErrors.length}`);

  const criticalErrors = pageErrors.concat(consoleLogs.filter(l => l.type === 'error').map(l => l.text));
  if (criticalErrors.length === 0) {
    console.log('✅ ІДЕАЛЬНИЙ РЕЗУЛЬТАТ: 0 критичних помилок. Консоль розробника чиста від аварійних винятків!');
  } else {
    console.error('❌ Знайдено помилки:', criticalErrors);
  }
  console.log('================================================================');

  await browser.close();
}

runLab11Audit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
