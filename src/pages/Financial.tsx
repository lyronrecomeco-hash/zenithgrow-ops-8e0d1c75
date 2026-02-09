import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const cashFlowData = [
  { month: 'Jan', entrada: 18000, saida: 12000, lucro: 6000 },
  { month: 'Fev', entrada: 22000, saida: 14000, lucro: 8000 },
  { month: 'Mar', entrada: 19500, saida: 11000, lucro: 8500 },
  { month: 'Abr', entrada: 25000, saida: 15000, lucro: 10000 },
  { month: 'Mai', entrada: 28000, saida: 16000, lucro: 12000 },
  { month: 'Jun', entrada: 24000, saida: 13500, lucro: 10500 },
];

const expensesBreakdown = [
  { name: 'Fornecedores', value: 45, color: 'hsl(260, 80%, 60%)' },
  { name: 'Aluguel', value: 20, color: 'hsl(199, 89%, 48%)' },
  { name: 'Salários', value: 22, color: 'hsl(152, 69%, 41%)' },
  { name: 'Energia/Água', value: 8, color: 'hsl(38, 92%, 50%)' },
  { name: 'Outros', value: 5, color: 'hsl(0, 72%, 51%)' },
];

const transactions = [
  { id: 1, desc: 'Venda - Maria Silva', type: 'entrada', value: 4200, date: '08/02/2026', category: 'Venda' },
  { id: 2, desc: 'Parcela paga - João Santos', type: 'entrada', value: 1483, date: '07/02/2026', category: 'Parcela' },
  { id: 3, desc: 'Fornecedor - Eletrônicos SA', type: 'saida', value: 8500, date: '06/02/2026', category: 'Fornecedor' },
  { id: 4, desc: 'Aluguel', type: 'saida', value: 3500, date: '05/02/2026', category: 'Fixo' },
  { id: 5, desc: 'Venda - Ana Costa', type: 'entrada', value: 3100, date: '05/02/2026', category: 'Venda' },
  { id: 6, desc: 'Energia elétrica', type: 'saida', value: 850, date: '04/02/2026', category: 'Fixo' },
];



const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-strong px-4 py-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-2 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <p className="text-sm font-medium">
            {p.name}: <span className="font-bold">R$ {p.value.toLocaleString('pt-BR')}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default function Financial() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground text-sm mt-1">Controle financeiro completo da loja</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-success/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ 47.580</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-success" /> Entradas (mês)
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-destructive/15 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ 28.350</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3 text-destructive" /> Saídas (mês)
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">R$ 19.230</p>
              <p className="text-xs text-muted-foreground">Saldo Líquido</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <motion.div className="lg:col-span-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4">Fluxo de Caixa</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="entradaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(152, 69%, 41%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(152, 69%, 41%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="saidaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="entrada" name="Entradas" stroke="hsl(152, 69%, 41%)" strokeWidth={2} fill="url(#entradaGrad)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="saida" name="Saídas" stroke="hsl(0, 72%, 51%)" strokeWidth={2} fill="url(#saidaGrad)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div className="lg:col-span-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4">Distribuição de Despesas</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expensesBreakdown} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {expensesBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {expensesBreakdown.map((e) => (
                <div key={e.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                  {e.name} ({e.value}%)
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transactions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="glass-card overflow-hidden">
          <div className="p-6 pb-3">
            <h3 className="text-sm font-semibold">Movimentações Recentes</h3>
          </div>
          <div className="px-2 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">DESCRIÇÃO</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">CATEGORIA</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">TIPO</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">VALOR</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">DATA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(t => (
                  <TableRow key={t.id} className="border-border/20 hover:bg-muted/20 transition-colors">
                    <TableCell className="text-sm font-medium">{t.desc}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs bg-muted/50">{t.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={t.type === 'entrada' ? 'bg-success/10 text-success border-success/20 text-xs' : 'bg-destructive/10 text-destructive border-destructive/20 text-xs'}>
                        {t.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn("text-sm font-bold", t.type === 'entrada' ? 'text-success' : 'text-destructive')}>
                      {t.type === 'entrada' ? '+' : '-'}R$ {t.value.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{t.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
