# Документация для разработчиков

## 📁 Структура проекта

```
/
├── App.tsx                          # Главный компонент приложения
├── components/                      # React компоненты
│   ├── ui/                          # UI компоненты (shadcn/ui)
│   ├── RegistrationFormOptimized.tsx # Оптимизированная форма регистрации
│   ├── TicketView.tsx               # Просмотр билета
│   ├── AdminPanel.tsx               # Админ-панель
│   └── StepProgress.tsx             # Прогресс-бар шагов
├── utils/                           # Утилиты
│   ├── constants.ts                 # Константы (тарифы, промокоды)
│   ├── formatters.ts                # Функции форматирования
│   ├── validators.ts                # Функции валидации
│   └── generators.ts                # Генераторы ID, QR-кодов
└── styles/                          # Стили
    └── globals.css                  # Глобальные стили
```

## 🧩 Основные компоненты

### App.tsx
Главный компонент, управляющий:
- Состоянием участников и транзакций
- Автоматическим сохранением в localStorage
- Навигацией между вкладками

### RegistrationFormOptimized.tsx
Пошаговая форма регистрации из 4 этапов:
1. **Личные данные** - ФИО, email, телефон
2. **Выбор тарифа** - 5 тарифов с разными ценами
3. **Промокод** - применение скидок
4. **Оплата** - ввод данных карты и завершение

## 🛠 Утилиты

### formatters.ts
Функции для форматирования пользовательского ввода:
- `formatPhoneNumber()` - Форматирует телефон в +7 (XXX) XXX-XX-XX
- `formatCardNumber()` - Форматирует номер карты в XXXX XXXX XXXX XXXX
- `formatExpiryDate()` - Форматирует срок в MM/YY
- `formatCardName()` - Только латинские буквы, верхний регистр
- `formatCVV()` - Только цифры, макс 3 символа
- `formatPrice()` - Форматирует цену в тенге
- `formatDate()` - Форматирует дату в читаемый вид

### validators.ts
Функции валидации данных:
- `isValidEmail()` - Проверка email
- `validatePersonalInfo()` - Валидация личных данных
- `validateTariffSelection()` - Проверка выбора тарифа
- `validatePaymentData()` - Валидация данных карты

### generators.ts
Генераторы уникальных значений:
- `generateId()` - Генерация уникального ID
- `generateTicketNumber()` - Генерация номера билета
- `generateTransactionId()` - Генерация ID транзакции
- `generateQRCode()` - Генерация URL для QR-кода

### constants.ts
Константы приложения:
- `TARIFFS` - Массив тарифов с ценами и описаниями
- `PROMO_CODES` - Объект промокодов и скидок
- `REGISTRATION_STEPS` - Шаги регистрации
- `PAYMENT_STATUSES` - Статусы оплаты

## 💾 Сохранение данных

Приложение использует **localStorage** для персистентности:

```typescript
// Данные автоматически сохраняются при изменении
localStorage.setItem('participants', JSON.stringify(participants));
localStorage.setItem('transactions', JSON.stringify(transactions));
localStorage.setItem('currentTicket', JSON.stringify(currentTicket));
```

### Ключи localStorage:
- `participants` - Массив всех участников
- `transactions` - Массив всех транзакций
- `currentTicket` - Текущий просматриваемый билет

## 🎨 Тарифы

| Тариф | Цена | Описание |
|-------|------|----------|
| Early Bird | 15,000 ₸ | Ранняя регистрация со скидкой 30% |
| Стандарт | 25,000 ₸ | Стандартный билет с полным доступом |
| Студент | 18,000 ₸ | Специальная цена для студентов |
| VIP | 45,000 ₸ | Премиум доступ с VIP-зоной |
| Групповой | 20,000 ₸ | Скидка при регистрации от 3 человек |

## 🎫 Промокоды

| Код | Скидка | Описание |
|-----|--------|----------|
| EARLY2024 | 20% | Ранняя регистрация |
| STUDENT | 15% | Скидка для студентов |
| VIP50 | 10% | VIP скидка |
| FRIEND | 25% | Скидка для друзей |

## 🔄 Жизненный цикл регистрации

1. **Заполнение личных данных** → валидация
2. **Выбор тарифа** → расчет базовой цены
3. **Применение промокода** (опционально) → расчет скидки
4. **Оплата** → валидация карты → имитация платежа (2 сек)
5. **Создание участника и транзакции** → сохранение в localStorage
6. **Показ билета** → переход на вкладку "Мой билет"

## 🧪 Тестовые данные для карты

Для тестирования оплаты можно использовать:
- **Номер карты**: 4111 1111 1111 1111
- **Имя**: IVAN IVANOV
- **Срок**: 12/25
- **CVV**: 123

## 📝 Типы данных

### Participant
```typescript
interface Participant {
  id: string;                    // Уникальный ID
  fullName: string;              // ФИО
  email: string;                 // Email
  phone: string;                 // Телефон
  tariff: string;                // Название тарифа
  promoCode?: string;            // Примененный промокод
  basePrice: number;             // Базовая цена
  discount: number;              // Скидка
  finalPrice: number;            // Итоговая цена
  paymentStatus: string;         // Статус оплаты
  ticketNumber: string;          // Номер билета
  registrationDate: string;      // Дата регистрации
  qrCode: string;                // URL QR-кода
}
```

### Transaction
```typescript
interface Transaction {
  id: string;                    // ID транзакции
  participantId: string;         // ID участника
  type: 'purchase' | 'refund';   // Тип транзакции
  amount: number;                // Сумма
  date: string;                  // Дата
  status: 'success' | 'failed';  // Статус
}
```

## 🚀 Расширение функционала

### Добавление нового тарифа

1. Откройте `/utils/constants.ts`
2. Добавьте новый объект в массив `TARIFFS`:

```typescript
{
  id: 'new-tariff',
  name: 'Новый тариф',
  price: 30000,
  description: 'Описание',
  features: ['Функция 1', 'Функция 2'],
  icon: 'Star',
  badge: 'Новинка'
}
```

### Добавление промокода

1. Откройте `/components/RegistrationFormOptimized.tsx`
2. Добавьте в объект `PROMO_CODES`:

```typescript
'NEWCODE': { discount: 0.30, description: '30% скидка' }
```

## 🐛 Отладка

Для просмотра сохраненных данных в консоли браузера:

```javascript
// Просмотр участников
console.log(JSON.parse(localStorage.getItem('participants')));

// Просмотр транзакций
console.log(JSON.parse(localStorage.getItem('transactions')));

// Очистка всех данных
localStorage.clear();
```

## ⚡ Оптимизация

Код оптимизирован для:
- **Читаемости** - четкая структура, комментарии
- **Переиспользования** - вынесенные утилиты
- **Масштабируемости** - легко добавить новые тарифы/промокоды
- **Производительности** - мемоизация, оптимальные ре-рендеры

## 📚 Используемые библиотеки

- **React** - UI фреймворк
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **shadcn/ui** - UI компоненты
- **lucide-react** - иконки
- **sonner** - уведомления (toast)
- **jspdf** - генерация PDF
- **html2canvas** - скриншоты для PDF
