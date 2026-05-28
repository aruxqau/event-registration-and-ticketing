import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { StepProgress } from './StepProgress';
import { Check, Tag, CreditCard, Loader2, ChevronRight, ChevronLeft, Users, Star, Zap, Crown, Calendar, User, Mail, Phone, Ticket } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Participant, Transaction } from '../App';

// Импорт утилит
import { formatPhoneNumber, formatCardNumber, formatExpiryDate, formatCardName, formatCVV, formatPrice } from '../utils/formatters';
import { validatePersonalInfo, validateTariffSelection, validatePaymentData } from '../utils/validators';
import { generateId, generateTicketNumber, generateTransactionId, generateQRCode } from '../utils/generators';

interface RegistrationFormOptimizedProps {
  onComplete: (participant: Participant, transaction: Transaction) => void;
}

// ============================================
// КОНСТАНТЫ
// ============================================

const TARIFFS = [
  {
    id: 'early-bird',
    name: 'Early Bird',
    price: 15000,
    description: 'Ранняя регистрация со скидкой',
    features: ['Скидка 30%', 'Приоритетная регистрация', 'Сувенир'],
    icon: Calendar,
    badge: 'Выгодно'
  },
  {
    id: 'standard',
    name: 'Стандарт',
    price: 25000,
    description: 'Стандартный билет',
    features: ['Полный доступ', 'Материалы мероприятия'],
    icon: Ticket,
    popular: true
  },
  {
    id: 'student',
    name: 'Студент',
    price: 18000,
    description: 'Специальная цена для студентов',
    features: ['Скидка 20%', 'Требуется студенческий'],
    icon: User,
    badge: 'Скидка'
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 45000,
    description: 'Премиум доступ',
    features: ['VIP-зона', 'Networking', 'Кейтеринг', 'Подарок'],
    icon: Crown,
    badge: 'Премиум'
  },
  {
    id: 'group',
    name: 'Групповой',
    price: 20000,
    description: 'От 3-х человек',
    features: ['Скидка от 15%', 'Групповая регистрация'],
    icon: Users,
    badge: 'От 3-х'
  }
];

const PROMO_CODES: Record<string, { discount: number; description: string }> = {
  'EARLY2024': { discount: 0.20, description: '20% скидка' },
  'STUDENT': { discount: 0.15, description: '15% скидка для студентов' },
  'VIP50': { discount: 0.10, description: '10% VIP скидка' },
  'FRIEND': { discount: 0.25, description: '25% скидка для друзей' }
};

const STEPS = [
  { id: 1, name: 'Личные данные', description: 'ФИО и контакты' },
  { id: 2, name: 'Выбор тарифа', description: 'Подберите тариф' },
  { id: 3, name: 'Промокод', description: 'Примените скидку' },
  { id: 4, name: 'Оплата', description: 'Завершите регистрацию' }
];

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export function RegistrationFormOptimized({ onComplete }: RegistrationFormOptimizedProps) {
  // Состояния формы
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    tariff: 'standard'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Промокод
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; description: string } | null>(null);
  
  // Оплата
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // ============================================
  // РАСЧЕТ ЦЕН
  // ============================================

  const selectedTariff = TARIFFS.find(t => t.id === formData.tariff)!;
  const basePrice = selectedTariff.price;
  const discount = appliedPromo ? basePrice * appliedPromo.discount : 0;
  const finalPrice = basePrice - discount;

  // ============================================
  // НАВИГАЦИЯ ПО ШАГАМ
  // ============================================

  const handleNext = () => {
    // Валидация текущего шага
    if (currentStep === 0) {
      const errors = validatePersonalInfo(formData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        toast.error('Заполните все обязательные поля');
        return;
      }
    }

    if (currentStep === 1) {
      const errors = validateTariffSelection(formData.tariff);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        toast.error('Выберите тариф');
        return;
      }
    }

    setFormErrors({});
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // ============================================
  // ПРОМОКОД
  // ============================================

  const handleApplyPromo = () => {
    const upperCode = promoCode.toUpperCase();
    const promo = PROMO_CODES[upperCode];

    if (promo) {
      setAppliedPromo({ code: upperCode, ...promo });
      toast.success(`✓ Промокод применен: ${promo.description}`);
    } else {
      toast.error('❌ Промокод не найден');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    toast.info('Промокод удален');
  };

  // ============================================
  // ОПЛАТА
  // ============================================

  const handlePayment = async () => {
    // Валидация данных карты
    const errors = validatePaymentData(paymentData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Проверьте данные карты');
      return;
    }

    setIsProcessing(true);

    // Имитация обработки платежа
    setTimeout(() => {
      // Генерируем номер билета один раз
      const ticketNumber = generateTicketNumber();
      
      // Создание участника
      const participant: Participant = {
        id: generateId(),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        tariff: selectedTariff.name,
        promoCode: appliedPromo?.code,
        basePrice,
        discount,
        finalPrice,
        paymentStatus: 'paid',
        ticketNumber: ticketNumber,
        registrationDate: new Date().toISOString(),
        qrCode: generateQRCode(ticketNumber)
      };

      // Создание транзакции
      const transaction: Transaction = {
        id: generateTransactionId(),
        participantId: participant.id,
        type: 'purchase',
        amount: finalPrice,
        date: new Date().toISOString(),
        status: 'success'
      };

      setIsProcessing(false);
      toast.success('🎉 Оплата успешно завершена!');
      onComplete(participant, transaction);
    }, 2000);
  };

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Регистрация на мероприятие</CardTitle>
          <CardDescription>
            Заполните форму для получения электронного билета
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Прогресс-бар */}
          <StepProgress steps={STEPS} currentStep={currentStep} />

          {/* ШАГ 1: Личные данные */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-foreground mb-4">Личная информация</h3>
              
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
                  className={formErrors.fullName ? 'border-destructive' : ''}
                />
                {formErrors.fullName && <p className="text-destructive">{formErrors.fullName}</p>}
              </div>

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
                  className={formErrors.email ? 'border-destructive' : ''}
                />
                {formErrors.email && <p className="text-destructive">{formErrors.email}</p>}
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
                  onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                  className={formErrors.phone ? 'border-destructive' : ''}
                  maxLength={18}
                />
                {formErrors.phone && <p className="text-destructive">{formErrors.phone}</p>}
              </div>
            </div>
          )}

          {/* ШАГ 2: Выбор тарифа */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-foreground mb-4">Выберите тариф</h3>
              
              <RadioGroup value={formData.tariff} onValueChange={(value) => setFormData({ ...formData, tariff: value })}>
                <div className="grid gap-4">
                  {TARIFFS.map((tariff) => {
                    const IconComponent = tariff.icon;
                    return (
                      <Label
                        key={tariff.id}
                        htmlFor={tariff.id}
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.tariff === tariff.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={tariff.id} id={tariff.id} className="mt-1" />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <IconComponent className="size-5 text-primary" />
                            <span className="font-medium">{tariff.name}</span>
                            {tariff.badge && <Badge variant="secondary">{tariff.badge}</Badge>}
                            {tariff.popular && <Badge className="bg-primary">Популярный</Badge>}
                          </div>
                          
                          <p className="text-muted-foreground mb-2">{tariff.description}</p>
                          
                          <ul className="space-y-1">
                            {tariff.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-foreground">
                                <Check className="size-4 text-success" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-primary">{formatPrice(tariff.price)}</div>
                        </div>
                      </Label>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* ШАГ 3: Промокод */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-foreground mb-4">Промокод (опционально)</h3>
              
              {!appliedPromo ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Введите промокод"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <Button onClick={handleApplyPromo} variant="outline">
                    <Tag className="mr-2 size-4" />
                    Применить
                  </Button>
                </div>
              ) : (
                <div className="p-4 border-2 border-success rounded-lg bg-success/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="size-5 text-success" />
                        <span className="font-medium">Промокод активирован</span>
                      </div>
                      <p className="text-muted-foreground">
                        {appliedPromo.code} - {appliedPromo.description}
                      </p>
                    </div>
                    <Button onClick={handleRemovePromo} variant="ghost" size="sm">
                      Удалить
                    </Button>
                  </div>
                </div>
              )}

              {/* Итоговая цена */}
              <div className="p-5 border-2 border-primary/20 rounded-lg bg-background">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Базовая цена:</span>
                    <span className="text-foreground">{formatPrice(basePrice)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Скидка:</span>
                      <span className="text-success">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t pt-3">
                    <span>К оплате:</span>
                    <span className="text-primary">{formatPrice(finalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ШАГ 4: Оплата */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-foreground mb-4">Оплата картой</h3>
              
              <div className="p-5 border-2 border-primary/20 rounded-lg bg-background space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Номер карты *</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, cardNumber: formatCardNumber(e.target.value) })}
                    maxLength={19}
                    className={formErrors.cardNumber ? 'border-destructive' : ''}
                  />
                  {formErrors.cardNumber && <p className="text-destructive">{formErrors.cardNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName">Имя на карте *</Label>
                  <Input
                    id="cardName"
                    placeholder="IVAN IVANOV"
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData({ ...paymentData, cardName: formatCardName(e.target.value) })}
                    className={formErrors.cardName ? 'border-destructive' : ''}
                  />
                  {formErrors.cardName && <p className="text-destructive">{formErrors.cardName}</p>}
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Срок действия *</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData({ ...paymentData, expiryDate: formatExpiryDate(e.target.value) })}
                      maxLength={5}
                      className={formErrors.expiryDate ? 'border-destructive' : ''}
                    />
                    {formErrors.expiryDate && <p className="text-destructive">{formErrors.expiryDate}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData({ ...paymentData, cvv: formatCVV(e.target.value) })}
                      maxLength={3}
                      className={formErrors.cvv ? 'border-destructive' : ''}
                    />
                    {formErrors.cvv && <p className="text-destructive">{formErrors.cvv}</p>}
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
                      Оплатить {formatPrice(finalPrice)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Навигация */}
          <div className="flex justify-between pt-4">
            <Button
              onClick={handlePrev}
              variant="outline"
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-2 size-4" />
              Назад
            </Button>

            {currentStep < STEPS.length - 1 && (
              <Button onClick={handleNext}>
                Далее
                <ChevronRight className="ml-2 size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}