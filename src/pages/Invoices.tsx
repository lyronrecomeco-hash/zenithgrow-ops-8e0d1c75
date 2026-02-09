import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Eye, X, Printer, FileText, Building2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InvoiceItem {
  product: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  client: string;
  clientDoc: string;
  clientAddress: string;
  value: number;
  date: string;
  status: string;
  paymentMethod: string;
  installments: string;
  items: InvoiceItem[];
}

const mockInvoices: Invoice[] = [
  {
    id: 'NF-001', client: 'Maria Silva', clientDoc: '123.456.789-00', clientAddress: 'Rua das Flores, 123 - Centro, São Paulo/SP',
    value: 4200, date: '08/02/2026', status: 'Emitida', paymentMethod: 'Cartão 3x', installments: '3x R$ 1.400,00',
    items: [
      { product: 'Notebook Dell Inspiron i7', qty: 1, unitPrice: 4200, total: 4200 },
    ]
  },
  {
    id: 'NF-002', client: 'João Santos', clientDoc: '987.654.321-00', clientAddress: 'Av. Paulista, 1000 - Bela Vista, São Paulo/SP',
    value: 8900, date: '07/02/2026', status: 'Emitida', paymentMethod: 'Boleto 6x', installments: '6x R$ 1.483,33',
    items: [
      { product: 'iPhone 15 Pro 256GB', qty: 1, unitPrice: 7400, total: 7400 },
      { product: 'Capa de Proteção iPhone', qty: 1, unitPrice: 150, total: 150 },
      { product: 'Película Premium', qty: 2, unitPrice: 75, total: 150 },
      { product: 'Carregador MagSafe', qty: 1, unitPrice: 1200, total: 1200 },
    ]
  },
  {
    id: 'NF-003', client: 'Ana Costa', clientDoc: '456.789.123-00', clientAddress: 'Rua da Paz, 456 - Jardim, Campinas/SP',
    value: 3100, date: '05/02/2026', status: 'Emitida', paymentMethod: 'À Vista (PIX)', installments: '1x R$ 3.100,00',
    items: [
      { product: 'Air Fryer Philips Walita XXL', qty: 1, unitPrice: 3100, total: 3100 },
    ]
  },
  {
    id: 'NF-004', client: 'Pedro Lima', clientDoc: '321.654.987-00', clientAddress: 'Av. Brasil, 789 - Centro, Curitiba/PR',
    value: 12500, date: '03/02/2026', status: 'Pendente', paymentMethod: 'Cartão 10x', installments: '10x R$ 1.250,00',
    items: [
      { product: 'TV Samsung 55" 4K QLED', qty: 1, unitPrice: 5000, total: 5000 },
      { product: 'Soundbar Samsung HW-Q990D', qty: 1, unitPrice: 4500, total: 4500 },
      { product: 'Console PS5 Digital', qty: 1, unitPrice: 3000, total: 3000 },
    ]
  },
];

export default function Invoices() {
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notas Fiscais</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestão e visualização de notas fiscais</p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="glass-card overflow-hidden">
          <div className="px-2 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
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
                  <TableRow key={inv.id} className="border-border/20 hover:bg-muted/20 transition-colors">
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
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setPreviewInvoice(inv)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.div>

      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {previewInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreviewInvoice(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
              style={{ background: 'hsl(220, 20%, 12%)', border: '1px solid hsl(0 0% 100% / 0.1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'hsl(0 0% 100% / 0.08)' }}>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-sm">Preview — {previewInvoice.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Printer className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewInvoice(null)}><X className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Invoice Content */}
              <div className="p-8 space-y-6 text-sm" style={{ background: 'hsl(220, 15%, 14%)' }}>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-primary mb-1">NOTA FISCAL</h2>
                    <p className="text-muted-foreground text-xs">Documento fiscal de venda</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-lg">{previewInvoice.id}</p>
                    <p className="text-xs text-muted-foreground">{previewInvoice.date}</p>
                  </div>
                </div>

                <div className="w-full h-px" style={{ background: 'hsl(0 0% 100% / 0.08)' }} />

                {/* Company + Client */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Emitente</span>
                    </div>
                    <p className="font-semibold">Store Manager Ltda</p>
                    <p className="text-xs text-muted-foreground">CNPJ: 12.345.678/0001-90</p>
                    <p className="text-xs text-muted-foreground">Rua do Comércio, 500 — Centro</p>
                    <p className="text-xs text-muted-foreground">São Paulo/SP — CEP: 01001-000</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Destinatário</span>
                    </div>
                    <p className="font-semibold">{previewInvoice.client}</p>
                    <p className="text-xs text-muted-foreground">CPF: {previewInvoice.clientDoc}</p>
                    <p className="text-xs text-muted-foreground">{previewInvoice.clientAddress}</p>
                  </div>
                </div>

                <div className="w-full h-px" style={{ background: 'hsl(0 0% 100% / 0.08)' }} />

                {/* Items Table */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Produtos / Serviços</span>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(0 0% 100% / 0.06)' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: 'hsl(0 0% 100% / 0.03)' }}>
                          <th className="text-left p-3 text-xs font-semibold text-muted-foreground">PRODUTO</th>
                          <th className="text-center p-3 text-xs font-semibold text-muted-foreground">QTD</th>
                          <th className="text-right p-3 text-xs font-semibold text-muted-foreground">UNIT.</th>
                          <th className="text-right p-3 text-xs font-semibold text-muted-foreground">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewInvoice.items.map((item, i) => (
                          <tr key={i} style={{ borderTop: '1px solid hsl(0 0% 100% / 0.04)' }}>
                            <td className="p-3 font-medium">{item.product}</td>
                            <td className="p-3 text-center text-muted-foreground">{item.qty}</td>
                            <td className="p-3 text-right text-muted-foreground">R$ {item.unitPrice.toLocaleString('pt-BR')}</td>
                            <td className="p-3 text-right font-bold">R$ {item.total.toLocaleString('pt-BR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="w-full h-px" style={{ background: 'hsl(0 0% 100% / 0.08)' }} />

                {/* Payment + Total */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pagamento</span>
                    <p className="text-sm">{previewInvoice.paymentMethod}</p>
                    <p className="text-xs text-muted-foreground">{previewInvoice.installments}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Valor Total</span>
                    <p className="text-3xl font-bold text-primary">R$ {previewInvoice.value.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 text-center" style={{ borderTop: '1px solid hsl(0 0% 100% / 0.06)' }}>
                  <p className="text-[10px] text-muted-foreground">
                    Documento gerado automaticamente pelo sistema Store Manager — {previewInvoice.date}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
