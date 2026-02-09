import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Eye, X, Printer, FileText, Building2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceDetail {
  id: string;
  invoice_number: string;
  status: string;
  created_at: string;
  sale: any;
  items: any[];
  client: any;
  company: any;
  installments: any[];
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [preview, setPreview] = useState<InvoiceDetail | null>(null);

  useEffect(() => { loadInvoices(); }, []);

  const loadInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('*, sales(*, clients(*))')
      .order('created_at', { ascending: false });
    if (data) setInvoices(data);
  };

  const openPreview = async (inv: any) => {
    const [itemsRes, companyRes, installmentsRes] = await Promise.all([
      supabase.from('sale_items').select('*').eq('sale_id', inv.sale_id),
      supabase.from('company_settings').select('*').limit(1).maybeSingle(),
      supabase.from('installments').select('*').eq('sale_id', inv.sale_id).order('installment_number'),
    ]);

    setPreview({
      id: inv.id,
      invoice_number: inv.invoice_number,
      status: inv.status,
      created_at: inv.created_at,
      sale: inv.sales,
      items: itemsRes.data || [],
      client: (inv.sales as any)?.clients || {},
      company: companyRes.data || { name: 'Minha Loja', cnpj: '', address: '', phone: '', email: '' },
      installments: installmentsRes.data || [],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notas Fiscais</h1>
        <p className="text-muted-foreground text-base mt-1">Gestão e visualização de notas fiscais</p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="glass-card overflow-hidden p-2">
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
              {invoices.map(inv => (
                <TableRow key={inv.id} className="border-border/20 hover:bg-muted/20 transition-colors">
                  <TableCell className="font-mono text-base font-medium">{inv.invoice_number}</TableCell>
                  <TableCell className="text-base">{(inv.sales as any)?.clients?.name || 'N/A'}</TableCell>
                  <TableCell className="text-base font-bold">R$ {Number((inv.sales as any)?.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{new Date(inv.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20 text-xs">{inv.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openPreview(inv)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-base">Nenhuma nota fiscal gerada. Crie uma venda primeiro.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreview(null)}
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
                  <span className="font-semibold text-base">Nota Fiscal — {preview.invoice_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Printer className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreview(null)}><X className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Invoice Content */}
              <div className="p-8 space-y-6 text-base" style={{ background: 'hsl(220, 15%, 14%)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-primary mb-1">NOTA FISCAL</h2>
                    <p className="text-muted-foreground text-sm">Documento fiscal de venda</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-xl">{preview.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">{new Date(preview.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="w-full h-px" style={{ background: 'hsl(0 0% 100% / 0.08)' }} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Emitente</span>
                    </div>
                    <p className="font-semibold">{preview.company.name}</p>
                    {preview.company.cnpj && <p className="text-sm text-muted-foreground">CNPJ: {preview.company.cnpj}</p>}
                    {preview.company.address && <p className="text-sm text-muted-foreground">{preview.company.address}</p>}
                    {preview.company.phone && <p className="text-sm text-muted-foreground">Tel: {preview.company.phone}</p>}
                    {preview.company.email && <p className="text-sm text-muted-foreground">{preview.company.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Destinatário</span>
                    </div>
                    <p className="font-semibold">{preview.client.name || 'N/A'}</p>
                    {preview.client.cpf_cnpj && <p className="text-sm text-muted-foreground">CPF/CNPJ: {preview.client.cpf_cnpj}</p>}
                    {preview.client.address && <p className="text-sm text-muted-foreground">{preview.client.address}</p>}
                    {preview.client.phone && <p className="text-sm text-muted-foreground">Tel: {preview.client.phone}</p>}
                    {preview.client.email && <p className="text-sm text-muted-foreground">{preview.client.email}</p>}
                  </div>
                </div>

                <div className="w-full h-px" style={{ background: 'hsl(0 0% 100% / 0.08)' }} />

                {/* Items */}
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
                        {preview.items.map((item, i) => (
                          <tr key={i} style={{ borderTop: '1px solid hsl(0 0% 100% / 0.04)' }}>
                            <td className="p-3 font-medium">{item.product_name}</td>
                            <td className="p-3 text-center text-muted-foreground">{item.quantity}</td>
                            <td className="p-3 text-right text-muted-foreground">R$ {Number(item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold">R$ {Number(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="w-full h-px" style={{ background: 'hsl(0 0% 100% / 0.08)' }} />

                {/* Installments */}
                {preview.installments.length > 0 && (
                  <>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Parcelas</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {preview.installments.map(inst => (
                          <div key={inst.id} className="glass-card p-3 text-center">
                            <p className="text-xs text-muted-foreground">{inst.installment_number}ª parcela</p>
                            <p className="font-bold text-sm">R$ {Number(inst.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            <p className="text-xs text-muted-foreground">{new Date(inst.due_date).toLocaleDateString('pt-BR')}</p>
                            <Badge variant="secondary" className={`text-[10px] mt-1 ${inst.status === 'Paga' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                              {inst.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-full h-px" style={{ background: 'hsl(0 0% 100% / 0.08)' }} />
                  </>
                )}

                {/* Payment + Total */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pagamento</span>
                    <p className="text-base">{preview.sale?.payment_method} — {preview.sale?.num_installments}x</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Valor Total</span>
                    <p className="text-3xl font-bold text-primary">R$ {Number(preview.sale?.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <div className="pt-4 text-center" style={{ borderTop: '1px solid hsl(0 0% 100% / 0.06)' }}>
                  <p className="text-xs text-muted-foreground">
                    Documento gerado automaticamente pelo sistema {preview.company.name} — {new Date(preview.created_at).toLocaleDateString('pt-BR')}
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
