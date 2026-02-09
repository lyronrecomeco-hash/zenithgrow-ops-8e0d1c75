import {
  DollarSign, ShoppingCart, AlertTriangle, Clock,
  TrendingUp, TrendingDown, Package, Users, CreditCard, ArrowUpRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const metrics = [
  { label: 'Faturamento Mensal', value: 'R$ 47.580', change: '+12.5%', up: true, icon: DollarSign, iconColor: 'text-success' },
  { label: 'Total de Vendas', value: '156', change: '+8.2%', up: true, icon: ShoppingCart, iconColor: 'text-primary' },
  { label: 'Pagamentos Pendentes', value: '23', change: '5 vencidas', up: false, icon: Clock, iconColor: 'text-warning' },
  { label: 'Estoque Baixo', value: '7 itens', change: 'Atenção', up: false, icon: AlertTriangle, iconColor: 'text-destructive' },
];

const salesData = [
  { month: 'Jan', vendas: 12400 },
  { month: 'Fev', vendas: 15800 },
  { month: 'Mar', vendas: 13200 },
  { month: 'Abr', vendas: 18900 },
  { month: 'Mai', vendas: 22100 },
  { month: 'Jun', vendas: 19500 },
  { month: 'Jul', vendas: 24300 },
];

const categoryData = [
  { name: 'Eletrônicos', value: 35 },
  { name: 'Vestuário', value: 25 },
  { name: 'Acessórios', value: 20 },
  { name: 'Calçados', value: 12 },
  { name: 'Outros', value: 8 },
];

const CHART_COLORS = [
  'hsl(260, 80%, 60%)',
  'hsl(199, 89%, 48%)',
  'hsl(152, 69%, 41%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
];

const topProducts = [
  { name: 'iPhone 15 Pro', sales: 42, revenue: 'R$ 167.580' },
  { name: 'Notebook Dell i7', sales: 28, revenue: 'R$ 117.600' },
  { name: 'TV Samsung 55"', sales: 19, revenue: 'R$ 58.900' },
  { name: 'Air Fryer Philips', sales: 35, revenue: 'R$ 15.750' },
  { name: 'Console PS5', sales: 15, revenue: 'R$ 58.500' },
];

const quickStats = [
  { label: 'Clientes Ativos', value: '342', icon: Users },
  { label: 'Produtos Cadastrados', value: '1.284', icon: Package },
  { label: 'Ticket Médio', value: 'R$ 305', icon: CreditCard },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-strong px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? `R$ ${p.value.toLocaleString('pt-BR')}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <div className="glass-card p-5 hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                  <m.icon className={cn("w-5 h-5", m.iconColor)} />
                </div>
                <span className={cn(
                  "text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-full",
                  m.up ? "text-success bg-success/10" : "text-warning bg-warning/10"
                )}>
                  {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {m.change}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <motion.div className="lg:col-span-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4">Vendas por Mês</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(260, 80%, 60%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(260, 80%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="vendas" name="Vendas" stroke="hsl(260, 80%, 60%)" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ r: 4, fill: 'hsl(260, 80%, 60%)' }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div className="lg:col-span-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4">Vendas por Categoria</h3>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {categoryData.map((c, i) => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  {c.name}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Products + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <motion.div className="lg:col-span-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Produtos Mais Vendidos</h3>
              <span className="text-xs text-muted-foreground">Este mês</span>
            </div>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sales} vendas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{p.revenue}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div className="lg:col-span-3 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          {quickStats.map((stat) => (
            <div key={stat.label} className="glass-card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
