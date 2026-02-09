import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Store, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { setCompanyName } = useCompany();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState({ name: 'Minha Loja', cnpj: '', address: '', phone: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => { loadCompany(); }, []);

  const loadCompany = async () => {
    const { data } = await supabase.from('company_settings').select('*').limit(1).maybeSingle();
    if (data) {
      setCompany({ name: data.name, cnpj: data.cnpj || '', address: data.address || '', phone: data.phone || '', email: data.email || '' });
    }
  };

  const saveCompany = async () => {
    setLoading(true);
    const { data: existing } = await supabase.from('company_settings').select('id').limit(1).maybeSingle();
    if (existing) {
      await supabase.from('company_settings').update(company).eq('id', existing.id);
    } else {
      await supabase.from('company_settings').insert(company);
    }
    setCompanyName(company.name);
    toast({ title: 'Dados da empresa salvos!' });
    setLoading(false);
  };

  const updatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Senhas não conferem', variant: 'destructive' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: 'Senha deve ter no mínimo 6 caracteres', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
    if (error) {
      toast({ title: 'Erro ao atualizar senha', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Senha atualizada com sucesso!' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-base mt-1">Configurações do sistema e dados da empresa</p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              Dados da Empresa
            </CardTitle>
            <p className="text-sm text-muted-foreground">Esses dados aparecem nas notas fiscais</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Nome da Empresa</Label><Input value={company.name} onChange={e => setCompany(f => ({ ...f, name: e.target.value }))} className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>CNPJ</Label><Input value={company.cnpj} onChange={e => setCompany(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0000-00" className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>Endereço</Label><Input value={company.address} onChange={e => setCompany(f => ({ ...f, address: e.target.value }))} className="bg-secondary/50" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Telefone</Label><Input value={company.phone} onChange={e => setCompany(f => ({ ...f, phone: e.target.value }))} className="bg-secondary/50" /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={company.email} onChange={e => setCompany(f => ({ ...f, email: e.target.value }))} className="bg-secondary/50" /></div>
            </div>
            <Button className="w-full" onClick={saveCompany} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar Dados da Empresa
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Perfil do Administrador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Email</Label><Input value={user?.email || ''} disabled className="bg-secondary/50 opacity-60" /></div>
            <div className="space-y-2"><Label>Nova Senha</Label><Input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="••••••••" className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>Confirmar Senha</Label><Input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="••••••••" className="bg-secondary/50" /></div>
            <Button className="w-full" onClick={updatePassword} disabled={loading}>Atualizar Senha</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
