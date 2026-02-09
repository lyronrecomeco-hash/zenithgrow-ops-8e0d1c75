import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, XCircle, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Status = 'Paga' | 'Pendente' | 'Vencida' | 'Cancelada';

const columns: { status: Status; label: string; icon: any; color: string }[] = [
  { status: 'Paga', label: 'Pagas', icon: CheckCircle2, color: 'text-success' },
  { status: 'Pendente', label: 'Pendentes', icon: Clock, color: 'text-warning' },
  { status: 'Vencida', label: 'Vencidas', icon: AlertTriangle, color: 'text-destructive' },
  { status: 'Cancelada', label: 'Canceladas', icon: XCircle, color: 'text-muted-foreground' },
];

export default function Installments() {
  const [installments, setInstallments] = useState<any[]>([]);
  const [dragItem, setDragItem] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    const { data } = await supabase
      .from('installments')
      .select('*, sales(client_id, total, payment_method, clients(name))')
      .order('due_date');
    if (data) {
      const now = new Date();
      const updated = data.map(i => {
        if (i.status === 'Pendente' && new Date(i.due_date) < now) {
          return { ...i, status: 'Vencida' as Status };
        }
        return i;
      });
      setInstallments(updated);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const updateStatus = async (id: string, newStatus: Status) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'Paga') updates.paid_date = new Date().toISOString().split('T')[0];
    await supabase.from('installments').update(updates).eq('id', id);
    toast({ title: `Pagamento marcado como ${newStatus}` });
    loadData();
  };

  const handleDragStart = (id: string) => setDragItem(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    if (dragItem) {
      updateStatus(dragItem, status);
      setDragItem(null);
    }
  };

  const getByStatus = (status: Status) => installments.filter(i => i.status === status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-primary" />
          Pagamentos
        </h1>
        <p className="text-muted-foreground text-base mt-1">Arraste os cards para alterar o status</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(col => (
          <motion.div
            key={col.status}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, col.status)}
          >
            <div className="glass-card p-4 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <col.icon className={cn("w-5 h-5", col.color)} />
                <span className="font-semibold text-base">{col.label}</span>
              </div>
              <Badge variant="secondary" className="text-xs">{getByStatus(col.status).length}</Badge>
            </div>

            <div className="space-y-3 min-h-[200px]">
              {getByStatus(col.status).map(inst => (
                <div
                  key={inst.id}
                  draggable
                  onDragStart={() => handleDragStart(inst.id)}
                  className={cn(
                    "glass-card p-4 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all",
                    dragItem === inst.id && "opacity-50 scale-95"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                      <span className="font-bold text-lg text-primary">
                        R$ {Number(inst.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {inst.installment_number}ª parcela
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <p className="font-medium">{(inst.sales as any)?.clients?.name || 'N/A'}</p>
                    <p className="text-muted-foreground">
                      Vencimento: {new Date(inst.due_date).toLocaleDateString('pt-BR')}
                    </p>
                    {inst.paid_date && (
                      <p className="text-success text-xs">Pago em: {new Date(inst.paid_date).toLocaleDateString('pt-BR')}</p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      Venda: R$ {Number((inst.sales as any)?.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {col.status !== 'Paga' && col.status !== 'Cancelada' && (
                    <Button
                      size="sm"
                      className="w-full mt-3 text-xs"
                      onClick={() => updateStatus(inst.id, 'Paga')}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Dar Baixa
                    </Button>
                  )}
                </div>
              ))}
              {getByStatus(col.status).length === 0 && (
                <div className="glass-card p-6 text-center text-muted-foreground text-sm border-dashed">
                  Nenhum pagamento
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
