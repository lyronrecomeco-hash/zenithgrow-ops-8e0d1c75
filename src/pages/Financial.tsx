import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const cashFlowData = [
  { month: 'Jan', entrada: 18000, saida: 12000 },
  { month: 'Fev', entrada: 22000, saida: 14000 },
  { month: 'Mar', entrada: 19500, saida: 11000 },
  { month: 'Abr', entrada: 25000, saida: 15000 },
  { month: 'Mai', entrada: 28000, saida: 16000 },
  { month: 'Jun', entrada: 24000, saida: 13500 },
];

const transactions = [
  { id: 1, desc: 'Venda - Maria Silva', type: 'entrada', value: 4200, date: '08/02/2026' },
  { id: 2, desc: 'Parcela paga - João Santos', type: 'entrada', value: 1483, date: '07/02/2026' },
  { id: 3, desc: 'Fornecedor - Eletrônicos SA', type: 'saida', value: 8500, date: '06/02/2026' },
  { id: 4, desc: 'Aluguel', type: 'saida', value: 3500, date: '05/02/2026' },
  { id: 5, desc: 'Venda - Ana Costa', type: 'entrada', value: 3100, date: '05/02/2026' },
  { id: 6, desc: 'Energia elétrica', type: 'saida', value: 850, date: '04/02/2026' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: R$ {p.value.toLocaleString('pt-BR')}
        </p>
      ))}
    </div>
  );
};

export default function Financial() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground text-sm mt-1">Controle financeiro da loja</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/80"><CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-success" /></div>
          <div><p className="text-2xl font-bold">R$ 47.580</p><p className="text-xs text-muted-foreground">Entradas (mês)</p></div>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-destructive" /></div>
          <div><p className="text-2xl font-bold">R$ 28.350</p><p className="text-xs text-muted-foreground">Saídas (mês)</p></div>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Wallet className="w-5 h-5 text-primary" /></div>
          <div><p className="text-2xl font-bold">R$ 19.230</p><p className="text-xs text-muted-foreground">Saldo</p></div>
        </CardContent></Card>
      </div>

      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Fluxo de Caixa</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 14%, 14%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="entrada" name="Entradas" fill="hsl(152, 69%, 41%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saida" name="Saídas" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-border/50 bg-card/80 overflow-hidden">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Movimentações Recentes</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">DESCRIÇÃO</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">TIPO</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">VALOR</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">DATA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(t => (
                  <TableRow key={t.id} className="border-border/30 hover:bg-secondary/30 transition-colors">
                    <TableCell className="text-sm font-medium">{t.desc}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={t.type === 'entrada' ? 'bg-success/10 text-success border-success/20 text-xs' : 'bg-destructive/10 text-destructive border-destructive/20 text-xs'}>
                        {t.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-sm font-bold ${t.type === 'entrada' ? 'text-success' : 'text-destructive'}`}>
                      {t.type === 'entrada' ? '+' : '-'}R$ {t.value.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{t.date}</TableCell>
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
