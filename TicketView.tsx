import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, Mail, CheckCircle2, AlertCircle, Printer, Share2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Participant } from '../App';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TicketViewProps {
  ticket: Participant | null;
}

export function TicketView({ ticket }: TicketViewProps) {
  if (!ticket) {
    return (
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="size-20 text-muted mb-6" />
          <h3 className="text-foreground mb-2">Билет не найден</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Пожалуйста, пройдите регистрацию на вкладке "Регистрация" для получения билета на мероприятие.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDownload = () => {
    const element = document.getElementById('ticket');
    if (element) {
      html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`ticket-${ticket.ticketNumber}.pdf`);
        toast.success('📄 Билет скачан в формате PDF', {
          description: `Файл: ticket-${ticket.ticketNumber}.pdf`
        });
      });
    }
  };

  const handleEmail = () => {
    toast.success('📧 Билет отправлен', {
      description: `Письмо отправлено на ${ticket.email}. Проверьте папку "Входящие" или "Спам"`
    });
  };

  const handlePrint = () => {
    window.print();
    toast.info('🖨️ Открыто окно печати');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Мой билет на мероприятие',
        text: `Билет №${ticket.ticketNumber}`,
        url: window.location.href
      }).catch((error) => {
        // Если пользователь отменил или произошла ошибка
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(ticket.ticketNumber);
          toast.success('📋 Номер билета скопирован в буфер обмена');
        }
      });
    } else {
      navigator.clipboard.writeText(ticket.ticketNumber);
      toast.success('📋 Номер билета скопирован в буфер обмена');
    }
  };

  const statusColor = ticket.paymentStatus === 'paid' 
    ? 'bg-success' 
    : ticket.paymentStatus === 'refunded' 
    ? 'bg-destructive' 
    : 'bg-warning';

  const statusText = ticket.paymentStatus === 'paid' 
    ? 'Оплачен' 
    : ticket.paymentStatus === 'refunded' 
    ? 'Возвращен' 
    : 'Ожидание оплаты';

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden shadow-xl print:shadow-none">
        <div className="bg-gradient-to-r from-primary to-purple-600 p-8 text-white print:bg-primary">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white mb-2">Электронный билет</CardTitle>
              <CardDescription className="text-white/80 font-mono">
                {ticket.ticketNumber}
              </CardDescription>
            </div>
            <Badge className={`${statusColor} text-white`}>{statusText}</Badge>
          </div>
        </div>

        <CardContent className="p-8" id="ticket">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Информация о билете */}
            <div className="space-y-5">
              <div>
                <h4 className="text-muted-foreground mb-1">Участник</h4>
                <p className="text-foreground">{ticket.fullName}</p>
              </div>

              <div>
                <h4 className="text-muted-foreground mb-1">Тариф</h4>
                <Badge variant="outline" className="text-primary border-primary">
                  {ticket.tariff}
                </Badge>
              </div>

              <div>
                <h4 className="text-muted-foreground mb-1">Email</h4>
                <p className="text-foreground">{ticket.email}</p>
              </div>

              <div>
                <h4 className="text-muted-foreground mb-1">Телефон</h4>
                <p className="text-foreground">{ticket.phone}</p>
              </div>

              {ticket.promoCode && (
                <div>
                  <h4 className="text-muted-foreground mb-1">Применен промокод</h4>
                  <Badge className="bg-success text-white">{ticket.promoCode}</Badge>
                </div>
              )}

              <div className="border-t pt-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Базовая цена:</span>
                  <span className="text-foreground">{ticket.basePrice.toFixed(2)} ₸</span>
                </div>
                {ticket.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Скидка:</span>
                    <span className="text-success">-{ticket.discount.toFixed(2)} ₸</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-3">
                  <span>Итого оплачено:</span>
                  <span className="text-primary">{ticket.finalPrice.toFixed(2)} ₸</span>
                </div>
              </div>

              <div>
                <h4 className="text-muted-foreground mb-1">Дата регистрации</h4>
                <p className="text-foreground">
                  {new Date(ticket.registrationDate).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* QR код */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-6 rounded-xl border-2 border-border shadow-md mb-4">
                <img
                  src={ticket.qrCode}
                  alt="QR код билета"
                  className="size-72"
                />
              </div>
              <p className="text-muted-foreground text-center max-w-xs">
                Предъявите этот QR-код при входе на мероприятие
              </p>
            </div>
          </div>

          {/* Действия с билетом */}
          {ticket.paymentStatus === 'paid' && (
            <div className="mt-8 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
                <Button onClick={handleDownload} variant="default" className="w-full">
                  <Download className="mr-2 size-4" />
                  PDF
                </Button>
                <Button onClick={handleEmail} variant="outline" className="w-full">
                  <Mail className="mr-2 size-4" />
                  Email
                </Button>
                <Button onClick={handlePrint} variant="outline" className="w-full">
                  <Printer className="mr-2 size-4" />
                  Печать
                </Button>
                <Button onClick={handleShare} variant="outline" className="w-full">
                  <Share2 className="mr-2 size-4" />
                  Поделиться
                </Button>
              </div>

              <div className="p-5 bg-success/10 border-2 border-success rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-6 text-success mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-success mb-2">Билет активен и готов к использованию</h4>
                    <p className="text-foreground">
                      Сохраните этот билет. Вы можете распечатать его или показать QR-код 
                      с экрана мобильного устройтва при входе на мероприятие.
                    </p>
                    <p className="text-muted-foreground mt-2">
                      📧 Копия билета отправлена на ваш email
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {ticket.paymentStatus === 'refunded' && (
            <div className="mt-8 p-5 bg-destructive/10 border-2 border-destructive rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-6 text-destructive mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-destructive mb-2">Билет возвращен</h4>
                  <p className="text-foreground">
                    Этот билет был возвращен и больше не действителен. 
                    Средства будут возвращены на ваш счет в течение 5-7 рабочих дней.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Дополнительная информация */}
      {ticket.paymentStatus === 'paid' && (
        <Card className="mt-6 print:hidden shadow-lg">
          <CardHeader>
            <CardTitle>Важная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="text-primary mt-1">•</div>
              <p className="text-foreground">
                Пожалуйста, прибудьте за 30 минут до начала мероприятия для регистрации
              </p>
            </div>
            <div className="flex gap-3">
              <div className="text-primary mt-1">•</div>
              <p className="text-foreground">
                Билет действителен только для одного человека и не подлежит передаче
              </p>
            </div>
            <div className="flex gap-3">
              <div className="text-primary mt-1">•</div>
              <p className="text-foreground">
                При воде необходимо предъявить QR-код и документ, удостоверяющий личность
              </p>
            </div>
            <div className="flex gap-3">
              <div className="text-primary mt-1">•</div>
              <p className="text-foreground">
                По вопросам обращайтесь: support@event.kz или +7 (700) 123-45-67
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}