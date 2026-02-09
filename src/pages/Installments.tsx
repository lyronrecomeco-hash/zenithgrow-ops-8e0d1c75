import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, XCircle, GripVertical, User, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Installment {
  id: number;
  client: string;
  description: string;
  value: number;
  dueDate: string;
  saleId: string;
  installmentNumber: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
}

const initialInstallments: Installment[] = [
  { id: 1, client: 'Maria Silva', description: 'Notebook Dell i7', value: 1400, dueDate: '10/02/2026', saleId: 'VND-001', installmentNumber: '2/3', status: 'pending' },
  { id: 2, client: 'Maria Silva', description: 'Notebook Dell i7', value: 1400, dueDate: '10/03/2026', saleId: 'VND-001', installmentNumber: '3/3', status: 'pending' },
  { id: 3, client: 'João Santos', description: 'iPhone 15 Pro', value: 1483, dueDate: '05/02/2026', saleId: 'VND-002', installmentNumber: '5/6', status: 'overdue' },
  { id: 4, client: 'João Santos', description: 'iPhone 15 Pro', value: 1483, dueDate: '05/01/2026', saleId: 'VND-002', installmentNumber: '4/6', status: 'paid' },
  { id: 5, client: 'Pedro Lima', description: 'TV Samsung 55"', value: 1250, dueDate: '15/02/2026', saleId: 'VND-003', installmentNumber: '2/4', status: 'pending' },
  { id: 6, client: 'Pedro Lima', description: 'TV Samsung 55"', value: 1250, dueDate: '15/01/2026', saleId: 'VND-003', installmentNumber: '1/4', status: 'paid' },
  { id: 7, client: 'Lucia Ferreira', description: 'Console PS5', value: 975, dueDate: '01/02/2026', saleId: 'VND-004', installmentNumber: '2/4', status: 'overdue' },
  { id: 8, client: 'Ana Costa', description: 'Air Fryer Philips', value: 3100, dueDate: '05/02/2026', saleId: 'VND-005', installmentNumber: '1/1', status: 'paid' },
  { id: 9, client: 'Pedro Lima', description: 'TV Samsung 55"', value: 1250, dueDate: '15/03/2026', saleId: 'VND-003', installmentNumber: '3/4', status: 'pending' },
  { id: 10, client: 'Lucia Ferreira', description: 'Console PS5', value: 975, dueDate: '01/01/2026', saleId: 'VND-004', installmentNumber: '1/4', status: 'cancelled' },
];

const columns = [
  { key: 'paid' as const, label: 'Pagas', icon: CheckCircle, color: 'text-success', accent: 'bg-success', accentBorder: 'border-success/30' },
  { key: 'pending' as const, label: 'Pendentes', icon: Clock, color: 'text-primary', accent: 'bg-primary', accentBorder: 'border-primary/30' },
  { key: 'overdue' as const, label: 'Vencidas', icon: AlertTriangle, color: 'text-destructive', accent: 'bg-destructive', accentBorder: 'border-destructive/30' },
  { key: 'cancelled' as const, label: 'Canceladas', icon: XCircle, color: 'text-muted-foreground', accent: 'bg-muted-foreground', accentBorder: 'border-border' },
];

export default function Installments() {
  const [installments, setInstallments] = useState(initialInstallments);
  const [draggedItem, setDraggedItem] = useState<Installment | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent, item: Installment) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id.toString());
  };

  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colKey);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: Installment['status']) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!draggedItem || draggedItem.status === newStatus) {
      setDraggedItem(null);
      return;
    }

    setInstallments(prev => prev.map(i => i.id === draggedItem.id ? { ...i, status: newStatus } : i));
    
    const statusLabels: Record<string, string> = { paid: 'Paga', pending: 'Pendente', overdue: 'Vencida', cancelled: 'Cancelada' };
    toast({ title: `Pagamento atualizado para: ${statusLabels[newStatus]}`, description: `${draggedItem.client} - R$ ${draggedItem.value.toLocaleString('pt-BR')}` });
    setDraggedItem(null);
  };

  const markAsPaid = (id: number) => {
    const item = installments.find(i => i.id === id);
    setInstallments(prev => prev.map(i => i.id === id ? { ...i, status: 'paid' as const } : i));
    toast({ title: 'Pagamento baixado com sucesso', description: item ? `${item.client} - R$ ${item.value.toLocaleString('pt-BR')}` : '' });
  };

  const totalByStatus = (status: string) => {
    return installments.filter(i => i.status === status).reduce((sum, i) => sum + i.value, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
        <p className="text-muted-foreground text-sm mt-1">Controle de pagamentos por status — arraste para atualizar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(col => {
          const items = installments.filter(i => i.status === col.key);
          const total = totalByStatus(col.key);
          return (
            <motion.div key={col.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div
                className={cn(
                  "glass-card overflow-hidden transition-all duration-200 min-h-[400px]",
                  dragOverCol === col.key && "ring-2 ring-primary/50 border-primary/30"
                )}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                {/* Column header with accent line */}
                <div className="p-4 pb-3">
                  <div className={cn("w-full h-1 rounded-full mb-4", col.accent, "opacity-40")} />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <col.icon className={cn("w-4 h-4", col.color)} />
                      <span className="text-sm font-semibold">{col.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs font-mono">{items.length}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total: R$ {total.toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Cards */}
                <div className="px-3 pb-3 space-y-2 max-h-[500px] overflow-y-auto">
                  {items.map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className={cn(
                        "p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all group",
                        "hover:scale-[1.02] hover:shadow-lg",
                        draggedItem?.id === item.id && "opacity-40 scale-95",
                        col.accentBorder
                      )}
                      style={{
                        background: 'hsl(0 0% 100% / 0.03)',
                        border: '1px solid hsl(0 0% 100% / 0.06)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{item.client}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          <span className="font-bold text-foreground">R$ {item.value.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Venc.: {item.dueDate}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-mono">{item.saleId}</span>
                          <span className="font-mono">Parcela {item.installmentNumber}</span>
                        </div>
                      </div>

                      {(col.key === 'pending' || col.key === 'overdue') && (
                        <Button
                          size="sm"
                          className="w-full h-7 text-xs rounded-lg gradient-primary border-0 hover:opacity-90"
                          onClick={(e) => { e.stopPropagation(); markAsPaid(item.id); }}
                        >
                          Dar Baixa
                        </Button>
                      )}
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-xs text-muted-foreground">Nenhum pagamento</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Arraste um item para cá</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
