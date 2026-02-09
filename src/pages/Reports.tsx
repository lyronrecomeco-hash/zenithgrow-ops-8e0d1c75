import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const reports = [
  { title: 'Relatório de Vendas', desc: 'Vendas por período, produto e cliente', icon: BarChart3 },
  { title: 'Relatório Financeiro', desc: 'Entradas, saídas e fluxo de caixa', icon: FileText },
  { title: 'Relatório de Estoque', desc: 'Movimentação e níveis de estoque', icon: FileText },
  { title: 'Relatório de Clientes', desc: 'Análise de clientes e compras', icon: FileText },
  { title: 'Relatório de Parcelas', desc: 'Status de parcelas e inadimplência', icon: FileText },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground text-sm mt-1">Gere relatórios do seu negócio</p>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(r => (
          <Card key={r.title} className="border-border/50 bg-card/80 hover:bg-card transition-colors">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <r.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{r.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">{r.desc}</p>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-3.5 h-3.5 mr-2" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
