// Утилиты для генерации данных

/**
 * Генерирует уникальный ID
 */
export function generateId(): string {
  return `ID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Генерирует номер билета
 */
export function generateTicketNumber(): string {
  const prefix = 'TKT';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Генерирует ID транзакции
 */
export function generateTransactionId(): string {
  return `TXN-${Date.now()}`;
}

/**
 * Генерирует QR код (заглушка - возвращает placeholder)
 */
export function generateQRCode(data: string): string {
  // В реальном приложении здесь была бы интеграция с QR библиотекой
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
}
