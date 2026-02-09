import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

const mockSales = [
  { id: 1, client: 'Maria Silva', date: '08/02/2026', total: 4200, installments: 3, status: 'Em andamento' },
  { id: 2, client: 'João Santos', date: '07/02/2026', total: 8900, installments: 6, status: 'Em andamento' },
  { id: 3, client: 'Ana Costa', date: '05/02/2026', total: 3100, installments: 1, status: 'Paga' },
  { id: 4, client: 'Pedro Lima', date: '03/02/2026', total: 12500, installments: 10, status: 'Em andamento' },
  { id: 5, client: 'Lucia Ferreira', date: '01/02/2026', total: 3900, installments: 4, status: 'Atrasada' },
];

export default function Sales() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerenciamento de vendas</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nova Venda</Button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-border/50 bg-card/80 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">CLIENTE</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">DATA</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">TOTAL</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">PARCELAS</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSales.map(s => (
                  <TableRow key={s.id} className="border-border/30 hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-medium text-sm">{s.client}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.date}</TableCell>
                    <TableCell className="text-sm font-medium">R$ {s.total.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{s.installments}x</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={
                        s.status === 'Paga' ? 'bg-success/10 text-success border-success/20' :
                        s.status === 'Atrasada' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        'bg-primary/10 text-primary border-primary/20'
                      }>{s.status}</Badge>
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
