// Константы для системы регистрации билетов

// Определение тарифов
export const TARIFFS = [
  {
    id: 'early-bird',
    name: 'Early Bird',
    price: 15000,
    description: 'Ранняя регистрация со скидкой',
    icon: 'Zap',
    badge: 'Выгодно',
    features: ['Скидка 30%', 'Приоритетная регистрация', 'Сувенир']
  },
  {
    id: 'standard',
    name: 'Стандарт',
    price: 25000,
    description: 'Стандартный билет',
    icon: 'Ticket',
    features: ['Полный доступ', 'Материалы мероприятия']
  },
  {
    id: 'student',
    name: 'Студент',
    price: 18000,
    description: 'Специальная цена для студентов',
    icon: 'User',
    badge: 'Скидка',
    features: ['Скидка 20%', 'Требуется студенческий']
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 45000,
    description: 'Премиум доступ',
    icon: 'Crown',
    badge: 'Премиум',
    features: ['VIP-зона', 'Networking', 'Кейтеринг', 'Подарок']
  },
  {
    id: 'group',
    name: 'Групповой',
    price: 20000,
    description: 'От 3-х человек',
    icon: 'Users',
    badge: 'От 3-х',
    features: ['Скидка от 15%', 'Групповая регистрация']
  }
] as const;

// Промокоды и их скидки
export const PROMO_CODES = {
  'EARLY2024': { discount: 0.20, description: '20% скидка' },
  'STUDENT': { discount: 0.15, description: '15% скидка для студентов' },
  'VIP50': { discount: 0.10, description: '10% VIP скидка' },
  'FRIEND': { discount: 0.25, description: '25% скидка для друзей' }
} as const;

// Шаги регистрации
export const REGISTRATION_STEPS = [
  { number: 1, title: 'Личные данные', description: 'ФИО и контакты' },
  { number: 2, title: 'Выбор тарифа', description: 'Подберите подходящий тариф' },
  { number: 3, title: 'Промокод', description: 'Примените скидку' },
  { number: 4, title: 'Оплата', description: 'Завершите регистрацию' }
] as const;

// Статусы оплаты
export const PAYMENT_STATUSES = {
  pending: { label: 'Ожидание оплаты', color: 'bg-warning' },
  paid: { label: 'Оплачен', color: 'bg-success' },
  'refund-requested': { label: 'Запрос возврата', color: 'bg-warning' },
  refunded: { label: 'Возвращен', color: 'bg-destructive' }
} as const;
