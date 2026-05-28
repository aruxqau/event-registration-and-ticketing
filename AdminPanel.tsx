import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Users, TrendingUp, DollarSign, Search, RefreshCw, Download, Filter, Calendar, BarChart3 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';
import type { Participant, Transaction } from '../App';

interface AdminPanelProps {
  participants: Participant[];
  transactions: Transaction[];
  onRefund: (participantId: string) => void;
}

export function AdminPanel({ participants, transactions, onRefund }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  // Статистика
  const totalParticipants = participants.length;
  const paidParticipants = participants.filter(p => p.paymentStatus === 'paid').length;
  const refundedParticipants = participants.filter(p => p.paymentStatus === 'refunded').length;
  const totalRevenue = participants
    .filter(p => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + p.finalPrice, 0);
  const totalRefunded = participants
    .filter(p => p.paymentStatus === 'refunded')
    .reduce((sum, p) => sum + p.finalPrice, 0);

  // Группировка по тарифам
  const tariffStats = participants.reduce((acc, p) => {
    if (p.paymentStatus === 'paid') {
      acc[p.tariff] = (acc[p.tariff] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Фильтрация участников
  const filteredParticipants = participants.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefundClick = (participantId: string) => {
    setSelectedParticipant(participantId);
    setRefundDialogOpen(true);
  };

  const confirmRefund = () => {
    if (selectedParticipant) {
      onRefund(selectedParticipant);
      toast.success('Возврат средств выполнен');
      setRefundDialogOpen(false);
      setSelectedParticipant(null);
    }
  };

  const handleExportReport = () => {
    try {
      // Подготовка данных участников для экспорта
      const participantsData = filteredParticipants.map((p) => ({
        'ФИО': p.fullName,
        'Email': p.email,
        'Номер билета': p.ticketNumber,
        'Тариф': p.tariff,
        'Базовая цена': p.basePrice,
        'Скидка': p.discount,
        'Финальная цена': p.finalPrice,
        'Статус': p.paymentStatus === 'paid' ? 'Оплачен' : p.paymentStatus === 'refunded' ? 'Возвращен' : 'Ожидание',
        'Дата регистрации': new Date(p.registrationDate).toLocaleDateString('ru-RU'),
      }));

      // Создание рабочей книги Excel
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(participantsData);
      
      // Установка ширины колонок
      const colWidths = [
        { wch: 20 }, // ФИО
        { wch: 25 }, // Email
        { wch: 15 }, // Номер билета
        { wch: 15 }, // Тариф
        { wch: 12 }, // Базовая цена
        { wch: 10 }, // Скидка
        { wch: 15 }, // Финальная цена
        { wch: 12 }, // Статус
        { wch: 18 }, // Дата регистрации
      ];
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Участники');

      // Экспорт транзакций в отдельный лист
      const transactionsData = transactions.map((t) => {
        const participant = participants.find(p => p.id === t.participantId);
        return {
          'ID транзакции': t.id,
          'Участник': participant?.fullName || 'Неизвестно',
          'Email': participant?.email || '',
          'Тип': t.type === 'purchase' ? 'Покупка' : 'Возврат',
          'Сумма': t.amount,
          'Статус': t.status === 'success' ? 'Успешно' : 'Ошибка',
          'Дата': new Date(t.date).toLocaleString('ru-RU'),
        };
      });

      const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
      const transactionColWidths = [
        { wch: 20 }, // ID
        { wch: 20 }, // Участник
        { wch: 25 }, // Email
        { wch: 12 }, // Тип
        { wch: 12 }, // Сумма
        { wch: 12 }, // Статус
        { wch: 20 }, // Дата
      ];
      transactionsSheet['!cols'] = transactionColWidths;

      XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Транзакции');

      // Добавление листа со статистикой
      const statsData = [
        { 'Метрика': 'Всего участников', 'Значение': totalParticipants },
        { 'Метрика': 'Оплачено', 'Значение': paidParticipants },
        { 'Метрика': 'Возвращено', 'Значение': refundedParticipants },
        { 'Метрика': 'Общая выручка (₸)', 'Значение': totalRevenue.toFixed(2) },
        { 'Метрика': 'Всего возвращено (₸)', 'Значение': totalRefunded.toFixed(2) },
        { 'Метрика': 'Средний чек (₸)', 'Значение': paidParticipants > 0 ? (totalRevenue / paidParticipants).toFixed(2) : 0 },
      ];

      const statsSheet = XLSX.utils.json_to_sheet(statsData);
      statsSheet['!cols'] = [{ wch: 25 }, { wch: 15 }];

      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Статистика');

      // Сохранение файла
      const filename = `Отчет_${new Date().toLocaleDateString('ru-RU').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, filename);

      toast.success('Отчет успешно экспортирован в Excel');
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      toast.error('Ошибка при экспорте файла');
    }
  };

  const getStatusBadge = (status: Participant['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Оплачен</Badge>;
      case 'refunded':
        return <Badge className="bg-red-500">Возвращен</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Ожидание</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Участников</CardTitle>
            <Users className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{totalParticipants}</div>
            <p className="text-gray-600">
              {paidParticipants} оплачено
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Выручка</CardTitle>
            <DollarSign className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{totalRevenue.toFixed(2)} ₸</div>
            <p className="text-gray-600">
              Общая сумма
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Возвраты</CardTitle>
            <RefreshCw className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{refundedParticipants}</div>
            <p className="text-gray-600">
              {totalRefunded.toFixed(2)} ₸
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Средний чек</CardTitle>
            <TrendingUp className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">
              {paidParticipants > 0 ? (totalRevenue / paidParticipants).toFixed(2) : 0} ₸
            </div>
            <p className="text-gray-600">
              На участника
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="participants" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="participants">Участники</TabsTrigger>
          <TabsTrigger value="transactions">Транзакции</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Список участников</CardTitle>
                  <CardDescription>
                    Управление регистрациями и билетами
                  </CardDescription>
                </div>
                <Button onClick={handleExportReport} variant="outline">
                  <Download className="mr-2 size-4" />
                  Экспорт
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Search className="size-4 text-gray-500" />
                <Input
                  placeholder="Поиск по имени, email или номеру билета..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredParticipants.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {participants.length === 0 
                    ? 'Пока нет зарегистрированных участников'
                    : 'Участники не найдены'
                  }
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ФИО</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Тариф</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParticipants.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell>
                            <div>
                              <div>{participant.fullName}</div>
                              <div className="text-gray-500">
                                {participant.ticketNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{participant.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{participant.tariff}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{participant.finalPrice.toFixed(2)} ₸</div>
                              {participant.discount > 0 && (
                                <div className="text-green-600">
                                  Скидка: {participant.discount.toFixed(2)} ₸
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(participant.paymentStatus)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(participant.registrationDate).toLocaleDateString('ru-RU')}
                          </TableCell>
                          <TableCell>
                            {participant.paymentStatus === 'paid' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRefundClick(participant.id)}
                              >
                                <RefreshCw className="mr-2 size-3" />
                                Возврат
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>История транзакций</CardTitle>
              <CardDescription>Все операции по оплате и возвратам</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  ��ранзакции отсутствуют
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID транзакции</TableHead>
                        <TableHead>Участник</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Дата</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => {
                        const participant = participants.find(
                          p => p.id === transaction.participantId
                        );
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-mono">
                              {transaction.id}
                            </TableCell>
                            <TableCell>
                              {participant?.fullName || 'Неизвестно'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={transaction.type === 'purchase' ? 'default' : 'outline'}>
                                {transaction.type === 'purchase' ? 'Покупка' : 'Возврат'}
                              </Badge>
                            </TableCell>
                            <TableCell className={transaction.type === 'refund' ? 'text-red-600' : ''}>
                              {transaction.type === 'refund' && '-'}
                              {transaction.amount.toFixed(2)} ₸
                            </TableCell>
                            <TableCell>
                              <Badge className={transaction.status === 'success' ? 'bg-green-500' : 'bg-red-500'}>
                                {transaction.status === 'success' ? 'Успешно' : 'Ошибка'}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {new Date(transaction.date).toLocaleString('ru-RU')}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Статистика по тарифам */}
      {Object.keys(tariffStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Статистика по тарифам</CardTitle>
            <CardDescription>Распределение участников по тарифным планам</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(tariffStats).map(([tariff, count]) => (
                <div key={tariff} className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-gray-900">{tariff}</span>
                  <Badge>{count} чел.</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Диалог подтверждения возврата */}
      <AlertDialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение возврата</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите выполнить возврат средств для этого участника? 
              Это действие нельзя будет отменить. Билет будет аннулирован, 
              а средства возвращены на счет покупателя.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRefund}>
              Подтвердить возврат
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}