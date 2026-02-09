import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  code: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  category: string;
}

const initialProducts: Product[] = [
  { id: 1, code: 'DELL-001', name: 'Notebook Dell Inspiron 15', brand: 'Dell', price: 4200, stock: 12, category: 'Eletrônicos' },
  { id: 2, code: 'APPL-002', name: 'iPhone 15 Pro Max', brand: 'Apple', price: 8900, stock: 5, category: 'Eletrônicos' },
  { id: 3, code: 'SAMS-003', name: 'TV Samsung 55" 4K', brand: 'Samsung', price: 3100, stock: 8, category: 'Eletrônicos' },
  { id: 4, code: 'NIKE-004', name: 'Tênis Nike Air Max', brand: 'Nike', price: 899, stock: 25, category: 'Calçados' },
  { id: 5, code: 'SONY-005', name: 'Console PlayStation 5', brand: 'Sony', price: 3900, stock: 3, category: 'Eletrônicos' },
  { id: 6, code: 'LG-006', name: 'Geladeira LG Frost Free', brand: 'LG', price: 4500, stock: 2, category: 'Eletrodomésticos' },
  { id: 7, code: 'BOSE-007', name: 'Headphone Bose QC45', brand: 'Bose', price: 2200, stock: 15, category: 'Acessórios' },
  { id: 8, code: 'PHIL-008', name: 'Air Fryer Philips', brand: 'Philips', price: 650, stock: 18, category: 'Eletrodomésticos' },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', brand: '', price: '', code: '', category: '', description: '' });
  const { toast } = useToast();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', brand: '', price: '', code: '', category: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, brand: p.brand, price: String(p.price), code: p.code, category: p.category, description: '' });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (editProduct) {
      setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, name: form.name, brand: form.brand, price: Number(form.price), code: form.code, category: form.category } : p));
      toast({ title: 'Produto atualizado', description: `${form.name} foi atualizado com sucesso.` });
    } else {
      const newProduct: Product = {
        id: Date.now(),
        code: form.code || `${form.brand.substring(0, 4).toUpperCase()}-${String(products.length + 1).padStart(3, '0')}`,
        name: form.name,
        brand: form.brand,
        price: Number(form.price),
        stock: 0,
        category: form.category,
      };
      setProducts(prev => [...prev, newProduct]);
      toast({ title: 'Produto criado', description: `${form.name} foi adicionado com sucesso.` });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    setProducts(prev => prev.filter(p => p.id !== deleteId));
    toast({ title: 'Produto removido', description: 'O produto foi excluído com sucesso.' });
    setDeleteId(null);
  };

  const generateCode = () => {
    const prefix = form.brand ? form.brand.substring(0, 4).toUpperCase() : 'PROD';
    const num = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    setForm(f => ({ ...f, code: `${prefix}-${num}` }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} produtos cadastrados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              <DialogDescription>Preencha os dados do produto</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do produto" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Marca" className="bg-secondary/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Código</Label>
                  <div className="flex gap-2">
                    <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="AUTO" className="bg-secondary/50" />
                    <Button variant="outline" size="icon" onClick={generateCode} type="button" className="shrink-0">
                      <Package className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ex: Eletrônicos" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição do produto..." className="bg-secondary/50 min-h-[80px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>{editProduct ? 'Salvar' : 'Criar Produto'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-secondary/50 border-border/50"
        />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Card className="border-border/50 bg-card/80 overflow-hidden">
          <CardContent className="p-0">
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
                    <TableCell className="font-medium text-sm">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{p.brand}</TableCell>
                    <TableCell className="text-sm font-medium">R$ {p.price.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={p.stock <= 5 ? 'destructive' : 'secondary'} className={cn("text-xs", p.stock <= 5 ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-secondary text-secondary-foreground')}>
                        {p.stock} un.
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{p.category}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(p)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(p.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.</DialogDescription>
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
