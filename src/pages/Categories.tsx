import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', subcategories: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [c, p] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('products').select('category_id'),
    ]);
    if (c.data) setCategories(c.data);
    if (p.data) {
      const counts: Record<string, number> = {};
      p.data.forEach(pr => { if (pr.category_id) counts[pr.category_id] = (counts[pr.category_id] || 0) + 1; });
      setProductCounts(counts);
    }
  };

  const openCreate = () => { setEditId(null); setForm({ name: '', subcategories: '' }); setDialogOpen(true); };
  const openEdit = (c: any) => { setEditId(c.id); setForm({ name: c.name, subcategories: (c.subcategories || []).join(', ') }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name) return;
    const subs = form.subcategories.split(',').map(s => s.trim()).filter(Boolean);
    if (editId) {
      await supabase.from('categories').update({ name: form.name, subcategories: subs }).eq('id', editId);
      toast({ title: 'Categoria atualizada' });
    } else {
      await supabase.from('categories').insert({ name: form.name, subcategories: subs });
      toast({ title: 'Categoria criada' });
    }
    setDialogOpen(false);
    loadData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('categories').delete().eq('id', deleteId);
    toast({ title: 'Categoria removida' });
    setDeleteId(null);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground text-base mt-1">{categories.length} categorias</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nova Categoria</Button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(c => (
          <Card key={c.id} className="glass-card border-0 hover:bg-card/60 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <h3 className="font-semibold text-base mb-1">{c.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{productCounts[c.id] || 0} produtos</p>
              <div className="flex flex-wrap gap-1.5">
                {(c.subcategories || []).map((s: string) => (
                  <Badge key={s} variant="secondary" className="text-xs bg-secondary/80">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground text-base">Nenhuma categoria cadastrada</div>
        )}
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader><DialogTitle className="text-lg">{editId ? 'Editar' : 'Nova'} Categoria</DialogTitle><DialogDescription>Preencha os dados</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>Subcategorias (separadas por vírgula)</Label><Input value={form.subcategories} onChange={e => setForm(f => ({ ...f, subcategories: e.target.value }))} placeholder="Sub1, Sub2" className="bg-secondary/50" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle><DialogDescription>Tem certeza?</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button><Button variant="destructive" onClick={handleDelete}>Excluir</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
