import { useState, useEffect } from 'react';
import { RegistrationFormOptimized } from './components/RegistrationFormOptimized';
import { TicketView } from './components/TicketView';
import { AdminPanel } from './components/AdminPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Ticket, Users, Settings } from 'lucide-react';

export interface Participant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  tariff: string;
  promoCode?: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'refund-requested' | 'refunded';
  ticketNumber: string;
  registrationDate: string;
  qrCode: string;
  refundRequestDate?: string;
}

export interface Transaction {
  id: string;
  participantId: string;
  type: 'purchase' | 'refund';
  amount: number;
  date: string;
  status: 'success' | 'failed';
}

export default function App() {
  // Загружаем данные из localStorage при инициализации
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('participants');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentTicket, setCurrentTicket] = useState<Participant | null>(() => {
    const saved = localStorage.getItem('currentTicket');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeTab, setActiveTab] = useState('registration');

  // Автоматически сохраняем данные при изменении
  useEffect(() => {
    localStorage.setItem('participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('currentTicket', JSON.stringify(currentTicket));
  }, [currentTicket]);

  const handleRegistrationComplete = (participant: Participant, transaction: Transaction) => {
    setParticipants(prev => [...prev, participant]);
    setTransactions(prev => [...prev, transaction]);
    setCurrentTicket(participant);
    setActiveTab('ticket');
  };

  const handleRefund = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;

    const refundTransaction: Transaction = {
      id: `TXN-${Date.now()}`,
      participantId,
      type: 'refund',
      amount: participant.finalPrice,
      date: new Date().toISOString(),
      status: 'success'
    };

    setParticipants(prev =>
      prev.map(p =>
        p.id === participantId
          ? { ...p, paymentStatus: 'refunded' as const }
          : p
      )
    );
    setTransactions(prev => [...prev, refundTransaction]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Система продажи билетов на мероприятие
          </h1>
          <p className="text-gray-600">
            Регистрация участников, выбор тарифов и генерация билетов
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="registration" className="flex items-center gap-2">
              <Ticket className="size-4" />
              <span>Регистрация</span>
            </TabsTrigger>
            <TabsTrigger value="ticket" className="flex items-center gap-2">
              <Settings className="size-4" />
              <span>Мой билет</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Users className="size-4" />
              <span>Админ-панель</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registration" className="mt-0">
            <RegistrationFormOptimized onComplete={handleRegistrationComplete} />
          </TabsContent>

          <TabsContent value="ticket" className="mt-0">
            <TicketView ticket={currentTicket} />
          </TabsContent>

          <TabsContent value="admin" className="mt-0">
            <AdminPanel
              participants={participants}
              transactions={transactions}
              onRefund={handleRefund}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}