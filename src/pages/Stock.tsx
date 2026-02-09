import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Warehouse, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const stockItems = [
  { id: 1, product: 'Notebook Dell Inspiron', stock: 12, min: 5, lastMove: 'Entrada +5', date: '08/02/2026' },
  { id: 2, product: 'iPhone 15 Pro Max', stock: 5, min: 3, lastMove: 'Saída -1', date: '07/02/2026' },
  { id: 3, product: 'TV Samsung 55"', stock: 8, min: 3, lastMove: 'Entrada +3', date: '06/02/2026' },
  { id: 4, product: 'Console PS5', stock: 3, min: 5, lastMove: 'Saída -2', date: '05/02/2026' },
  { id: 5, product: 'Geladeira LG', stock: 2, min: 3, lastMove: 'Saída -1', date: '04/02/2026' },
  { id: 6, product: 'Headphone Bose QC45', stock: 15, min: 5, lastMove: 'Entrada +10', date: '03/02/2026' },
  { id: 7, product: 'Air Fryer Philips', stock: 18, min: 5, lastMove: 'Entrada +8', date: '02/02/2026' },
  { id: 8, product: 'Tênis Nike Air Max', stock: 25, min: 10, lastMove: 'Entrada +15', date: '01/02/2026' },
];

export default function Stock() {
  const lowStock = stockItems.filter(s => s.stock <= s.min).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
        <p className="text-muted-foreground text-sm mt-1">Controle de movimentação</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/80"><CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Warehouse className="w-5 h-5 text-primary" /></div>
          <div><p className="text-2xl font-bold">{stockItems.reduce((a, b) => a + b.stock, 0)}</p><p className="text-xs text-muted-foreground">Total em estoque</p></div>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><ArrowUp className="w-5 h-5 text-success" /></div>
          <div><p className="text-2xl font-bold">41</p><p className="text-xs text-muted-foreground">Entradas este mês</p></div>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
          <div><p className="text-2xl font-bold">{lowStock}</p><p className="text-xs text-muted-foreground">Estoque baixo</p></div>
        </CardContent></Card>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-border/50 bg-card/80 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">PRODUTO</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">ESTOQUE</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">MÍNIMO</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">ÚLTIMA MOVIM.</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">DATA</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockItems.map(s => (
                  <TableRow key={s.id} className="border-border/30 hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-medium text-sm">{s.product}</TableCell>
                    <TableCell className="text-sm font-bold">{s.stock}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{s.min}</TableCell>
                    <TableCell className={cn("text-sm hidden md:table-cell", s.lastMove.startsWith('Entrada') ? 'text-success' : 'text-destructive')}>
                      {s.lastMove}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{s.date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("text-xs", s.stock <= s.min ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-success/10 text-success border-success/20')}>
                        {s.stock <= s.min ? 'Baixo' : 'Normal'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
