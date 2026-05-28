import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Check, Tag, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Participant, Transaction } from '../App';

interface RegistrationFormProps {
  onComplete: (participant: Participant, transaction: Transaction) => void;
}

interface Tariff {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  color: string;
}

interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
}

const TARIFFS: Tariff[] = [
  {
    id: 'basic',
    name: 'Базовый',
    price: 3490,
    description: 'Для обычных участников',
    features: ['Доступ к основной программе', 'Материалы мероприятия', 'Сертификат участника'],
    color: 'bg-blue-500'
  },
  {
    id: 'standard',
    name: 'Стандарт',
    price: 6790,
    description: 'Расширенный пакет',
    features: ['Все из Базового', 'Доступ к мастер-классам', 'Обед включен', 'Нетворкинг-зона'],
    color: 'bg-purple-500'
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 13000,
    description: 'Премиум опыт',
    features: ['Все из Стандарта', 'VIP места', 'Встреча со спикерами', 'Подарочный набор'],
    color: 'bg-amber-500'
  }
];

const PROMO_CODES: PromoCode[] = [
  { code: 'EARLY2024', discount: 20, type: 'percentage', description: 'Ранняя регистрация' },
  { code: 'STUDENT', discount: 30, type: 'percentage', description: 'Скидка для студентов' },
  { code: 'VIP500', discount: 500, type: 'fixed', description: 'Фиксированная скидка' },
  { code: 'PARTNER', discount: 15, type: 'percentage', description: 'Партнерская скидка' }
];

export function RegistrationForm({ onComplete }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    tariff: 'basic'
  });
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedTariff = TARIFFS.find(t => t.id === formData.tariff)!;
  const basePrice = selectedTariff.price;

  let discount = 0;
  if (appliedPromo) {
    discount = appliedPromo.type === 'percentage'
      ? (basePrice * appliedPromo.discount) / 100
      : appliedPromo.discount;
  }

  const finalPrice = Math.max(0, basePrice - discount);

  const handleApplyPromo = () => {
    const promo = PROMO_CODES.find(p => p.code.toLowerCase() === promoCode.toLowerCase());
    if (promo) {
      setAppliedPromo(promo);
      toast.success(`Промокод применен: ${promo.description}`);
    } else {
      toast.error('Промокод не найден');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    setIsProcessing(true);

    // Эмуляция процесса оплаты
    await new Promise(resolve => setTimeout(resolve, 2000));

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
    toast.success('Оплата прошла успешно! Билет сгенерирован.');
    setIsProcessing(false);

    // Сброс формы
    setFormData({ fullName: '', email: '', phone: '', tariff: 'basic' });
    setPromoCode('');
    setAppliedPromo(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Выбор тарифа */}
        <Card>
          <CardHeader>
            <CardTitle>Выбор тарифа</CardTitle>
            <CardDescription>Выберите подходящий тариф для участия в мероприятии</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={formData.tariff} onValueChange={(value) => setFormData({ ...formData, tariff: value })}>
              <div className="grid gap-4 md:grid-cols-3">
                {TARIFFS.map((tariff) => (
                  <div key={tariff.id} className="relative h-full">
                    <RadioGroupItem
                      value={tariff.id}
                      id={tariff.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={tariff.id}
                      className="flex flex-col h-full rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:border-gray-300 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-900">{tariff.name}</span>
                        <Badge className={tariff.color}>{tariff.price} ₸</Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{tariff.description}</p>
                      <ul className="space-y-1 flex-1">
                        {tariff.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <Check className="size-4 text-green-600 mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Данные участника */}
        <Card>
          <CardHeader>
            <CardTitle>Данные участника</CardTitle>
            <CardDescription>Заполните информацию для регистрации</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">ФИО *</Label>
                <Input
                  id="fullName"
                  placeholder="Иванов Иван Иванович"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.ru"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Промокод */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="size-5" />
              Промокод
            </CardTitle>
            <CardDescription>
              Введите промокод для получения скид��и
              <div className="mt-2 text-gray-600">
                <p>Доступные промокоды для тестирования:</p>
                <ul className="mt-1 space-y-1">
                  {PROMO_CODES.map(promo => (
                    <li key={promo.code} className="flex gap-2">
                      <code className="bg-gray-100 px-2 py-0.5 rounded">{promo.code}</code>
                      <span>- {promo.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appliedPromo ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="text-green-900">
                    Промокод <strong>{appliedPromo.code}</strong> применен
                  </p>
                  <p className="text-green-700">{appliedPromo.description}</p>
                </div>
                <Button type="button" variant="outline" onClick={handleRemovePromo}>
                  Удалить
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="ведите промокод"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                />
                <Button type="button" variant="outline" onClick={handleApplyPromo}>
                  Применить
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Итоговая стоимость и оплата */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Оплата
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Тариф:</span>
                <span>{selectedTariff.name}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Базовая стоимость:</span>
                <span>{basePrice} ₸</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>Скидка ({appliedPromo.code}):</span>
                  <span>-{discount.toFixed(2)} ₸</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span>Итого к оплате:</span>
                  <span>{finalPrice.toFixed(2)} ₸</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900">
                <strong>Эмуляция оплаты:</strong> При нажатии кнопки "Оплатить" будет имитирован процесс оплаты. 
                В реальной системе здесь будет интеграция с платежной системой.
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
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
          </CardContent>
        </Card>
      </form>
    </div>
  );
}