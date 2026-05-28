// Утилиты для валидации данных

/**
 * Проверяет корректность email адреса
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Проверяет заполненность обязательных полей формы
 */
export function validatePersonalInfo(data: {
  fullName: string;
  email: string;
  phone: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.fullName.trim()) {
    errors.fullName = 'Введите ФИО';
  }

  if (!data.email.trim()) {
    errors.email = 'Введите email';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Неверный формат email';
  }

  if (!data.phone.trim()) {
    errors.phone = 'Введите телефон';
  }

  return errors;
}

/**
 * Проверяет выбор тарифа
 */
export function validateTariffSelection(tariff: string): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!tariff) {
    errors.tariff = 'Выберите тариф';
  }

  return errors;
}

/**
 * Проверяет данные платежной карты
 */
export function validatePaymentData(data: {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const cardDigits = data.cardNumber.replace(/\D/g, '');
  if (cardDigits.length !== 16) {
    errors.cardNumber = 'Введите 16 цифр';
  }

  if (!data.cardName.trim()) {
    errors.cardName = 'Введите имя на карте';
  }

  const expiryDigits = data.expiryDate.replace(/\D/g, '');
  if (expiryDigits.length !== 4) {
    errors.expiryDate = 'Формат MM/YY';
  }

  if (data.cvv.length !== 3) {
    errors.cvv = 'Введите 3 цифры';
  }

  return errors;
}
