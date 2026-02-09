import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Pencil, Trash2, Eye, DollarSign, CreditCard, Clock, ShoppingCart, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
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

interface ClientSaleData {
  totalSpent: number;
  totalSales: number;
  pendingInstallments: number;
  pendingAmount: number;
  overdueAmount: number;
  overdueCount: number;
  paidAmount: number;
  sales: any[];
  installments: any[];
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: '', cpf_cnpj: '', phone: '', email: '', address: '', city: '' });
  const [salesCount, setSalesCount] = useState<Record<string, number>>({});
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [clientData, setClientData] = useState<ClientSaleData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
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

  const loadClientDetails = async (client: Client) => {
    setDetailClient(client);
    setLoadingDetail(true);
    try {
      const { data: sales } = await supabase
        .from('sales')
        .select('*, sale_items(*), installments(*)')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      const allSales = sales || [];
      const totalSpent = allSales.reduce((a, s) => a + Number(s.total), 0);
      const allInstallments = allSales.flatMap(s => s.installments || []);
      const pending = allInstallments.filter(i => i.status === 'Pendente');
      const overdue = allInstallments.filter(i => i.status === 'Vencida' || (i.status === 'Pendente' && new Date(i.due_date) < new Date()));
      const paid = allInstallments.filter(i => i.status === 'Paga');

      setClientData({
        totalSpent,
        totalSales: allSales.length,
        pendingInstallments: pending.length,
        pendingAmount: pending.reduce((a, i) => a + Number(i.amount), 0),
        overdueAmount: overdue.reduce((a, i) => a + Number(i.amount), 0),
        overdueCount: overdue.length,
        paidAmount: paid.reduce((a, i) => a + Number(i.amount), 0),
        sales: allSales,
        installments: allInstallments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()),
      });
    } catch (err) {
      console.error(err);
    }
    setLoadingDetail(false);
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => loadClientDetails(c)}><Eye className="w-3.5 h-3.5" /></Button>
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
        <DialogContent className="sm:max-w-lg glass-card-strong border-border/30">
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

      {/* Client Details Dialog - Enhanced with Tabs */}
      <Dialog open={detailClient !== null} onOpenChange={() => { setDetailClient(null); setClientData(null); }}>
        <DialogContent className="sm:max-w-3xl glass-card-strong border-border/30 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{detailClient?.name.charAt(0)}</span>
              </div>
              <div>
                <p>{detailClient?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">
                  {detailClient?.cpf_cnpj && <span>{detailClient.cpf_cnpj}</span>}
                  {detailClient?.city && <span> · {detailClient.city}</span>}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="flex items-center gap-3 flex-wrap">
              {detailClient?.email && <span className="text-xs">📧 {detailClient.email}</span>}
              {detailClient?.phone && <span className="text-xs">📱 {detailClient.phone}</span>}
              {detailClient?.address && <span className="text-xs">📍 {detailClient.address}</span>}
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="py-12 text-center text-muted-foreground">Carregando...</div>
          ) : clientData ? (
            <div className="space-y-4 py-2">
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="glass-card p-3 text-center">
                  <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-base font-bold">R$ {clientData.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Total gasto</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <ShoppingCart className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-base font-bold">{clientData.totalSales}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Compras</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <CreditCard className="w-4 h-4 text-success mx-auto mb-1" />
                  <p className="text-base font-bold">R$ {clientData.paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Total pago</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <Clock className="w-4 h-4 text-warning mx-auto mb-1" />
                  <p className="text-base font-bold">{clientData.pendingInstallments}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Pendentes</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <AlertTriangle className="w-4 h-4 text-destructive mx-auto mb-1" />
                  <p className="text-base font-bold">R$ {clientData.overdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Em atraso</p>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="sales" className="w-full">
                <TabsList className="w-full bg-secondary/50 border border-border/30">
                  <TabsTrigger value="sales" className="flex-1 text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <ShoppingCart className="w-3.5 h-3.5" />Compras
                  </TabsTrigger>
                  <TabsTrigger value="installments" className="flex-1 text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <Calendar className="w-3.5 h-3.5" />Parcelas
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="flex-1 text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <CreditCard className="w-3.5 h-3.5" />Pagamentos
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Compras */}
                <TabsContent value="sales">
                  {clientData.sales.length > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {clientData.sales.map((sale: any) => {
                        const paidInstallments = (sale.installments || []).filter((i: any) => i.status === 'Paga').length;
                        const totalInstallments = sale.num_installments || 1;
                        return (
                          <div key={sale.id} className="glass-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold">
                                  R$ {Number(sale.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {totalInstallments > 1 ? `${totalInstallments}x de R$ ${(Number(sale.total) / totalInstallments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'À vista'}
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(sale.created_at).toLocaleDateString('pt-BR')} · {sale.payment_method || 'N/A'}
                                </p>
                              </div>
                              <Badge variant="secondary" className={cn("text-[10px]",
                                sale.status === 'Concluída' ? 'bg-success/10 text-success' :
                                sale.status === 'Pendente' ? 'bg-warning/10 text-warning' : 'bg-secondary'
                              )}>{sale.status}</Badge>
                            </div>
                            {/* Items */}
                            <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
                              {(sale.sale_items || []).map((item: any) => (
                                <Badge key={item.id} variant="secondary" className="text-[10px] bg-secondary/80">{item.product_name} ({item.quantity}x)</Badge>
                              ))}
                            </div>
                            {/* Installments progress */}
                            {totalInstallments > 1 && (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(paidInstallments / totalInstallments) * 100}%` }} />
                                </div>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{paidInstallments}/{totalInstallments} pagas</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="glass-card p-8 text-center text-muted-foreground text-sm">Nenhuma compra registrada</div>
                  )}
                </TabsContent>

                {/* Tab: Parcelas */}
                <TabsContent value="installments">
                  {clientData.installments.length > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {clientData.installments.map((inst: any) => {
                        const isOverdue = inst.status !== 'Paga' && new Date(inst.due_date) < new Date();
                        const statusLabel = inst.status === 'Paga' ? 'Paga' : isOverdue ? 'Vencida' : 'Pendente';
                        return (
                          <div key={inst.id} className="glass-card p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                                statusLabel === 'Paga' ? 'bg-success/10 text-success' :
                                statusLabel === 'Vencida' ? 'bg-destructive/10 text-destructive' :
                                'bg-warning/10 text-warning'
                              )}>
                                {inst.installment_number}ª
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold">
                                  R$ {Number(inst.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Venc: {new Date(inst.due_date).toLocaleDateString('pt-BR')}
                                  {inst.paid_date && <span className="text-success"> · Pago: {new Date(inst.paid_date).toLocaleDateString('pt-BR')}</span>}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary" className={cn("text-[10px] shrink-0",
                              statusLabel === 'Paga' ? 'bg-success/10 text-success' :
                              statusLabel === 'Vencida' ? 'bg-destructive/10 text-destructive' :
                              'bg-warning/10 text-warning'
                            )}>{statusLabel}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="glass-card p-8 text-center text-muted-foreground text-sm">Nenhuma parcela registrada</div>
                  )}
                </TabsContent>

                {/* Tab: Pagamentos (grouped by sale with payment method details) */}
                <TabsContent value="payments">
                  {clientData.sales.length > 0 ? (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {clientData.sales.map((sale: any) => {
                        const saleInstallments = (sale.installments || []).sort((a: any, b: any) => a.installment_number - b.installment_number);
                        const paidCount = saleInstallments.filter((i: any) => i.status === 'Paga').length;
                        const totalPaid = saleInstallments.filter((i: any) => i.status === 'Paga').reduce((a: number, i: any) => a + Number(i.amount), 0);
                        const totalRemaining = Number(sale.total) - totalPaid;

                        return (
                          <div key={sale.id} className="glass-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">{sale.payment_method || 'N/A'}</span>
                                <Badge variant="secondary" className="text-[10px]">
                                  {sale.num_installments > 1 ? `${sale.num_installments}x` : 'À vista'}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">{new Date(sale.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="glass-card p-2 text-center">
                                <p className="text-xs font-bold text-primary">R$ {Number(sale.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                <p className="text-[9px] text-muted-foreground uppercase">Total</p>
                              </div>
                              <div className="glass-card p-2 text-center">
                                <p className="text-xs font-bold text-success">R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                <p className="text-[9px] text-muted-foreground uppercase">Pago</p>
                              </div>
                              <div className="glass-card p-2 text-center">
                                <p className={cn("text-xs font-bold", totalRemaining > 0 ? 'text-warning' : 'text-success')}>
                                  R$ {totalRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-[9px] text-muted-foreground uppercase">Restante</p>
                              </div>
                            </div>

                            {saleInstallments.length > 1 && (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                                  <div className="h-full bg-success rounded-full transition-all" style={{ width: `${(paidCount / saleInstallments.length) * 100}%` }} />
                                </div>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{paidCount}/{saleInstallments.length}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="glass-card p-8 text-center text-muted-foreground text-sm">Nenhum pagamento registrado</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md glass-card-strong border-border/30">
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
