import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Tags, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Category { id: number; name: string; productCount: number; subcategories: string[]; }

const initialCategories: Category[] = [
  { id: 1, name: 'Eletrônicos', productCount: 15, subcategories: ['Smartphones', 'Notebooks', 'TVs'] },
  { id: 2, name: 'Eletrodomésticos', productCount: 8, subcategories: ['Cozinha', 'Lavanderia'] },
  { id: 3, name: 'Calçados', productCount: 12, subcategories: ['Esportivos', 'Casuais', 'Social'] },
  { id: 4, name: 'Acessórios', productCount: 20, subcategories: ['Áudio', 'Wearables', 'Capas'] },
  { id: 5, name: 'Vestuário', productCount: 30, subcategories: ['Masculino', 'Feminino', 'Infantil'] },
];

export default function Categories() {
  const [categories, setCategories] = useState(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', subcategories: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const { toast } = useToast();

  const openCreate = () => { setEditId(null); setForm({ name: '', subcategories: '' }); setDialogOpen(true); };
  const openEdit = (c: Category) => { setEditId(c.id); setForm({ name: c.name, subcategories: c.subcategories.join(', ') }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name) return;
    const subs = form.subcategories.split(',').map(s => s.trim()).filter(Boolean);
    if (editId) {
      setCategories(prev => prev.map(c => c.id === editId ? { ...c, name: form.name, subcategories: subs } : c));
      toast({ title: 'Categoria atualizada' });
    } else {
      setCategories(prev => [...prev, { id: Date.now(), name: form.name, productCount: 0, subcategories: subs }]);
      toast({ title: 'Categoria criada' });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast({ title: 'Categoria removida' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground text-sm mt-1">{categories.length} categorias</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nova Categoria</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader><DialogTitle>{editId ? 'Editar' : 'Nova'} Categoria</DialogTitle><DialogDescription>Preencha os dados</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary/50" /></div>
              <div className="space-y-2"><Label>Subcategorias (separadas por vírgula)</Label><Input value={form.subcategories} onChange={e => setForm(f => ({ ...f, subcategories: e.target.value }))} placeholder="Sub1, Sub2" className="bg-secondary/50" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(c => (
          <Card key={c.id} className="border-border/50 bg-card/80 hover:bg-card transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1">{c.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{c.productCount} produtos</p>
              <div className="flex flex-wrap gap-1.5">
                {c.subcategories.map(s => (
                  <Badge key={s} variant="secondary" className="text-[11px] bg-secondary/80">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
