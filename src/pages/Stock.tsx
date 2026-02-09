import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Warehouse, ArrowUp, AlertTriangle, Plus, Package, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Stock() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product_id: '', type: 'Entrada', quantity: '' });
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [p, m] = await Promise.all([
      supabase.from('products').select('*, categories(name)').order('name'),
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

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">Controle de movimentação</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" />Nova Movimentação</Button>
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

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar no estoque..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border/50" />
      </div>

      {/* Stock Cards Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="glass-card overflow-hidden">
            <div className="relative w-full h-32 bg-secondary/30">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}
              <Badge
                variant="secondary"
                className={cn(
                  "absolute top-2 right-2 text-xs font-bold",
                  p.stock <= p.min_stock
                    ? 'bg-destructive/90 text-destructive-foreground border-0'
                    : 'bg-success/90 text-white border-0'
                )}
              >
                {p.stock <= p.min_stock ? 'Baixo' : 'Normal'}
              </Badge>
            </div>
            <div className="p-4 space-y-2">
              <p className="font-semibold text-base truncate">{p.name}</p>
              {(p.categories as any)?.name && (
                <p className="text-xs text-muted-foreground">{(p.categories as any).name}</p>
              )}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-2xl font-bold">{p.stock}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">em estoque</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Mín: {p.min_stock}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full glass-card p-12 text-center text-muted-foreground text-base">Nenhum produto encontrado</div>
        )}
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md glass-card-strong border-border/30">
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
