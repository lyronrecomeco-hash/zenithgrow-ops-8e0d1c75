import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ShoppingCart, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SaleItem { product_id: string; product_name: string; quantity: number; unit_price: number; total: number; }

export default function Sales() {
  const [sales, setSales] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailSale, setDetailSale] = useState<any>(null);
  const [form, setForm] = useState({ client_id: '', payment_method: 'Cartão', num_installments: 1, notes: '' });
  const [items, setItems] = useState<SaleItem[]>([]);
  const [addProductId, setAddProductId] = useState('');
  const [addQty, setAddQty] = useState(1);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [s, c, p] = await Promise.all([
      supabase.from('sales').select('*, clients(name), sale_items(*)').order('created_at', { ascending: false }),
      supabase.from('clients').select('*').order('name'),
      supabase.from('products').select('*').order('name'),
    ]);
    if (s.data) setSales(s.data);
    if (c.data) setClients(c.data);
    if (p.data) setProducts(p.data);
  };

  const addItem = () => {
    const prod = products.find(p => p.id === addProductId);
    if (!prod) return;
    const existing = items.find(i => i.product_id === prod.id);
    if (existing) {
      setItems(items.map(i => i.product_id === prod.id ? { ...i, quantity: i.quantity + addQty, total: (i.quantity + addQty) * i.unit_price } : i));
    } else {
      setItems([...items, { product_id: prod.id, product_name: prod.name, quantity: addQty, unit_price: Number(prod.price), total: addQty * Number(prod.price) }]);
    }
    setAddProductId('');
    setAddQty(1);
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const saleTotal = items.reduce((a, i) => a + i.total, 0);

  const handleCreate = async () => {
    if (!form.client_id || items.length === 0) {
      toast({ title: 'Selecione um cliente e adicione produtos', variant: 'destructive' });
      return;
    }

    const { data: sale, error } = await supabase.from('sales').insert({
      client_id: form.client_id,
      total: saleTotal,
      payment_method: form.payment_method,
      num_installments: form.num_installments,
      notes: form.notes,
    }).select().single();

    if (error || !sale) { toast({ title: 'Erro ao criar venda', variant: 'destructive' }); return; }

    // Insert sale items
    await supabase.from('sale_items').insert(items.map(i => ({ sale_id: sale.id, ...i })));

    // Generate installments
    const installmentAmount = saleTotal / form.num_installments;
    const installments = Array.from({ length: form.num_installments }, (_, idx) => {
      const due = new Date();
      due.setMonth(due.getMonth() + idx + (form.payment_method === 'À Vista' ? 0 : 1));
      return {
        sale_id: sale.id,
        installment_number: idx + 1,
        amount: Math.round(installmentAmount * 100) / 100,
        due_date: due.toISOString().split('T')[0],
        status: form.payment_method === 'À Vista' ? 'Paga' : 'Pendente',
      };
    });
    await supabase.from('installments').insert(installments);

    // Update stock
    for (const item of items) {
      if (item.product_id) {
        const prod = products.find(p => p.id === item.product_id);
        if (prod) {
          await supabase.from('products').update({ stock: Math.max(0, prod.stock - item.quantity) }).eq('id', item.product_id);
          await supabase.from('stock_movements').insert({
            product_id: item.product_id,
            type: 'Saída',
            quantity: item.quantity,
            description: `Venda #${sale.id.slice(0, 8)}`,
          });
        }
      }
    }

    // Generate invoice
    const { data: lastInvoice } = await supabase.from('invoices').select('invoice_number').order('created_at', { ascending: false }).limit(1);
    const nextNum = lastInvoice && lastInvoice.length > 0
      ? `NF-${String(parseInt(lastInvoice[0].invoice_number.replace('NF-', '')) + 1).padStart(3, '0')}`
      : 'NF-001';
    await supabase.from('invoices').insert({ sale_id: sale.id, invoice_number: nextNum });

    toast({ title: 'Venda criada com sucesso!' });
    setDialogOpen(false);
    setItems([]);
    setForm({ client_id: '', payment_method: 'Cartão', num_installments: 1, notes: '' });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground text-base mt-1">{sales.length} vendas registradas</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Nova Venda</Button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">CLIENTE</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">DATA</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">TOTAL</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">PARCELAS</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">STATUS</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map(s => (
                <TableRow key={s.id} className="border-border/30 hover:bg-secondary/30 transition-colors">
                  <TableCell className="font-medium text-base">{(s.clients as any)?.name || 'N/A'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(s.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-base font-medium">R$ {Number(s.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{s.num_installments}x</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={
                      s.status === 'Paga' ? 'bg-success/10 text-success border-success/20' :
                      s.status === 'Atrasada' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      'bg-primary/10 text-primary border-primary/20'
                    }>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailSale(s)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-base">Nenhuma venda registrada</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* New Sale Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" />Nova Venda</DialogTitle>
            <DialogDescription>Selecione o cliente, adicione produtos e configure o pagamento</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Client */}
            <div className="space-y-2">
              <Label className="text-base">Cliente *</Label>
              <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name} — {c.cpf_cnpj}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Add products */}
            <div className="space-y-3">
              <Label className="text-base">Produtos</Label>
              <div className="flex gap-2">
                <Select value={addProductId} onValueChange={setAddProductId}>
                  <SelectTrigger className="bg-secondary/50 flex-1"><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — R$ {Number(p.price).toLocaleString('pt-BR')} (Est: {p.stock})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" min={1} value={addQty} onChange={e => setAddQty(Number(e.target.value))} className="w-20 bg-secondary/50" placeholder="Qtd" />
                <Button onClick={addItem} variant="outline">Adicionar</Button>
              </div>

              {items.length > 0 && (
                <div className="glass-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs">PRODUTO</TableHead>
                        <TableHead className="text-xs text-center">QTD</TableHead>
                        <TableHead className="text-xs text-right">UNIT.</TableHead>
                        <TableHead className="text-xs text-right">TOTAL</TableHead>
                        <TableHead className="text-xs w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, idx) => (
                        <TableRow key={idx} className="border-border/20">
                          <TableCell className="text-sm">{item.product_name}</TableCell>
                          <TableCell className="text-sm text-center">{item.quantity}</TableCell>
                          <TableCell className="text-sm text-right">R$ {item.unit_price.toLocaleString('pt-BR')}</TableCell>
                          <TableCell className="text-sm text-right font-bold">R$ {item.total.toLocaleString('pt-BR')}</TableCell>
                          <TableCell><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(idx)}><Trash2 className="w-3 h-3 text-destructive" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v, num_installments: v === 'À Vista' ? 1 : f.num_installments }))}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="À Vista">À Vista (PIX/Dinheiro)</SelectItem>
                    <SelectItem value="Cartão">Cartão de Crédito</SelectItem>
                    <SelectItem value="Boleto">Boleto Bancário</SelectItem>
                    <SelectItem value="Crediário">Crediário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Parcelas</Label>
                <Input type="number" min={1} max={48} value={form.num_installments} onChange={e => setForm(f => ({ ...f, num_installments: Number(e.target.value) }))} className="bg-secondary/50" disabled={form.payment_method === 'À Vista'} />
              </div>
            </div>

            {/* Total */}
            {items.length > 0 && (
              <div className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total da Venda</p>
                  <p className="text-2xl font-bold text-primary">R$ {saleTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                {form.num_installments > 1 && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{form.num_installments}x de</p>
                    <p className="text-lg font-semibold">R$ {(saleTotal / form.num_installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={items.length === 0 || !form.client_id}>Finalizar Venda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sale Detail Dialog */}
      <Dialog open={!!detailSale} onOpenChange={() => setDetailSale(null)}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
          </DialogHeader>
          {detailSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Cliente</p><p className="font-medium">{(detailSale.clients as any)?.name}</p></div>
                <div><p className="text-muted-foreground">Data</p><p className="font-medium">{new Date(detailSale.created_at).toLocaleDateString('pt-BR')}</p></div>
                <div><p className="text-muted-foreground">Pagamento</p><p className="font-medium">{detailSale.payment_method} {detailSale.num_installments}x</p></div>
                <div><p className="text-muted-foreground">Total</p><p className="font-bold text-primary text-lg">R$ {Number(detailSale.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
              </div>
              {detailSale.sale_items?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Itens</p>
                  {detailSale.sale_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm py-1 border-b border-border/20">
                      <span>{item.product_name} x{item.quantity}</span>
                      <span className="font-medium">R$ {Number(item.total).toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
