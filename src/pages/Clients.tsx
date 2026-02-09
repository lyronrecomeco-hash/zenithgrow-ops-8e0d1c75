import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  name: string;
  cpf_cnpj: string;
  phone: string;
  email: string;
  address: string;
  city: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: '', cpf_cnpj: '', phone: '', email: '', address: '', city: '' });
  const [salesCount, setSalesCount] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (data) setClients(data);
    
    const { data: sales } = await supabase.from('sales').select('client_id');
    if (sales) {
      const counts: Record<string, number> = {};
      sales.forEach(s => { if (s.client_id) counts[s.client_id] = (counts[s.client_id] || 0) + 1; });
      setSalesCount(counts);
    }
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf_cnpj.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditClient(null);
    setForm({ name: '', cpf_cnpj: '', phone: '', email: '', address: '', city: '' });
    setDialogOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditClient(c);
    setForm({ name: c.name, cpf_cnpj: c.cpf_cnpj, phone: c.phone, email: c.email, address: c.address, city: c.city });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    if (editClient) {
      await supabase.from('clients').update(form).eq('id', editClient.id);
      toast({ title: 'Cliente atualizado' });
    } else {
      await supabase.from('clients').insert(form);
      toast({ title: 'Cliente cadastrado' });
    }
    setDialogOpen(false);
    loadClients();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('clients').delete().eq('id', deleteId);
    toast({ title: 'Cliente removido' });
    setDeleteId(null);
    loadClients();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-base mt-1">{clients.length} clientes cadastrados</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Novo Cliente</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar clientes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border/50" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">NOME</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">CPF/CNPJ</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">TELEFONE</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">CIDADE</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">COMPRAS</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id} className="border-border/30 hover:bg-secondary/30 transition-colors">
                  <TableCell className="font-medium text-base">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">{c.name.charAt(0)}</span>
                      </div>
                      {c.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono hidden md:table-cell">{c.cpf_cnpj}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{c.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{c.city}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{salesCount[c.id] || 0}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-base">Nenhum cliente encontrado</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg">{editClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>Preencha os dados do cliente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary/50" /></div>
              <div className="space-y-2"><Label>CPF/CNPJ</Label><Input value={form.cpf_cnpj} onChange={e => setForm(f => ({ ...f, cpf_cnpj: e.target.value }))} className="bg-secondary/50" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-secondary/50" /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="bg-secondary/50" /></div>
            </div>
            <div className="space-y-2"><Label>Endereço</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>Cidade</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="bg-secondary/50" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editClient ? 'Salvar' : 'Cadastrar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
