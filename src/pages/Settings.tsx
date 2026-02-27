import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, User, Loader2, Palette, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useTheme, defaultColors, type ThemeColors } from '@/contexts/ThemeContext';
import { Slider } from '@/components/ui/slider';

function hslToHex(hsl: string): string {
  const parts = hsl.split(' ').map(s => parseFloat(s));
  if (parts.length < 3) return '#3b82f6';
  const h = parts[0], s = parts[1] / 100, l = parts[2] / 100;
  const a2 = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a2 * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const colorLabels: Record<keyof ThemeColors, string> = {
  primary: 'Cor Principal',
  accent: 'Cor de Destaque',
  background: 'Fundo',
  card: 'Cards',
  sidebar: 'Menu Lateral',
  success: 'Sucesso',
  warning: 'Alerta',
  destructive: 'Erro / Perigo',
};

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hex = hslToHex(value);
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={hex}
          onChange={e => onChange(hexToHsl(e.target.value))}
          className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
        />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hex.toUpperCase()}</p>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { setCompanyName } = useCompany();
  const { colors, setColor, resetColors } = useTheme();
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

  const handleReset = () => {
    resetColors();
    toast({ title: 'Cores restauradas para o padrão!' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-base mt-1">Configurações do sistema e dados da empresa</p>
      </div>

      <Tabs defaultValue="empresa" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="empresa" className="gap-2"><Store className="w-4 h-4" />Empresa</TabsTrigger>
          <TabsTrigger value="perfil" className="gap-2"><User className="w-4 h-4" />Perfil</TabsTrigger>
          <TabsTrigger value="cores" className="gap-2"><Palette className="w-4 h-4" />Cores</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
          </motion.div>
        </TabsContent>

        <TabsContent value="perfil">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
        </TabsContent>

        <TabsContent value="cores">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="glass-card border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      Personalização de Cores
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">As alterações são aplicadas em tempo real</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restaurar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.keys(colorLabels) as (keyof ThemeColors)[]).map(key => (
                    <ColorPicker
                      key={key}
                      label={colorLabels[key]}
                      value={colors[key]}
                      onChange={v => setColor(key, v)}
                    />
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">Pré-visualização</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Principal</Button>
                    <Button size="sm" variant="secondary">Secundário</Button>
                    <Button size="sm" variant="destructive">Erro</Button>
                    <Button size="sm" variant="outline">Outline</Button>
                    <div className="flex items-center gap-2 ml-auto">
                      <div className="w-6 h-6 rounded-full" style={{ background: `hsl(${colors.success})` }} title="Sucesso" />
                      <div className="w-6 h-6 rounded-full" style={{ background: `hsl(${colors.warning})` }} title="Alerta" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
