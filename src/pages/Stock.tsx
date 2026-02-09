import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Warehouse, ArrowUp, AlertTriangle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Stock() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product_id: '', type: 'Entrada', quantity: '' });
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [p, m] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('stock_movements').select('*, products(name)').order('created_at', { ascending: false }).limit(50),
    ]);
    if (p.data) setProducts(p.data);
    if (m.data) setMovements(m.data);
  };

  const handleMovement = async () => {
    if (!form.product_id || !form.quantity) return;
    const qty = Number(form.quantity);
    const product = products.find(p => p.id === form.product_id);
    if (!product) return;

    const newStock = form.type === 'Entrada' ? product.stock + qty : Math.max(0, product.stock - qty);
    await supabase.from('products').update({ stock: newStock }).eq('id', form.product_id);
    await supabase.from('stock_movements').insert({ product_id: form.product_id, type: form.type, quantity: qty, description: `${form.type} manual` });

    toast({ title: `${form.type} registrada` });
    setDialogOpen(false);
    setForm({ product_id: '', type: 'Entrada', quantity: '' });
    loadData();
  };

  const totalStock = products.reduce((a, p) => a + p.stock, 0);
  const lowStock = products.filter(p => p.stock <= p.min_stock).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground text-base mt-1">Controle de movimentação</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Nova Movimentação</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Warehouse className="w-5 h-5 text-primary" /></div>
          <div><p className="text-2xl font-bold">{totalStock}</p><p className="text-sm text-muted-foreground">Total em estoque</p></div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><ArrowUp className="w-5 h-5 text-success" /></div>
          <div><p className="text-2xl font-bold">{movements.filter(m => m.type === 'Entrada').length}</p><p className="text-sm text-muted-foreground">Entradas recentes</p></div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
          <div><p className="text-2xl font-bold">{lowStock}</p><p className="text-sm text-muted-foreground">Estoque baixo</p></div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">PRODUTO</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">ESTOQUE</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">MÍNIMO</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id} className="border-border/30 hover:bg-secondary/30 transition-colors">
                  <TableCell className="font-medium text-base">{p.name}</TableCell>
                  <TableCell className="text-base font-bold">{p.stock}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{p.min_stock}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-xs", p.stock <= p.min_stock ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-success/10 text-success border-success/20')}>
                      {p.stock <= p.min_stock ? 'Baixo' : 'Normal'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-base">Nenhum produto cadastrado</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader><DialogTitle className="text-lg">Nova Movimentação</DialogTitle><DialogDescription>Registre entrada ou saída de estoque</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={form.product_id} onValueChange={v => setForm(f => ({ ...f, product_id: v }))}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Est: {p.stock})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Entrada">Entrada</SelectItem><SelectItem value="Saída">Saída</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Quantidade</Label><Input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="bg-secondary/50" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleMovement}>Registrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
