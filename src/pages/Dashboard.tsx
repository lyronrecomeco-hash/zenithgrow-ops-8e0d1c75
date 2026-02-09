import {
  DollarSign, ShoppingCart, AlertTriangle, Clock,
  TrendingUp, TrendingDown, Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const metrics = [
  { label: 'Faturamento Mensal', value: 'R$ 47.580', change: '+12.5%', up: true, icon: DollarSign, bg: 'bg-success/10', iconColor: 'text-success' },
  { label: 'Total de Vendas', value: '156', change: '+8.2%', up: true, icon: ShoppingCart, bg: 'bg-primary/10', iconColor: 'text-primary' },
  { label: 'Parcelas Pendentes', value: '23', change: '5 vencidas', up: false, icon: Clock, bg: 'bg-warning/10', iconColor: 'text-warning' },
  { label: 'Estoque Baixo', value: '7 itens', change: 'Atenção', up: false, icon: AlertTriangle, bg: 'bg-destructive/10', iconColor: 'text-destructive' },
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

const revenueData = [
  { month: 'Jan', entrada: 18000, saida: 12000 },
  { month: 'Fev', entrada: 22000, saida: 14000 },
  { month: 'Mar', entrada: 19500, saida: 11000 },
  { month: 'Abr', entrada: 25000, saida: 15000 },
  { month: 'Mai', entrada: 28000, saida: 16000 },
  { month: 'Jun', entrada: 24000, saida: 13500 },
];

const categoryData = [
  { name: 'Eletrônicos', value: 35 },
  { name: 'Vestuário', value: 25 },
  { name: 'Acessórios', value: 20 },
  { name: 'Calçados', value: 12 },
  { name: 'Outros', value: 8 },
];

const CHART_COLORS = [
  'hsl(213, 94%, 56%)',
  'hsl(199, 89%, 48%)',
  'hsl(152, 69%, 41%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
];

const recentSales = [
  { client: 'Maria Silva', product: 'Notebook Dell', value: 'R$ 4.200', date: 'Hoje' },
  { client: 'João Santos', product: 'iPhone 15', value: 'R$ 5.800', date: 'Hoje' },
  { client: 'Ana Costa', product: 'TV Samsung 55"', value: 'R$ 3.100', date: 'Ontem' },
  { client: 'Pedro Lima', product: 'Air Fryer', value: 'R$ 450', date: 'Ontem' },
  { client: 'Lucia Ferreira', product: 'Console PS5', value: 'R$ 3.900', date: '2 dias' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-xl">
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
            <Card className="border-border/50 bg-card/80 hover:bg-card transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", m.bg)}>
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
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Sales Chart */}
        <Card className="lg:col-span-4 border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Vendas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 14%, 14%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="vendas" name="Vendas" stroke="hsl(213, 94%, 56%)" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(213, 94%, 56%)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Pie */}
        <Card className="lg:col-span-3 border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Vendas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Revenue + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <Card className="lg:col-span-4 border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
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

        <Card className="lg:col-span-3 border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{sale.client}</p>
                      <p className="text-xs text-muted-foreground truncate">{sale.product}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold">{sale.value}</p>
                    <p className="text-xs text-muted-foreground">{sale.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
