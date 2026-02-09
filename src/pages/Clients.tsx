import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: number;
  name: string;
  cpfCnpj: string;
  phone: string;
  email: string;
  city: string;
  totalPurchases: number;
}

const initialClients: Client[] = [
  { id: 1, name: 'Maria Silva', cpfCnpj: '123.456.789-00', phone: '(11) 99999-1234', email: 'maria@email.com', city: 'São Paulo', totalPurchases: 3 },
  { id: 2, name: 'João Santos', cpfCnpj: '987.654.321-00', phone: '(21) 98888-5678', email: 'joao@email.com', city: 'Rio de Janeiro', totalPurchases: 7 },
  { id: 3, name: 'Ana Costa', cpfCnpj: '456.789.123-00', phone: '(31) 97777-9012', email: 'ana@email.com', city: 'Belo Horizonte', totalPurchases: 2 },
  { id: 4, name: 'Pedro Lima', cpfCnpj: '12.345.678/0001-90', phone: '(41) 96666-3456', email: 'pedro@empresa.com', city: 'Curitiba', totalPurchases: 12 },
  { id: 5, name: 'Lucia Ferreira', cpfCnpj: '321.654.987-00', phone: '(51) 95555-7890', email: 'lucia@email.com', city: 'Porto Alegre', totalPurchases: 5 },
];

export default function Clients() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: '', cpfCnpj: '', phone: '', email: '', city: '' });
  const { toast } = useToast();

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.cpfCnpj.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditClient(null);
    setForm({ name: '', cpfCnpj: '', phone: '', email: '', city: '' });
    setDialogOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditClient(c);
    setForm({ name: c.name, cpfCnpj: c.cpfCnpj, phone: c.phone, email: c.email, city: c.city });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editClient) {
      setClients(prev => prev.map(c => c.id === editClient.id ? { ...c, ...form } : c));
      toast({ title: 'Cliente atualizado' });
    } else {
      setClients(prev => [...prev, { id: Date.now(), ...form, totalPurchases: 0 }]);
      toast({ title: 'Cliente cadastrado' });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    setClients(prev => prev.filter(c => c.id !== deleteId));
    toast({ title: 'Cliente removido' });
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">{clients.length} clientes cadastrados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
              <DialogDescription>Preencha os dados do cliente</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary/50" /></div>
                <div className="space-y-2"><Label>CPF/CNPJ</Label><Input value={form.cpfCnpj} onChange={e => setForm(f => ({ ...f, cpfCnpj: e.target.value }))} className="bg-secondary/50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-secondary/50" /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="bg-secondary/50" /></div>
              </div>
              <div className="space-y-2"><Label>Cidade</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="bg-secondary/50" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>{editClient ? 'Salvar' : 'Cadastrar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar clientes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border/50" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-border/50 bg-card/80 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">NOME</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">CPF/CNPJ</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">TELEFONE</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">EMAIL</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">CIDADE</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">COMPRAS</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">AÇÕES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id} className="border-border/30 hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-medium text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">{c.name.charAt(0)}</span>
                        </div>
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono hidden md:table-cell">{c.cpfCnpj}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{c.phone}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{c.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{c.city}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{c.totalPurchases}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este cliente?</DialogDescription>
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
