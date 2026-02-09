import { useEffect, useState } from 'react';
import {
  DollarSign, ShoppingCart, AlertTriangle, Clock,
  TrendingUp, TrendingDown, Package, Users, CreditCard, ArrowUpRight
} from 'lucide-react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const CHART_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(199, 89%, 48%)',
  'hsl(152, 69%, 41%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
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
  const [stats, setStats] = useState({
    totalRevenue: 0, totalSales: 0, pendingPayments: 0, lowStock: 0,
    totalClients: 0, totalProducts: 0, avgTicket: 0
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const [salesRes, clientsRes, productsRes, installmentsRes, categoriesRes] = await Promise.all([
      supabase.from('sales').select('*, sale_items(*)'),
      supabase.from('clients').select('id'),
      supabase.from('products').select('*'),
      supabase.from('installments').select('*'),
      supabase.from('categories').select('*'),
    ]);

    const sales = salesRes.data || [];
    const clients = clientsRes.data || [];
    const products = productsRes.data || [];
    const installments = installmentsRes.data || [];

    const totalRevenue = sales.reduce((a, s) => a + Number(s.total), 0);
    const pendingPayments = installments.filter(i => i.status === 'Pendente' || i.status === 'Vencida').length;
    const lowStock = products.filter(p => p.stock <= p.min_stock).length;

    setStats({
      totalRevenue,
      totalSales: sales.length,
      pendingPayments,
      lowStock,
      totalClients: clients.length,
      totalProducts: products.length,
      avgTicket: sales.length > 0 ? totalRevenue / sales.length : 0,
    });

    // Sales by month
    const monthMap: Record<string, number> = {};
    sales.forEach(s => {
      const d = new Date(s.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = (monthMap[key] || 0) + Number(s.total);
    });
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    setSalesData(Object.entries(monthMap).sort().slice(-7).map(([k, v]) => ({
      month: months[parseInt(k.split('-')[1]) - 1],
      vendas: v,
    })));

    // Category distribution
    const catMap: Record<string, number> = {};
    products.forEach(p => {
      const cat = (categoriesRes.data || []).find(c => c.id === p.category_id);
      const name = cat?.name || 'Sem Categoria';
      catMap[name] = (catMap[name] || 0) + 1;
    });
    setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

    // Top products by sales
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    sales.forEach(s => {
      (s.sale_items || []).forEach((item: any) => {
        const key = item.product_id || item.product_name;
        if (!productSales[key]) productSales[key] = { name: item.product_name, qty: 0, revenue: 0 };
        productSales[key].qty += item.quantity;
        productSales[key].revenue += Number(item.total);
      });
    });
    setTopProducts(Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
  };

  const metrics = [
    { label: 'Faturamento', value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, change: `${stats.totalSales} vendas`, up: true, icon: DollarSign, iconColor: 'text-success' },
    { label: 'Total de Vendas', value: String(stats.totalSales), change: stats.totalSales > 0 ? 'Ativo' : 'Sem vendas', up: stats.totalSales > 0, icon: ShoppingCart, iconColor: 'text-primary' },
    { label: 'Pagamentos Pendentes', value: String(stats.pendingPayments), change: `${stats.pendingPayments} pendentes`, up: false, icon: Clock, iconColor: 'text-warning' },
    { label: 'Estoque Baixo', value: `${stats.lowStock} itens`, change: stats.lowStock > 0 ? 'Atenção' : 'OK', up: stats.lowStock === 0, icon: AlertTriangle, iconColor: 'text-destructive' },
  ];

  const quickStats = [
    { label: 'Clientes Ativos', value: String(stats.totalClients), icon: Users },
    { label: 'Produtos Cadastrados', value: String(stats.totalProducts), icon: Package },
    { label: 'Ticket Médio', value: `R$ ${stats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-base mt-1">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="glass-card p-5 hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                  <m.icon className={cn("w-5 h-5", m.iconColor)} />
                </div>
                <span className={cn("text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-full", m.up ? "text-success bg-success/10" : "text-warning bg-warning/10")}>
                  {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {m.change}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight">{m.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <motion.div className="lg:col-span-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-4">Vendas por Mês</h3>
            <div className="h-[280px]">
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 13, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 13, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="vendas" name="Vendas" stroke="hsl(217, 91%, 60%)" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ r: 4, fill: 'hsl(217, 91%, 60%)' }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-base">
                  Nenhuma venda registrada ainda
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div className="lg:col-span-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-4">Produtos por Categoria</h3>
            <div className="h-[280px] flex items-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-base">
                  Cadastre produtos e categorias
                </div>
              )}
            </div>
            {categoryData.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {categoryData.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <motion.div className="lg:col-span-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Produtos Mais Vendidos</h3>
            </div>
            <div className="space-y-3">
              {topProducts.length > 0 ? topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                    <div>
                      <p className="text-base font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.qty} vendas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">R$ {p.revenue.toLocaleString('pt-BR')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground text-base py-8 text-center">Nenhuma venda registrada</p>
              )}
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
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
