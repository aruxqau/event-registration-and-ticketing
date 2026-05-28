// Утилиты для форматирования данных

/**
 * Форматирует номер телефона в формат +7 (XXX) XXX-XX-XX
 */
export function formatPhoneNumber(value: string): string {
  // Удаляем все кроме цифр
  let digits = value.replace(/\D/g, '');
  
  // Ограничиваем длину (максимум 11 цифр для +7XXXXXXXXXX)
  if (digits.length > 11) {
    digits = digits.slice(0, 11);
  }
  
  // Форматируем номер
  let formatted = '';
  if (digits.length > 0) {
    formatted = '+7';
    if (digits.length > 1) {
      formatted += ' (' + digits.slice(1, 4);
    }
    if (digits.length >= 4) {
      formatted += ') ' + digits.slice(4, 7);
    }
    if (digits.length >= 7) {
      formatted += '-' + digits.slice(7, 9);
    }
    if (digits.length >= 9) {
      formatted += '-' + digits.slice(9, 11);
    }
  }
  
  return formatted;
}

/**
 * Форматирует номер карты в формат XXXX XXXX XXXX XXXX
 */
export function formatCardNumber(value: string): string {
  // Удаляем все кроме цифр
  let digits = value.replace(/\D/g, '');
  
  // Ограничиваем длину (максимум 16 цифр)
  if (digits.length > 16) {
    digits = digits.slice(0, 16);
  }
  
  // Форматируем номер карты (каждые 4 цифры через пробел)
  let formatted = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    formatted += digits[i];
  }
  
  return formatted;
}

/**
 * Форматирует срок действия карты в формат MM/YY
 */
export function formatExpiryDate(value: string): string {
  // Удаляем все кроме цифр
  let digits = value.replace(/\D/g, '');
  
  // Ограничиваем длину (максимум 4 цифры)
  if (digits.length > 4) {
    digits = digits.slice(0, 4);
  }
  
  // Форматируем с автоматической вставкой "/"
  if (digits.length >= 2) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }
  
  return digits;
}

/**
 * Форматирует имя на карте (только латинские буквы)
 */
export function formatCardName(value: string): string {
  return value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
}

/**
 * Форматирует CVV (только цифры, максимум 3)
 */
export function formatCVV(value: string): string {
  return value.replace(/\D/g, '').slice(0, 3);
}

/**
 * Форматирует цену в тенге
 */
export function formatPrice(price: number): string {
  return `${price.toFixed(2)} ₸`;
}

/**
 * Форматирует дату в читаемый формат
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
