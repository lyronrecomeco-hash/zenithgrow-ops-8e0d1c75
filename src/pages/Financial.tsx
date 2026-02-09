import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['hsl(152, 69%, 41%)', 'hsl(217, 91%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-strong px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: R$ {Number(p.value).toLocaleString('pt-BR')}
        </p>
      ))}
    </div>
  );
};

export default function Financial() {
  const [stats, setStats] = useState({ totalIn: 0, totalPending: 0, balance: 0, paidCount: 0, pendingCount: 0 });
  const [flowData, setFlowData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);

  useEffect(() => { loadFinancial(); }, []);

  const loadFinancial = async () => {
    const [installmentsRes, salesRes] = await Promise.all([
      supabase.from('installments').select('*'),
      supabase.from('sales').select('*'),
    ]);

    const installments = installmentsRes.data || [];
    const paid = installments.filter(i => i.status === 'Paga');
    const pending = installments.filter(i => i.status === 'Pendente' || i.status === 'Vencida');

    const totalIn = paid.reduce((a, i) => a + Number(i.amount), 0);
    const totalPending = pending.reduce((a, i) => a + Number(i.amount), 0);

    setStats({
      totalIn,
      totalPending,
      balance: totalIn,
      paidCount: paid.length,
      pendingCount: pending.length,
    });

    const monthMap: Record<string, { entradas: number }> = {};
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    paid.forEach(i => {
      const d = new Date(i.paid_date || i.due_date);
      const key = months[d.getMonth()];
      if (!monthMap[key]) monthMap[key] = { entradas: 0 };
      monthMap[key].entradas += Number(i.amount);
    });
    setFlowData(Object.entries(monthMap).map(([month, vals]) => ({ month, ...vals })));

    const methodMap: Record<string, number> = {};
    (salesRes.data || []).forEach(s => {
      const method = s.payment_method || 'Outros';
      methodMap[method] = (methodMap[method] || 0) + Number(s.total);
    });
    setDistributionData(Object.entries(methodMap).map(([name, value]) => ({ name, value })));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground text-base mt-1">Visão financeira do negócio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Recebido', value: stats.totalIn, icon: TrendingUp, color: 'text-success', sub: `${stats.paidCount} pagamentos` },
          { label: 'Pendente', value: stats.totalPending, icon: TrendingDown, color: 'text-warning', sub: `${stats.pendingCount} parcelas` },
          { label: 'Saldo', value: stats.balance, icon: DollarSign, color: 'text-primary', sub: 'Acumulado' },
          { label: 'Vendas Totais', value: stats.totalIn + stats.totalPending, icon: ArrowUpRight, color: 'text-accent', sub: 'Faturamento' },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <m.icon className={cn("w-5 h-5", m.color)} />
                </div>
                <p className="text-sm text-muted-foreground">{m.label}</p>
              </div>
              <p className="text-2xl font-bold">R$ {m.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-muted-foreground mt-1">{m.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <motion.div className="lg:col-span-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-4">Fluxo de Caixa</h3>
            <div className="h-[300px]">
              {flowData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={flowData}>
                    <defs>
                      <linearGradient id="entGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(152, 69%, 41%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(152, 69%, 41%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 13, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 13, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="entradas" name="Entradas" stroke="hsl(152, 69%, 41%)" strokeWidth={2.5} fill="url(#entGrad)" dot={{ r: 4, fill: 'hsl(152, 69%, 41%)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-base">Sem dados financeiros</div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div className="lg:col-span-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-4">Por Forma de Pagamento</h3>
            <div className="h-[300px] flex items-center">
              {distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {distributionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-base">Sem dados</div>
              )}
            </div>
            {distributionData.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {distributionData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {d.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
