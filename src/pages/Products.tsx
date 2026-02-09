import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({ name: '', brand: '', price: '', code: '', category_id: '', description: '' });
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [p, c] = await Promise.all([
      supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    if (p.data) setProducts(p.data);
    if (c.data) setCategories(c.data);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', brand: '', price: '', code: '', category_id: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditProduct(p);
    setForm({ name: p.name, brand: p.brand || '', price: String(p.price), code: p.code, category_id: p.category_id || '', description: p.description || '' });
    setDialogOpen(true);
  };

  const generateCode = () => {
    const prefix = form.brand ? form.brand.substring(0, 4).toUpperCase() : 'PROD';
    const num = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    setForm(f => ({ ...f, code: `${prefix}-${num}` }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    const data = {
      name: form.name,
      brand: form.brand,
      price: Number(form.price),
      code: form.code || `PROD-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
      category_id: form.category_id || null,
      description: form.description,
    };
    if (editProduct) {
      await supabase.from('products').update(data).eq('id', editProduct.id);
      toast({ title: 'Produto atualizado' });
    } else {
      await supabase.from('products').insert(data);
      toast({ title: 'Produto criado' });
    }
    setDialogOpen(false);
    loadData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('products').delete().eq('id', deleteId);
    toast({ title: 'Produto removido' });
    setDeleteId(null);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground text-base mt-1">{products.length} produtos cadastrados</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Novo Produto</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border/50" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">CÓDIGO</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">PRODUTO</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">MARCA</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">PREÇO</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">ESTOQUE</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">CATEGORIA</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="border-border/30 hover:bg-secondary/30 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.code}</TableCell>
                  <TableCell className="font-medium text-base">{p.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{p.brand}</TableCell>
                  <TableCell className="text-base font-medium">R$ {Number(p.price).toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={p.stock <= p.min_stock ? 'destructive' : 'secondary'} className={cn("text-xs", p.stock <= p.min_stock ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-secondary')}>
                      {p.stock} un.
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{(p.categories as any)?.name || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-base">Nenhum produto encontrado</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg">{editProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>Preencha os dados do produto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary/50" /></div>
              <div className="space-y-2"><Label>Marca</Label><Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="bg-secondary/50" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Preço (R$) *</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="bg-secondary/50" /></div>
              <div className="space-y-2">
                <Label>Código</Label>
                <div className="flex gap-2">
                  <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="AUTO" className="bg-secondary/50" />
                  <Button variant="outline" size="icon" onClick={generateCode} type="button" className="shrink-0"><Package className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-secondary/50 min-h-[80px]" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editProduct ? 'Salvar' : 'Criar Produto'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>Tem certeza? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
