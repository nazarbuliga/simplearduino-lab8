/**
 * ==============================================================================
 * SimpleArduino — Лабораторна робота №11
 * Інтерактивний віджет: Калькулятор-конфігуратор інженерного набору SimpleArduino Kit
 * 
 * Архітектурні принципи:
 * 1. Чистий JavaScript (Vanilla JS, ES6+) без сторонніх бібліотек.
 * 2. Ізоляція простору імен через IIFE (захист глобальної області window).
 * 3. Тріада захисного програмування (Defensive Programming):
 *    - Рівень 1: HTML5 обмеження (min, max, step, required).
 *    - Рівень 2: JS валідація, нормалізація типів та перехоплення Edge Cases.
 *    - Рівень 3: Захист від XSS через виключне використання .textContent.
 * 4. Обробка подій: input, change, click з миттєвим перерахунком.
 * 5. Повна діагностика та логування у Chrome DevTools Console.
 * ==============================================================================
 */

(() => {
  'use strict';

  // Конфігурація бізнес-правил та тарифів інженерного набору
  const CONFIG = {
    levels: {
      basic: {
        id: 'basic',
        name: 'Базовий (Uno R3 + Breadboard + LED/Резистори)',
        price: 850,
        weight: 0.35,
        desc: 'Плата Uno R3, макетка 400 точок, 20 LED, резистори, дроти, USB кабель'
      },
      intermediate: {
        id: 'intermediate',
        name: 'Середній (Uno + LCD 1602 + Сонар HC-SR04 + DHT11)',
        price: 1450,
        weight: 0.55,
        desc: 'Базовий набір + дисплей I2C LCD 1602, ультразвуковий сонар, датчик DHT11, зумер'
      },
      advanced: {
        id: 'advanced',
        name: 'Просунутий (Uno + Драйвер L298N + Сервопривід + Реле 220V + IoT)',
        price: 2250,
        weight: 0.85,
        desc: 'Повний лабораторний стенд: мотори, драйвер L298N, сервопривід SG90, реле, Bluetooth'
      }
    },
    guides: {
      pdf: {
        id: 'pdf',
        name: 'Цифровий PDF-гайд (Open-Access, завантаження)',
        price: 0,
        weight: 0.0
      },
      book: {
        id: 'book',
        name: 'Друкований посібник ДСТУ (180 стор., кольоровий друк)',
        price: 380,
        weight: 0.40
      },
      poster: {
        id: 'poster',
        name: 'Комплект настінних ламінованих схем формату А3',
        price: 190,
        weight: 0.15
      }
    },
    addons: {
      battery: {
        id: 'battery',
        name: 'Li-ion акумуляторний шилд 9V/USB',
        price: 290,
        weight: 0.12
      },
      case: {
        id: 'case',
        name: 'Антистатичний кейс-органайзер',
        price: 220,
        weight: 0.25
      },
      mentor: {
        id: 'mentor',
        name: 'Персональна консультація STEM-викладача (1 год)',
        price: 450,
        weight: 0.0
      }
    },
    urgency: {
      standard: {
        id: 'standard',
        name: 'Стандартна комплектація (3–5 робочих днів)',
        price: 0,
        days: '3–5 робочих днів'
      },
      express: {
        id: 'express',
        name: 'Експрес-комплектація день-у-день із тестуванням',
        price: 150,
        days: '1 робочий день'
      }
    },
    promos: {
      'START2026': { discount: 0.10, desc: 'Знижка для початківців -10%' },
      'LP2026': { discount: 0.15, desc: 'Знижка для студентів Політехніки -15%' }
    },
    limits: {
      minQty: 1,
      maxQty: 50,
      bulk5Discount: 0.05,
      bulk10Discount: 0.10,
      maxTotalDiscount: 0.25 // Захист бізнес-логіки від від'ємного/нульового прибутку
    }
  };

  // Форматування валюти для української локалі
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Ініціалізація віджета після побудови DOM
  function initWidget() {
    // Пошук контейнера віджета
    const container = document.getElementById('kit-configurator');
    if (!container) {
      console.warn('[SimpleArduino Widget QA] Контейнер віджета #kit-configurator не знайдено на сторінці.');
      return;
    }

    // Зв'язування елементів керування (Data Binding)
    const elements = {
      qtyInput: document.getElementById('calc-kit-qty'),
      qtyMinusBtn: document.getElementById('calc-qty-minus'),
      qtyPlusBtn: document.getElementById('calc-qty-plus'),
      qtyError: document.getElementById('calc-qty-error'),
      levelSelect: document.getElementById('calc-kit-level'),
      levelDesc: document.getElementById('calc-level-desc'),
      guideSelect: document.getElementById('calc-kit-guide'),
      addonBattery: document.getElementById('calc-opt-battery'),
      addonCase: document.getElementById('calc-opt-case'),
      addonMentor: document.getElementById('calc-opt-mentor'),
      urgencyRadios: document.querySelectorAll('input[name="calc-urgency"]'),
      promoInput: document.getElementById('calc-promo-input'),
      promoApplyBtn: document.getElementById('calc-promo-apply-btn'),
      promoClearBtn: document.getElementById('calc-promo-clear-btn'),
      promoMsg: document.getElementById('calc-promo-msg'),
      
      // Зведені дані кошторису
      summaryHwCost: document.getElementById('summary-hw-cost'),
      summaryGuideCost: document.getElementById('summary-guide-cost'),
      summaryAddonsCost: document.getElementById('summary-addons-cost'),
      summaryUrgencyCost: document.getElementById('summary-urgency-cost'),
      summaryPerKitCost: document.getElementById('summary-per-kit-cost'),
      summaryQtyCount: document.getElementById('summary-qty-count'),
      summaryBulkDiscount: document.getElementById('summary-bulk-discount'),
      summaryPromoDiscount: document.getElementById('summary-promo-discount'),
      summaryTotalCost: document.getElementById('summary-total-cost'),
      summaryWeight: document.getElementById('summary-weight'),
      summaryDelivery: document.getElementById('summary-delivery'),
      orderBtn: document.getElementById('calc-order-btn'),

      // Кнопки швидкого тестування Edge Cases
      testHappyBtn: document.getElementById('qa-test-happy'),
      testEmptyBtn: document.getElementById('qa-test-empty'),
      testZeroBtn: document.getElementById('qa-test-zero'),
      testNegativeBtn: document.getElementById('qa-test-negative'),
      testOverflowBtn: document.getElementById('qa-test-overflow'),
      testDecimalBtn: document.getElementById('qa-test-decimal'),
      testXssBtn: document.getElementById('qa-test-xss'),
      testResetBtn: document.getElementById('qa-test-reset')
    };

    // Перевірка наявності критичних елементів
    if (!elements.qtyInput || !elements.levelSelect || !elements.summaryTotalCost) {
      console.error('[SimpleArduino Widget QA] Помилка: відсутні критичні елементи DOM для роботи віджета.');
      return;
    }

    // Внутрішній стан віджета (ізольований від глобальної області)
    const state = {
      quantity: 1,
      isQtyValid: true,
      appliedPromoCode: null,
      appliedPromoDiscount: 0.0
    };

    /**
     * Валідація кількості наборів із перехопленням Edge Cases
     * @param {string|number} rawValue
     * @returns {{ valid: boolean, error: string|null, normalizedValue: number }}
     */
    function validateQuantity(rawValue) {
      const rawStr = String(rawValue).trim();

      // 1. Edge Case: Порожнє поле
      if (rawStr === '') {
        return {
          valid: false,
          error: 'Поле кількості не може бути порожнім. Вкажіть число від 1 до 50.',
          normalizedValue: 0
        };
      }

      // 2. Edge Case: Нечислове введення, спецсимволи або спроба XSS
      // Перевіряємо, чи є введений рядок суворо валідним числом
      if (!/^-?\d+(\.\d+)?$/.test(rawStr)) {
        return {
          valid: false,
          error: 'Некоректний формат! Введіть тільки ціле число без літер та символів.',
          normalizedValue: 0
        };
      }

      const num = Number(rawStr);

      // 3. Edge Case: NaN або Infinity
      if (!Number.isFinite(num)) {
        return {
          valid: false,
          error: 'Значення виходить за межі допустимого числового діапазону (Overflow).',
          normalizedValue: 0
        };
      }

      // 4. Edge Case: Дробові числа (наприклад 2.5)
      if (!Number.isInteger(num)) {
        return {
          valid: false,
          error: 'Кількість наборів має бути цілим числом (дробові значення заборонені).',
          normalizedValue: 0
        };
      }

      // 5. Edge Case: Нуль або від'ємне число
      if (num <= 0) {
        return {
          valid: false,
          error: `Кількість не може бути ${num <= 0 ? 'меншою або рівною нулю' : 'від\'ємною'} (мінімум 1 шт.).`,
          normalizedValue: 0
        };
      }

      // 6. Edge Case: Переповнення (надмірно великі числа > maxQty)
      if (num > CONFIG.limits.maxQty) {
        return {
          valid: false,
          error: `Максимальна партія для віджета — ${CONFIG.limits.maxQty} шт. Для більших обсягів зв'яжіться з відділом.`,
          normalizedValue: 0
        };
      }

      // Успішне проходження всіх гвардів
      return {
        valid: true,
        error: null,
        normalizedValue: num
      };
    }

    /**
     * Оновлення стану помилки в UI за правилами Tailwind CSS
     */
    function setQtyUIError(hasError, message = '') {
      if (hasError) {
        elements.qtyInput.classList.remove('border-slate-300', 'focus:border-sky-500', 'focus:ring-sky-500/20');
        elements.qtyInput.classList.add('border-rose-500', 'bg-rose-50/40', 'focus:border-rose-500', 'focus:ring-rose-500/20', 'text-rose-900');
        elements.qtyInput.setAttribute('aria-invalid', 'true');
        
        elements.qtyError.textContent = `⚠ ${message}`;
        elements.qtyError.classList.remove('hidden');
      } else {
        elements.qtyInput.classList.remove('border-rose-500', 'bg-rose-50/40', 'focus:border-rose-500', 'focus:ring-rose-500/20', 'text-rose-900');
        elements.qtyInput.classList.add('border-slate-300', 'focus:border-sky-500', 'focus:ring-sky-500/20');
        elements.qtyInput.removeAttribute('aria-invalid');
        
        elements.qtyError.textContent = '';
        elements.qtyError.classList.add('hidden');
      }
    }

    /**
     * Основна функція бізнес-розрахунку кошторису (Defensive Core)
     */
    function calculate() {
      console.log('[SimpleArduino Widget QA] Запуск процедури перерахунку кошторису...');

      // 1. Валідація кількості
      const valResult = validateQuantity(elements.qtyInput.value);

      if (!valResult.valid) {
        state.isQtyValid = false;
        state.quantity = 0;
        setQtyUIError(true, valResult.error);
        
        // Відображення безпечного стану Fail-Safe: жодних NaN/Infinity
        renderFallbackSummary(valResult.error);
        console.warn(`[SimpleArduino Widget QA Guard] Перехоплено Edge Case: "${elements.qtyInput.value}". Причина: ${valResult.error}`);
        return;
      }

      // Стан валідний
      state.isQtyValid = true;
      state.quantity = valResult.normalizedValue;
      setQtyUIError(false);

      // 2. Зчитування обраного рівня мікроконтролера
      const levelKey = elements.levelSelect.value;
      const levelData = CONFIG.levels[levelKey] || CONFIG.levels.basic;
      
      // Оновлення текстового опису комплектації
      if (elements.levelDesc) {
        elements.levelDesc.textContent = levelData.desc;
      }

      // 3. Зчитування формату методичних матеріалів
      const guideKey = elements.guideSelect.value;
      const guideData = CONFIG.guides[guideKey] || CONFIG.guides.pdf;

      // 4. Зчитування додаткових опцій (чекбокси)
      let addonsCost = 0;
      let addonsWeight = 0;

      if (elements.addonBattery && elements.addonBattery.checked) {
        addonsCost += CONFIG.addons.battery.price;
        addonsWeight += CONFIG.addons.battery.weight;
      }
      if (elements.addonCase && elements.addonCase.checked) {
        addonsCost += CONFIG.addons.case.price;
        addonsWeight += CONFIG.addons.case.weight;
      }
      if (elements.addonMentor && elements.addonMentor.checked) {
        addonsCost += CONFIG.addons.mentor.price;
        addonsWeight += CONFIG.addons.mentor.weight;
      }

      // 5. Зчитування терміновості комплектації (радіокнопки)
      let selectedUrgency = CONFIG.urgency.standard;
      elements.urgencyRadios.forEach(r => {
        if (r.checked && CONFIG.urgency[r.value]) {
          selectedUrgency = CONFIG.urgency[r.value];
        }
      });

      // 6. Розрахунок бази на 1 набір
      const costPerKitBeforeDiscount = levelData.price + guideData.price + addonsCost;
      const weightPerKit = levelData.weight + guideData.weight + addonsWeight;

      // 7. Розрахунок загальної вартості до знижок
      const subtotalKits = costPerKitBeforeDiscount * state.quantity;
      const totalShipping = selectedUrgency.price;

      // 8. Розрахунок гуртової знижки
      let bulkDiscountRate = 0.0;
      if (state.quantity >= 10) {
        bulkDiscountRate = CONFIG.limits.bulk10Discount;
      } else if (state.quantity >= 5) {
        bulkDiscountRate = CONFIG.limits.bulk5Discount;
      }
      const bulkDiscountAmount = Math.round(subtotalKits * bulkDiscountRate);

      // 9. Розрахунок знижки за промокодом (з обмеженням максимальної сумарної знижки)
      let promoDiscountRate = state.appliedPromoDiscount;
      // Захист від надмірної сумарної знижки (макс 25%)
      if (bulkDiscountRate + promoDiscountRate > CONFIG.limits.maxTotalDiscount) {
        promoDiscountRate = CONFIG.limits.maxTotalDiscount - bulkDiscountRate;
      }
      const promoDiscountAmount = Math.round(subtotalKits * promoDiscountRate);

      // 10. Фінальна вартість
      let finalTotal = (subtotalKits - bulkDiscountAmount - promoDiscountAmount) + totalShipping;
      
      // Захисний бар'єр: ціна ніколи не може бути <= 0 або NaN
      if (isNaN(finalTotal) || finalTotal < 0) {
        console.error('[SimpleArduino Widget QA Critical] Некоректне значення фінальної вартості! Активація аварійного гварда.');
        finalTotal = 0;
      }

      const totalWeightKg = (weightPerKit * state.quantity).toFixed(2);

      // 11. Рендеринг результатів у DOM (виключно через textContent)
      elements.summaryHwCost.textContent = formatCurrency(levelData.price);
      elements.summaryGuideCost.textContent = formatCurrency(guideData.price);
      elements.summaryAddonsCost.textContent = formatCurrency(addonsCost);
      elements.summaryUrgencyCost.textContent = formatCurrency(totalShipping);
      elements.summaryPerKitCost.textContent = formatCurrency(costPerKitBeforeDiscount);
      elements.summaryQtyCount.textContent = `${state.quantity} шт.`;

      // Відображення гуртової знижки
      if (bulkDiscountAmount > 0) {
        elements.summaryBulkDiscount.textContent = `-${formatCurrency(bulkDiscountAmount)} (${Math.round(bulkDiscountRate * 100)}%)`;
        elements.summaryBulkDiscount.className = 'font-semibold font-mono text-emerald-600';
      } else {
        elements.summaryBulkDiscount.textContent = '0 грн (0%)';
        elements.summaryBulkDiscount.className = 'font-mono text-slate-400';
      }

      // Відображення знижки за промокодом
      if (promoDiscountAmount > 0) {
        elements.summaryPromoDiscount.textContent = `-${formatCurrency(promoDiscountAmount)} (${Math.round(promoDiscountRate * 100)}%)`;
        elements.summaryPromoDiscount.className = 'font-semibold font-mono text-emerald-600';
      } else {
        elements.summaryPromoDiscount.textContent = '0 грн (0%)';
        elements.summaryPromoDiscount.className = 'font-mono text-slate-400';
      }

      elements.summaryTotalCost.textContent = formatCurrency(finalTotal);
      if (elements.summaryWeight) {
        elements.summaryWeight.textContent = `~${totalWeightKg} кг`;
      }
      if (elements.summaryDelivery) {
        elements.summaryDelivery.textContent = selectedUrgency.days;
      }

      // Діагностичний лог у консоль
      console.table({
        'Кількість (шт)': state.quantity,
        'Рівень комплекту': levelData.name,
        'Ціна бази': levelData.price,
        'Методичка': guideData.name,
        'Додаткові модулі': addonsCost,
        'Терміновість': selectedUrgency.name,
        'Гуртова знижка': `${bulkDiscountAmount} грн (${bulkDiscountRate * 100}%)`,
        'Промо-знижка': `${promoDiscountAmount} грн (${promoDiscountRate * 100}%)`,
        'Разом до сплати': `${finalTotal} грн`,
        'Сумарна вага': `${totalWeightKg} кг`
      });
    }

    /**
     * Відображення безпечного заглибленого стану під час помилки введення
     */
    function renderFallbackSummary(errorMsg) {
      elements.summaryPerKitCost.textContent = '-- грн';
      elements.summaryQtyCount.textContent = '0 шт.';
      elements.summaryBulkDiscount.textContent = '0 грн';
      elements.summaryPromoDiscount.textContent = '0 грн';
      elements.summaryTotalCost.textContent = 'Помилка введення';
      if (elements.summaryWeight) elements.summaryWeight.textContent = '-- кг';
      if (elements.summaryDelivery) elements.summaryDelivery.textContent = 'Не визначено';
    }

    /**
     * Обробка застосування промокоду
     */
    function applyPromoCode() {
      const rawCode = String(elements.promoInput.value).trim().toUpperCase();

      // Захист від порожнього введення
      if (!rawCode) {
        elements.promoMsg.textContent = '⚠ Будь ласка, введіть код купона перед активацією.';
        elements.promoMsg.className = 'text-xs text-amber-600 mt-2 font-medium';
        return;
      }

      // Перевірка наявності в базі
      if (CONFIG.promos[rawCode]) {
        state.appliedPromoCode = rawCode;
        state.appliedPromoDiscount = CONFIG.promos[rawCode].discount;
        
        // Рівень 3: безпечний рендеринг через textContent (XSS immune)
        elements.promoMsg.textContent = `✓ Промокод ${rawCode} успішно активовано: ${CONFIG.promos[rawCode].desc}`;
        elements.promoMsg.className = 'text-xs text-emerald-600 mt-2 font-semibold flex items-center gap-1';
        
        elements.promoApplyBtn.classList.add('hidden');
        elements.promoClearBtn.classList.remove('hidden');
        elements.promoInput.disabled = true;

        console.log(`[SimpleArduino Widget QA] Активовано промокод: ${rawCode} (-${state.appliedPromoDiscount * 100}%)`);
      } else {
        state.appliedPromoCode = null;
        state.appliedPromoDiscount = 0.0;
        
        // Безпечне виведення введеного тексту (навіть якщо користувач ввів <script>)
        elements.promoMsg.textContent = `✕ Промокод "${rawCode}" недійсний або термін його дії вичерпано.`;
        elements.promoMsg.className = 'text-xs text-rose-600 mt-2 font-medium';
        
        console.warn(`[SimpleArduino Widget QA Guard] Відхилено недійсний промокод: ${rawCode}`);
      }

      calculate();
    }

    /**
     * Скидання промокоду
     */
    function clearPromoCode() {
      state.appliedPromoCode = null;
      state.appliedPromoDiscount = 0.0;
      elements.promoInput.disabled = false;
      elements.promoInput.value = '';
      elements.promoMsg.textContent = '';
      elements.promoApplyBtn.classList.remove('hidden');
      elements.promoClearBtn.classList.add('hidden');
      console.log('[SimpleArduino Widget QA] Промокод скинуто.');
      calculate();
    }

    // ==========================================================================
    // ПРИВ'ЯЗКА СЛУХАЧІВ ПОДІЙ (Event Listeners)
    // ==========================================================================

    // 1. Подія 'input' на кількості: миттєвий перерахунок під час набору клавіш
    elements.qtyInput.addEventListener('input', () => {
      calculate();
    });

    // 2. Кнопки швидкого інкременту/декременту (+/-)
    if (elements.qtyMinusBtn) {
      elements.qtyMinusBtn.addEventListener('click', () => {
        let current = parseInt(elements.qtyInput.value, 10);
        if (isNaN(current) || current <= CONFIG.limits.minQty) {
          current = CONFIG.limits.minQty;
        } else {
          current -= 1;
        }
        elements.qtyInput.value = current;
        calculate();
      });
    }

    if (elements.qtyPlusBtn) {
      elements.qtyPlusBtn.addEventListener('click', () => {
        let current = parseInt(elements.qtyInput.value, 10);
        if (isNaN(current) || current < 1) {
          current = 1;
        } else if (current >= CONFIG.limits.maxQty) {
          current = CONFIG.limits.maxQty;
        } else {
          current += 1;
        }
        elements.qtyInput.value = current;
        calculate();
      });
    }

    // 3. Подія 'change' на випадаючих списках та чекбоксах
    elements.levelSelect.addEventListener('change', calculate);
    elements.guideSelect.addEventListener('change', calculate);
    if (elements.addonBattery) elements.addonBattery.addEventListener('change', calculate);
    if (elements.addonCase) elements.addonCase.addEventListener('change', calculate);
    if (elements.addonMentor) elements.addonMentor.addEventListener('change', calculate);

    elements.urgencyRadios.forEach(radio => {
      radio.addEventListener('change', calculate);
    });

    // 4. Промокоди
    if (elements.promoApplyBtn) {
      elements.promoApplyBtn.addEventListener('click', applyPromoCode);
    }
    if (elements.promoClearBtn) {
      elements.promoClearBtn.addEventListener('click', clearPromoCode);
    }
    elements.promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyPromoCode();
      }
    });

    // 5. Кнопка оформлення замовлення (перенесення у форму зворотного зв'язку)
    if (elements.orderBtn) {
      elements.orderBtn.addEventListener('click', () => {
        if (!state.isQtyValid) {
          elements.qtyInput.focus();
          return;
        }

        const messageField = document.getElementById('message');
        const contactSection = document.getElementById('contact');
        
        if (messageField) {
          const levelName = CONFIG.levels[elements.levelSelect.value]?.name || 'Базовий';
          const totalFormatted = elements.summaryTotalCost.textContent;
          messageField.value = `Доброго дня! Бажаю замовити набір SimpleArduino Kit:\n- Кількість: ${state.quantity} шт.\n- Рівень: ${levelName}\n- Розрахована вартість: ${totalFormatted}\nПрошу підтвердити наявність та надіслати реквізити.`;
          
          if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
            messageField.focus();
          }
        }
      });
    }

    // ==========================================================================
    // ПАНЕЛЬ ІНТЕРАКТИВНОГО ТЕСТУВАННЯ EDGE CASES (QA SANDBOX)
    // ==========================================================================
    if (elements.testHappyBtn) {
      elements.testHappyBtn.addEventListener('click', () => {
        console.info('[QA Sandbox] Запуск сценарію: Happy Path (5 наборів, Проміжний рівень + підручник ДСТУ)');
        elements.qtyInput.value = '5';
        elements.levelSelect.value = 'intermediate';
        elements.guideSelect.value = 'book';
        if (elements.addonBattery) elements.addonBattery.checked = true;
        if (elements.addonCase) elements.addonCase.checked = true;
        if (elements.addonMentor) elements.addonMentor.checked = false;
        elements.promoInput.value = 'LP2026';
        applyPromoCode();
      });
    }

    if (elements.testEmptyBtn) {
      elements.testEmptyBtn.addEventListener('click', () => {
        console.info('[QA Sandbox] Запуск сценарію: Edge Case 1 (Порожнє поле)');
        elements.qtyInput.value = '';
        calculate();
      });
    }

    if (elements.testZeroBtn) {
      elements.testZeroBtn.addEventListener('click', () => {
        console.info('[QA Sandbox] Запуск сценарію: Edge Case 2 (Нуль)');
        elements.qtyInput.value = '0';
        calculate();
      });
    }

    if (elements.testNegativeBtn) {
      elements.testNegativeBtn.addEventListener('click', () => {
        console.info('[QA Sandbox] Запуск сценарію: Edge Case 3 (Від\'ємне значення -5)');
        elements.qtyInput.value = '-5';
        calculate();
      });
    }

    if (elements.testOverflowBtn) {
      elements.testOverflowBtn.addEventListener('click', () => {
        console.info('[QA Sandbox] Запуск сценарію: Edge Case 4 (Астрономічне число 9999999999)');
        elements.qtyInput.value = '9999999999';
        calculate();
      });
    }

    if (elements.testDecimalBtn) {
      elements.testDecimalBtn.addEventListener('click', () => {
        console.info('[QA Sandbox] Запуск сценарію: Edge Case 5 (Дробове число 3.5)');
        elements.qtyInput.value = '3.5';
        calculate();
      });
    }

    if (elements.testXssBtn) {
      elements.testXssBtn.addEventListener('click', () => {
        console.info('[QA Sandbox] Запуск сценарію: Edge Case 6 (XSS ін\'єкція у поле промокоду)');
        elements.promoInput.value = '<script>alert("XSS Attack!")</script>';
        applyPromoCode();
      });
    }

    if (elements.testResetBtn) {
      elements.testResetBtn.addEventListener('click', () => {
        console.info('[QA Sandbox] Скидання віджета до базового стану');
        elements.qtyInput.value = '1';
        elements.levelSelect.value = 'basic';
        elements.guideSelect.value = 'pdf';
        if (elements.addonBattery) elements.addonBattery.checked = false;
        if (elements.addonCase) elements.addonCase.checked = false;
        if (elements.addonMentor) elements.addonMentor.checked = false;
        clearPromoCode();
      });
    }

    // Первинний запуск розрахунку при завантаженні сторінки
    console.info('[SimpleArduino Widget QA] Віджет успішно ініціалізовано. Первинний розрахунок:');
    calculate();
  }

  // Запуск ініціалізації після завантаження DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
