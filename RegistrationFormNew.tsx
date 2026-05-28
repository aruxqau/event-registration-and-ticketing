import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { StepProgress } from './StepProgress';
import { Check, Tag, CreditCard, Loader2, ChevronRight, ChevronLeft, Users, Star, Zap, Crown, Calendar, User, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Participant, Transaction } from '../App';

interface RegistrationFormNewProps {
  onComplete: (participant: Participant, transaction: Transaction) => void;
}

interface Tariff {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
}

interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
  validUntil?: string;
  maxUses?: number;
  applicableTariffs?: string[];
}

const TARIFFS: Tariff[] = [
  {
    id: 'early-bird',
    name: 'Early Bird',
    price: 2490,
    originalPrice: 3490,
    description: 'Ранняя регистрация со скидкой',
    features: ['Доступ к основной программе', 'Материалы мероприятия', 'Сертификат участника', 'Скидка 30%'],
    icon: <Calendar className="size-6" />,
    badge: 'Скидка 30%',
    badgeColor: 'bg-warning'
  },
  {
    id: 'standard',
    name: 'Стандарт',
    price: 6790,
    description: 'Оптимальный выбор',
    features: ['Все из Early Bird', 'Доступ к мастер-классам', 'Обед и кофе-брейки', 'Нетворкинг-зона', 'Материалы спикеров'],
    icon: <Zap className="size-6" />,
    popular: true
  },
  {
    id: 'student',
    name: 'Студент',
    price: 4490,
    description: 'Специальное предложение для студентов',
    features: ['Доступ к основной программе', 'Материалы мероприятия', 'Сертификат участника', 'Доступ к мастер-классам', 'Скидка для студентов'],
    icon: <User className="size-6" />,
    badge: 'Для студентов',
    badgeColor: 'bg-blue-500'
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 13000,
    description: 'Премиум опыт',
    features: ['Все из Стандарта', 'VIP места в первых рядах', 'Индивидуальная встреча со спикерами', 'Подарочный набор', 'Приоритетная поддержка', 'Фото с сертификатом'],
    icon: <Crown className="size-6" />,
    badge: 'Эксклюзив',
    badgeColor: 'bg-amber-500'
  },
  {
    id: 'group',
    name: 'Групповой (от 3 чел.)',
    price: 5990,
    description: 'Скидка при групповой регистрации',
    features: ['Все из Стандарта', 'Скидка 15% на каждого', 'Групповое фото', 'Общий сертификат команды', 'Минимум 3 участника'],
    icon: <Users className="size-6" />,
    badge: 'Скидка 15%',
    badgeColor: 'bg-success'
  }
];

const PROMO_CODES: PromoCode[] = [
  { code: 'EARLY2024', discount: 20, type: 'percentage', description: 'Ранняя регистрация', validUntil: '2024-12-31' },
  { code: 'STUDENT30', discount: 30, type: 'percentage', description: 'Скидка для студентов', applicableTariffs: ['student', 'early-bird'] },
  { code: 'VIP1000', discount: 1000, type: 'fixed', description: 'Фиксированная скидка на VIP', applicableTariffs: ['vip'] },
  { code: 'PARTNER15', discount: 15, type: 'percentage', description: 'Партнерская скидка' },
  { code: 'FREEVIP', discount: 100, type: 'percentage', description: 'Бесплатный вход (тестовый)', maxUses: 5 }
];

const STEPS = [
  { id: 1, name: 'Тариф', description: 'Выбор пакета' },
  { id: 2, name: 'Данные', description: 'Информация' },
  { id: 3, name: 'Промокод', description: 'Скидки' },
  { id: 4, name: 'Оплата', description: 'Завершение' }
];

export function RegistrationFormNew({ onComplete }: RegistrationFormNewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    tariff: 'standard',
    participants: 1
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const selectedTariff = TARIFFS.find(t => t.id === formData.tariff)!;
  const basePrice = selectedTariff.price * formData.participants;

  let discount = 0;
  if (appliedPromo) {
    const isApplicable = !appliedPromo.applicableTariffs || 
                        appliedPromo.applicableTariffs.includes(formData.tariff);
    
    if (isApplicable) {
      discount = appliedPromo.type === 'percentage'
        ? (basePrice * appliedPromo.discount) / 100
        : appliedPromo.discount;
    }
  }

  const finalPrice = Math.max(0, basePrice - discount);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) errors.fullName = 'Введите ФИО';
      if (!formData.email.trim()) errors.email = 'Введите email';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Неверный формат email';
      if (!formData.phone.trim()) errors.phone = 'Введите телефон';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error('Заполните все обязательные поля');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleApplyPromo = () => {
    const promo = PROMO_CODES.find(p => p.code.toLowerCase() === promoCode.toLowerCase());
    if (promo) {
      const isApplicable = !promo.applicableTariffs || 
                          promo.applicableTariffs.includes(formData.tariff);
      
      if (!isApplicable) {
        toast.error(`Промокод не применим к тарифу "${selectedTariff.name}"`);
        return;
      }

      setAppliedPromo(promo);
      toast.success(`✓ Промокод применен: ${promo.description}`);
    } else {
      toast.error('❌ Промокод не найден или истек');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    toast.info('Промокод удален');
  };

  const generateQRCode = (ticketNumber: string): string => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      `TICKET-${ticketNumber}`
    )}`;
  };

  const handlePayment = async () => {
    if (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiryDate || !paymentData.cvv) {
      toast.error('Заполните все данные карты');
      return;
    }

    setIsProcessing(true);

    // Эмуляция процесса оплаты
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Имитация возможной ошибки (10% вероятность)
    const isSuccess = Math.random() > 0.1;

    if (!isSuccess) {
      setIsProcessing(false);
      toast.error('❌ Ошибка оплаты. Проверьте данные карты и попробуйте снова.');
      return;
    }

    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const participantId = `USR-${Date.now()}`;

    const participant: Participant = {
      id: participantId,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      tariff: selectedTariff.name,
      promoCode: appliedPromo?.code,
      basePrice,
      discount,
      finalPrice,
      paymentStatus: 'paid',
      ticketNumber,
      registrationDate: new Date().toISOString(),
      qrCode: generateQRCode(ticketNumber)
    };

    const transaction: Transaction = {
      id: `TXN-${Date.now()}`,
      participantId,
      type: 'purchase',
      amount: finalPrice,
      date: new Date().toISOString(),
      status: 'success'
    };

    onComplete(participant, transaction);
    toast.success('✓ Оплата прошла успешно! Билет сгенерирован.');
    setIsProcessing(false);

    // Email уведомление (эмуляция)
    setTimeout(() => {
      toast.info(`📧 Билет отправлен на ${formData.email}`);
    }, 1000);

    // Сброс формы
    setFormData({ fullName: '', email: '', phone: '', organization: '', tariff: 'standard', participants: 1 });
    setPromoCode('');
    setAppliedPromo(null);
    setCurrentStep(0);
    setShowPaymentForm(false);
    setPaymentData({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <StepProgress steps={STEPS} currentStep={currentStep} />

      <Card className="shadow-lg">
        {/* Шаг 1: Выбор тарифа */}
        {currentStep === 0 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="size-6 text-primary" />
                Выберите тариф
              </CardTitle>
              <CardDescription>Подберите подходящий пакет для участия в мероприятии</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={formData.tariff} 
                onValueChange={(value) => setFormData({ ...formData, tariff: value })}
              >
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {TARIFFS.map((tariff) => (
                    <div key={tariff.id} className="relative h-full">
                      <RadioGroupItem
                        value={tariff.id}
                        id={tariff.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={tariff.id}
                        className={`
                          flex flex-col h-full rounded-xl border-2 p-5 cursor-pointer 
                          hover:border-primary/50 hover:shadow-md
                          peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary-light 
                          transition-all relative overflow-hidden
                          ${tariff.popular ? 'ring-2 ring-primary ring-offset-2' : 'border-border'}
                        `}
                      >
                        {tariff.popular && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg">
                            Популярный
                          </div>
                        )}
                        
                        {tariff.badge && (
                          <Badge className={`${tariff.badgeColor} text-white mb-3 w-fit`}>
                            {tariff.badge}
                          </Badge>
                        )}

                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-primary">{tariff.icon}</div>
                          <span className="text-foreground">{tariff.name}</span>
                        </div>

                        <div className="mb-3">
                          {tariff.originalPrice && (
                            <span className="text-muted-foreground line-through mr-2">
                              {tariff.originalPrice} ₸
                            </span>
                          )}
                          <span className="text-primary">{tariff.price} ₸</span>
                        </div>

                        <p className="text-muted-foreground mb-4">{tariff.description}</p>

                        <ul className="space-y-2 flex-1">
                          {tariff.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-foreground">
                              <Check className="size-4 text-success mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {formData.tariff === 'group' && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <Label htmlFor="participants">Количество участников *</Label>
                  <Input
                    id="participants"
                    type="number"
                    min="3"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: Math.max(3, parseInt(e.target.value) || 3) })}
                    className="mt-2 max-w-xs"
                  />
                  <p className="text-muted-foreground mt-2">
                    Минимум 3 участника. Стоимость: {formData.participants} × {selectedTariff.price} ₸ = {basePrice} ₸
                  </p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button onClick={handleNext} size="lg" className="min-w-[180px]">
                  Далее
                  <ChevronRight className="ml-2 size-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Шаг 2: Данные участника */}
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-6 text-primary" />
                Ваши данные
              </CardTitle>
              <CardDescription>Заполните контактную информацию для регистрации</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="size-4" />
                  ФИО *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Иванов Иван Иванович"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={formErrors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {formErrors.fullName && (
                  <p className="text-destructive">{formErrors.fullName}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="size-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.ru"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={(e) => {
                      const email = e.target.value.trim();
                      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        setFormErrors({ ...formErrors, email: 'Неверный формат email' });
                      } else if (formErrors.email) {
                        const { email: _, ...rest } = formErrors;
                        setFormErrors(rest);
                      }
                    }}
                    className={formErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {formErrors.email && (
                    <p className="text-destructive">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="size-4" />
                    Телефон *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (777) 123-45-67"
                    value={formData.phone}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, ''); // Удаляем все кроме цифр
                      
                      // Ограничиваем длину (максимум 11 цифр для +7XXXXXXXXXX)
                      if (value.length > 11) {
                        value = value.slice(0, 11);
                      }
                      
                      // Форматируем номер
                      let formatted = '';
                      if (value.length > 0) {
                        formatted = '+7';
                        if (value.length > 1) {
                          formatted += ' (' + value.slice(1, 4);
                        }
                        if (value.length >= 4) {
                          formatted += ') ' + value.slice(4, 7);
                        }
                        if (value.length >= 7) {
                          formatted += '-' + value.slice(7, 9);
                        }
                        if (value.length >= 9) {
                          formatted += '-' + value.slice(9, 11);
                        }
                      }
                      
                      setFormData({ ...formData, phone: formatted });
                    }}
                    className={formErrors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}
                    maxLength={18}
                  />
                  {formErrors.phone && (
                    <p className="text-destructive">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Организация (необязательно)</Label>
                <Input
                  id="organization"
                  placeholder="Название компании или учебного заведения"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                />
              </div>

              <div className="flex justify-between mt-6">
                <Button onClick={handlePrev} variant="outline" size="lg">
                  <ChevronLeft className="mr-2 size-4" />
                  Назад
                </Button>
                <Button onClick={handleNext} size="lg" className="min-w-[180px]">
                  Далее
                  <ChevronRight className="ml-2 size-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Шаг 3: Промокод */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="size-6 text-primary" />
                Промокод
              </CardTitle>
              <CardDescription>
                Есть промокод? Примените его для получения скидки
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {appliedPromo ? (
                <div className="p-4 bg-success/10 border-2 border-success rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-success flex items-center gap-2">
                        <Check className="size-5" />
                        Промокод <strong>{appliedPromo.code}</strong> успешно применен
                      </p>
                      <p className="text-muted-foreground mt-1">{appliedPromo.description}</p>
                      {appliedPromo.validUntil && (
                        <p className="text-muted-foreground">
                          Действует до: {new Date(appliedPromo.validUntil).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>
                    <Button type="button" variant="outline" onClick={handleRemovePromo}>
                      Удалить
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Введите промокод"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    />
                    <Button type="button" onClick={handleApplyPromo} className="min-w-[140px]">
                      Применить
                    </Button>
                  </div>

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground mb-2">Доступные промокоды для тестирования:</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {PROMO_CODES.map(promo => (
                        <div key={promo.code} className="flex items-center gap-2 text-foreground">
                          <code className="bg-background px-2 py-1 rounded border">{promo.code}</code>
                          <span className="text-muted-foreground">- {promo.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button onClick={handlePrev} variant="outline" size="lg">
                  <ChevronLeft className="mr-2 size-4" />
                  Назад
                </Button>
                <Button onClick={handleNext} size="lg" className="min-w-[180px]">
                  Далее
                  <ChevronRight className="ml-2 size-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Шаг 4: Оплата */}
        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-6 text-primary" />
                Оплата
              </CardTitle>
              <CardDescription>Проверьте детали заказа и завершите оплату</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Сводка заказа */}
              <div className="p-5 bg-muted rounded-lg space-y-3">
                <h4 className="text-foreground">Детали заказа</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Участник:</span>
                    <span className="text-foreground">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Тариф:</span>
                    <span className="text-foreground">{selectedTariff.name}</span>
                  </div>
                  {formData.participants > 1 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Количество участников:</span>
                      <span className="text-foreground">{formData.participants}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Базовая стоимость:</span>
                    <span className="text-foreground">{basePrice.toFixed(2)} ₸</span>
                  </div>
                  {appliedPromo && discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Скидка ({appliedPromo.code}):</span>
                      <span>-{discount.toFixed(2)} ₸</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span>Итого к оплате:</span>
                    <span className="text-primary">{finalPrice.toFixed(2)} ₸</span>
                  </div>
                </div>
              </div>

              {/* Форма оплаты */}
              {!showPaymentForm ? (
                <div className="p-4 bg-primary-light border border-primary/20 rounded-lg">
                  <p className="text-foreground">
                    <strong>Эмуляция платежной системы:</strong> Нажмите кнопку ниже для перехода к оплате. 
                    В реальной системе здесь будет интеграция с платежным шлюзом (Kaspi, Halyk Bank и т.д.).
                  </p>
                  <Button 
                    onClick={() => setShowPaymentForm(true)} 
                    className="w-full mt-4" 
                    size="lg"
                  >
                    Перейти к оплате
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-5 border-2 border-primary/20 rounded-lg bg-background">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-foreground">Данные банковской карты</h4>
                    <div className="flex gap-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Номер карты *</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, ''); // Удаляем все кроме цифр
                        
                        // Ограничиваем длину (максимум 16 цифр)
                        if (value.length > 16) {
                          value = value.slice(0, 16);
                        }
                        
                        // Форматируем номер карты (каждые 4 цифры через пробел)
                        let formatted = '';
                        for (let i = 0; i < value.length; i++) {
                          if (i > 0 && i % 4 === 0) {
                            formatted += ' ';
                          }
                          formatted += value[i];
                        }
                        
                        setPaymentData({ ...paymentData, cardNumber: formatted });
                      }}
                      maxLength={19}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Имя на карте *</Label>
                    <Input
                      id="cardName"
                      placeholder="IVAN IVANOV"
                      value={paymentData.cardName}
                      onChange={(e) => {
                        // Разрешаем только латинские буквы и пробелы
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
                        setPaymentData({ ...paymentData, cardName: value });
                      }}
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Срок действия *</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, ''); // Удаляем все кроме цифр
                          
                          // Ограничиваем длину (максимум 4 цифры)
                          if (value.length > 4) {
                            value = value.slice(0, 4);
                          }
                          
                          // Форматируем с автоматической вставкой "/"
                          let formatted = '';
                          if (value.length >= 2) {
                            formatted = value.slice(0, 2) + '/' + value.slice(2);
                          } else {
                            formatted = value;
                          }
                          
                          setPaymentData({ ...paymentData, expiryDate: formatted });
                        }}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        value={paymentData.cvv}
                        onChange={(e) => {
                          // Разрешаем только цифры, максимум 3
                          const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                          setPaymentData({ ...paymentData, cvv: value });
                        }}
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handlePayment} 
                    className="w-full mt-4" 
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Обработка платежа...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 size-4" />
                        Оплатить {finalPrice.toFixed(2)} ₸
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button onClick={handlePrev} variant="outline" size="lg" disabled={isProcessing}>
                  <ChevronLeft className="mr-2 size-4" />
                  Назад
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}