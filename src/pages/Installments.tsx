import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Installment {
  id: number;
  client: string;
  value: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
}

const initialInstallments: Installment[] = [
  { id: 1, client: 'Maria Silva', value: 1400, dueDate: '10/02/2026', status: 'pending' },
  { id: 2, client: 'Maria Silva', value: 1400, dueDate: '10/03/2026', status: 'pending' },
  { id: 3, client: 'João Santos', value: 1483, dueDate: '05/02/2026', status: 'overdue' },
  { id: 4, client: 'João Santos', value: 1483, dueDate: '05/01/2026', status: 'paid' },
  { id: 5, client: 'Pedro Lima', value: 1250, dueDate: '15/02/2026', status: 'pending' },
  { id: 6, client: 'Pedro Lima', value: 1250, dueDate: '15/01/2026', status: 'paid' },
  { id: 7, client: 'Lucia Ferreira', value: 975, dueDate: '01/02/2026', status: 'overdue' },
  { id: 8, client: 'Ana Costa', value: 3100, dueDate: '05/02/2026', status: 'paid' },
  { id: 9, client: 'Pedro Lima', value: 1250, dueDate: '15/03/2026', status: 'pending' },
  { id: 10, client: 'Lucia Ferreira', value: 975, dueDate: '01/01/2026', status: 'cancelled' },
];

const columns = [
  { key: 'paid' as const, label: 'Pagas', icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  { key: 'pending' as const, label: 'Pendentes', icon: Clock, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  { key: 'overdue' as const, label: 'Vencidas', icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  { key: 'cancelled' as const, label: 'Canceladas', icon: XCircle, color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-border' },
];

export default function Installments() {
  const [installments, setInstallments] = useState(initialInstallments);
  const { toast } = useToast();

  const markAsPaid = (id: number) => {
    setInstallments(prev => prev.map(i => i.id === id ? { ...i, status: 'paid' as const } : i));
    toast({ title: 'Parcela baixada com sucesso' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parcelas</h1>
        <p className="text-muted-foreground text-sm mt-1">Controle de parcelas por status</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(col => {
          const items = installments.filter(i => i.status === col.key);
          return (
            <motion.div key={col.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/50 bg-card/80">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <col.icon className={cn("w-4 h-4", col.color)} />
                    {col.label}
                    <Badge variant="secondary" className="ml-auto text-xs">{items.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className={cn("p-3 rounded-lg border", col.bg, col.border)}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.client}</span>
                      </div>
                      <p className="text-sm font-bold">R$ {item.value.toLocaleString('pt-BR')}</p>
                      <p className="text-xs text-muted-foreground mt-1">Venc.: {item.dueDate}</p>
                      {(col.key === 'pending' || col.key === 'overdue') && (
                        <Button size="sm" variant="outline" className="w-full mt-2 h-7 text-xs" onClick={() => markAsPaid(item.id)}>
                          Dar Baixa
                        </Button>
                      )}
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Nenhuma parcela</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
