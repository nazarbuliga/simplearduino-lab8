/**
 * ==============================================================================
 * Лабораторна робота №9: Адаптивні форми зворотного зв'язку та клієнтська валідація
 * Автор: Булига Назарій, група ПП-25
 * Освітній вебпроєкт: SimpleArduino
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// Етап 7: Регулярні вирази (RegEx) та конфігурація
// ------------------------------------------------------------------------------

/**
 * Регулярний вираз для валідації формату Email:
 * ^ - початок рядка
 * [a-zA-Z0-9._%+-]+ - ім'я поштової скриньки (латиниця, цифри, крапка, дефіс тощо)
 * @ - обов'язковий розділювач між акаунтом і доменом
 * [a-zA-Z0-9.-]+ - назва поштового вузла (домену)
 * \. - екранована граматична крапка
 * [a-zA-Z]{2,} - доменна зона з мінімум 2 літер (.ua, .com, .org тощо)
 * $ - кінець рядка
 */
const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Регулярний вираз для українського формату мобільного номера:
 * ^\+380 - обов'язковий міжнародний телефонний префікс України
 * \d{9} - рівно 9 десяткових цифр національного номера абонента
 * $ - кінець рядка без зайвих символів
 */
const REGEX_PHONE = /^\+380\d{9}$/;

/**
 * Регулярний вираз для імені користувача:
 * Дозволяє українські та латинські літери, апострофи (' та ’), дефіси та одиночні пробіли.
 * Мінімум 2 символи.
 */
const REGEX_NAME = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ'’\s-]{2,}$/;

// ------------------------------------------------------------------------------
// Стан взаємодії з формою (Етап 9: Динамічна валідація без передчасних помилок)
// ------------------------------------------------------------------------------
const touchedFields = {
  username: false,
  email: false,
  phone: false,
  message: false,
  consent: false,
};

let lastActiveElement = null;

// ------------------------------------------------------------------------------
// Етап 5 & 8: Допоміжні UI-функції для керування візуальними станами
// ------------------------------------------------------------------------------

/**
 * Відображає стан помилки (червона рамка, опис помилки, атрибут aria-invalid="true")
 */
function showErr(inputElement, errorElement, iconElement, message) {
  inputElement.classList.remove('border-slate-300', 'border-emerald-500', 'focus:ring-sky-500', 'focus:border-sky-500', 'bg-emerald-50');
  inputElement.classList.add('border-red-500', 'bg-red-50/40', 'focus:ring-red-400', 'focus:border-red-400');
  inputElement.setAttribute('aria-invalid', 'true');

  if (errorElement) {
    const errorTextSpan = errorElement.querySelector('span') || errorElement;
    errorTextSpan.textContent = message;
    errorElement.classList.remove('hidden');
  }

  if (iconElement) {
    iconElement.classList.add('hidden');
  }
}

/**
 * Відображає стан успіху (зелена рамка, іконка успіху, атрибут aria-invalid="false")
 */
function showSuccess(inputElement, errorElement, iconElement) {
  inputElement.classList.remove('border-slate-300', 'border-red-500', 'bg-red-50/40', 'focus:ring-red-400', 'focus:border-red-400');
  inputElement.classList.add('border-emerald-500', 'focus:ring-emerald-400', 'focus:border-emerald-400');
  inputElement.setAttribute('aria-invalid', 'false');

  if (errorElement) {
    errorElement.classList.add('hidden');
  }

  if (iconElement) {
    iconElement.classList.remove('hidden');
  }
}

/**
 * Скидає стан поля до нейтрального/початкового
 */
function resetFieldState(inputElement, errorElement, iconElement) {
  inputElement.classList.remove('border-red-500', 'border-emerald-500', 'bg-red-50/40', 'focus:ring-red-400', 'focus:border-red-400', 'focus:ring-emerald-400', 'focus:border-emerald-400');
  inputElement.classList.add('border-slate-300', 'focus:ring-sky-500', 'focus:border-sky-500');
  inputElement.setAttribute('aria-invalid', 'false');

  if (errorElement) {
    errorElement.classList.add('hidden');
  }

  if (iconElement) {
    iconElement.classList.add('hidden');
  }
}

// ------------------------------------------------------------------------------
// Етап 8: Мікро-функції валідації полів
// ------------------------------------------------------------------------------

/**
 * Валідація поля імені (Ім'я >= 2 символів, коректні літери)
 */
function validateName() {
  const input = document.getElementById('username');
  const error = document.getElementById('nameError');
  const icon = document.getElementById('usernameStatusIcon');
  if (!input) return true;

  const value = input.value.trim();

  if (value.length === 0) {
    showErr(input, error, icon, "Ім'я є обов'язковим для заповнення.");
    return false;
  }

  if (value.length < 2) {
    showErr(input, error, icon, "Ім'я повинно містити щонайменше 2 символи.");
    return false;
  }

  if (!REGEX_NAME.test(value)) {
    showErr(input, error, icon, "Ім'я може містити лише українські або латинські літери.");
    return false;
  }

  showSuccess(input, error, icon);
  return true;
}

/**
 * Валідація електронної пошти за стандартом RegEx
 */
function validateEmail() {
  const input = document.getElementById('email');
  const error = document.getElementById('emailError');
  const icon = document.getElementById('emailStatusIcon');
  if (!input) return true;

  const value = input.value.trim();

  if (value.length === 0) {
    showErr(input, error, icon, "Електронна пошта є обов'язковою.");
    return false;
  }

  if (!REGEX_EMAIL.test(value)) {
    showErr(input, error, icon, "Введіть коректну електронну адресу (наприклад, user@mail.com).");
    return false;
  }

  showSuccess(input, error, icon);
  return true;
}

/**
 * Валідація українського номера телефону +380XXXXXXXXX (Етап 10: Edge Cases)
 */
function validatePhone() {
  const input = document.getElementById('phone');
  const error = document.getElementById('phoneError');
  const icon = document.getElementById('phoneStatusIcon');
  if (!input) return true;

  const value = input.value.trim();

  if (value.length === 0) {
    showErr(input, error, icon, "Номер телефону є обов'язковим.");
    return false;
  }

  if (!value.startsWith('+380')) {
    showErr(input, error, icon, "Номер повинен починатися з міжнародного префікса +380.");
    return false;
  }

  if (value.length < 13) {
    showErr(input, error, icon, `Недостатньо цифр: введено ${value.length - 4} з 9 цифр номера.`);
    return false;
  }

  if (value.length > 13) {
    showErr(input, error, icon, `Забагато цифр: український номер містить рівно 9 цифр після +380.`);
    return false;
  }

  if (!REGEX_PHONE.test(value)) {
    showErr(input, error, icon, "Формат має бути строго українським: +380XXXXXXXXX (тільки цифри).");
    return false;
  }

  showSuccess(input, error, icon);
  return true;
}

/**
 * Валідація поля повідомлення (мінімум 10 символів)
 */
function validateMessage() {
  const input = document.getElementById('message');
  const error = document.getElementById('messageError');
  if (!input) return true;

  const value = input.value.trim();

  if (value.length === 0) {
    showErr(input, error, null, "Повідомлення не може бути порожнім.");
    return false;
  }

  if (value.length < 10) {
    showErr(input, error, null, `Повідомлення занадто коротке (зараз ${value.length} з 10 символів).`);
    return false;
  }

  showSuccess(input, error, null);
  return true;
}

/**
 * Валідація чекбокса згоди з політикою конфіденційності
 */
function validateConsent() {
  const input = document.getElementById('consent');
  const error = document.getElementById('consentError');
  if (!input) return true;

  if (!input.checked) {
    input.classList.add('border-red-500', 'ring-1', 'ring-red-400');
    input.setAttribute('aria-invalid', 'true');
    if (error) error.classList.remove('hidden');
    return false;
  }

  input.classList.remove('border-red-500', 'ring-1', 'ring-red-400');
  input.classList.add('border-slate-300');
  input.setAttribute('aria-invalid', 'false');
  if (error) error.classList.add('hidden');
  return true;
}

// ------------------------------------------------------------------------------
// Етап 10: Інтелектуальна обробка введення телефону (UX Edge Cases)
// ------------------------------------------------------------------------------
function setupPhoneUX(phoneInput) {
  if (!phoneInput) return;

  // Обробка вставки тексту (Paste) - очищення пробілів, дужок, дефісів
  phoneInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    let sanitized = pastedText.replace(/[\s\(\)\-\.]/g, '');

    // Якщо починається з 0, перетворюємо в +380
    if (sanitized.startsWith('0') && sanitized.length === 10) {
      sanitized = '+38' + sanitized;
    } else if (sanitized.startsWith('380')) {
      sanitized = '+' + sanitized;
    } else if (!sanitized.startsWith('+') && sanitized.length === 9) {
      sanitized = '+380' + sanitized;
    }

    phoneInput.value = sanitized.slice(0, 13);
    if (touchedFields.phone) validatePhone();
  });

  // Автоматична підтримка початку номера з +380 при введенні 0
  phoneInput.addEventListener('input', (e) => {
    let val = phoneInput.value;

    // Якщо користувач ввів 0 першим символом: автозаміна на +380
    if (val === '0') {
      phoneInput.value = '+380';
      return;
    }

    // Якщо користувач очистив префікс або вставив без +, повертаємо коректний шаблон
    if (val.length > 0 && !val.startsWith('+')) {
      if (val.startsWith('380')) {
        phoneInput.value = '+' + val;
      } else if (val.startsWith('80')) {
        phoneInput.value = '+3' + val;
      }
    }

    // Заборона перевищення максимальної довжини (+380 + 9 цифр = 13 символів)
    if (phoneInput.value.length > 13) {
      phoneInput.value = phoneInput.value.slice(0, 13);
    }

    if (touchedFields.phone) {
      validatePhone();
    }
  });
}

// ------------------------------------------------------------------------------
// Етап 11: Керування доступним модальним вікном (Accessible Modal Window)
// ------------------------------------------------------------------------------
function setupModal() {
  const modal = document.getElementById('successModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const closeIconBtn = document.getElementById('closeModalIconBtn');

  if (!modal) return;

  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');

    // Відновлення фокусу для доступності (WCAG Focus Management)
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  function openModal() {
    lastActiveElement = document.activeElement;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');

    // Переведення фокусу на кнопку закриття всередині модального вікна
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 50);
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeIconBtn) closeIconBtn.addEventListener('click', closeModal);

  // Закриття по кліку на темний оверлей (без закриття при кліку на контент модалки)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Закриття по клавіші Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  return { openModal, closeModal };
}

// ------------------------------------------------------------------------------
// Головна ініціалізація слухачів подій форми
// ------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedbackForm') || document.getElementById('contact-form');
  if (!form) return;

  const usernameInput = document.getElementById('username') || document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const messageInput = document.getElementById('message');
  const consentInput = document.getElementById('consent');

  const { openModal } = setupModal() || {};

  // Налаштування UX для номера телефону
  if (phoneInput) setupPhoneUX(phoneInput);

  // Додавання слухачів input / blur для кожного поля
  if (usernameInput) {
    usernameInput.addEventListener('blur', () => {
      touchedFields.username = true;
      validateName();
    });
    usernameInput.addEventListener('input', () => {
      if (touchedFields.username) validateName();
    });
  }

  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      touchedFields.email = true;
      validateEmail();
    });
    emailInput.addEventListener('input', () => {
      if (touchedFields.email) validateEmail();
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('blur', () => {
      touchedFields.phone = true;
      validatePhone();
    });
  }

  if (messageInput) {
    messageInput.addEventListener('blur', () => {
      touchedFields.message = true;
      validateMessage();
    });
    messageInput.addEventListener('input', () => {
      if (touchedFields.message) validateMessage();
    });
  }

  if (consentInput) {
    consentInput.addEventListener('change', () => {
      touchedFields.consent = true;
      validateConsent();
    });
  }

  // Обробка відправлення форми (Submit)
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Запобігаємо стандартному перезавантаженню сторінки

    // Позначаємо всі поля як опрацьовані користувачем
    touchedFields.username = true;
    touchedFields.email = true;
    touchedFields.phone = true;
    touchedFields.message = true;
    touchedFields.consent = true;

    // Одночасний запуск повної валідації всіх полів
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isMsgValid = validateMessage();
    const isConsentValid = validateConsent();

    // Якщо хоча б одне поле невалідне — зупиняємо надсилання та фокусуємо перше помилкове поле
    if (!isNameValid || !isEmailValid || !isPhoneValid || !isMsgValid || !isConsentValid) {
      if (!isNameValid && usernameInput) {
        usernameInput.focus();
      } else if (!isEmailValid && emailInput) {
        emailInput.focus();
      } else if (!isPhoneValid && phoneInput) {
        phoneInput.focus();
      } else if (!isMsgValid && messageInput) {
        messageInput.focus();
      } else if (!isConsentValid && consentInput) {
        consentInput.focus();
      }
      return;
    }

    // Заповнення даних підсумку у модальне вікно
    const summaryName = document.getElementById('summaryName');
    const summaryEmail = document.getElementById('summaryEmail');
    const summaryPhone = document.getElementById('summaryPhone');
    if (summaryName && usernameInput) summaryName.textContent = usernameInput.value.trim();
    if (summaryEmail && emailInput) summaryEmail.textContent = emailInput.value.trim();
    if (summaryPhone && phoneInput) summaryPhone.textContent = phoneInput.value.trim();

    // Відкриваємо модальне вікно успішної валідації
    if (typeof openModal === 'function') {
      openModal();
    }

    // Очищуємо форму
    form.reset();

    // Скидаємо прапорці взаємодії та класи рамок
    Object.keys(touchedFields).forEach((key) => {
      touchedFields[key] = false;
    });

    [usernameInput, emailInput, phoneInput, messageInput].forEach((inp) => {
      if (inp) {
        inp.classList.remove('border-emerald-500', 'border-red-500', 'bg-red-50/40', 'bg-emerald-50');
        inp.classList.add('border-slate-300');
        inp.setAttribute('aria-invalid', 'false');
      }
    });

    // Приховуємо іконки успіху
    ['usernameStatusIcon', 'emailStatusIcon', 'phoneStatusIcon'].forEach((iconId) => {
      const ic = document.getElementById(iconId);
      if (ic) ic.classList.add('hidden');
    });
  });
});
