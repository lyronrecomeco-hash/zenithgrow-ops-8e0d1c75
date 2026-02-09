import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const mockInvoices = [
  { id: 'NF-001', client: 'Maria Silva', value: 4200, date: '08/02/2026', status: 'Emitida' },
  { id: 'NF-002', client: 'João Santos', value: 8900, date: '07/02/2026', status: 'Emitida' },
  { id: 'NF-003', client: 'Ana Costa', value: 3100, date: '05/02/2026', status: 'Emitida' },
  { id: 'NF-004', client: 'Pedro Lima', value: 12500, date: '03/02/2026', status: 'Pendente' },
];

export default function Invoices() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notas Fiscais</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestão de notas fiscais</p>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-border/50 bg-card/80 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">NÚMERO</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">CLIENTE</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">VALOR</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">DATA</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">STATUS</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">AÇÕES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInvoices.map(inv => (
                  <TableRow key={inv.id} className="border-border/30 hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-mono text-sm font-medium">{inv.id}</TableCell>
                    <TableCell className="text-sm">{inv.client}</TableCell>
                    <TableCell className="text-sm font-bold">R$ {inv.value.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{inv.date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={inv.status === 'Emitida' ? 'bg-success/10 text-success border-success/20 text-xs' : 'bg-warning/10 text-warning border-warning/20 text-xs'}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Download className="w-4 h-4" />
                      </Button>
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
