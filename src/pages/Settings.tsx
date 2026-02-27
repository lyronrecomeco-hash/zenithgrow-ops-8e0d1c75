import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, User, Loader2, Palette, RotateCcw, Check, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useTheme, defaultColors, type ThemeColors } from '@/contexts/ThemeContext';

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

const editableColorLabels: { key: keyof ThemeColors; label: string }[] = [
  { key: 'primary', label: 'Principal' },
  { key: 'accent', label: 'Destaque' },
  { key: 'success', label: 'Sucesso' },
  { key: 'warning', label: 'Alerta' },
  { key: 'destructive', label: 'Erro' },
];

const presets: { name: string; icon?: 'sun' | 'moon'; colors: ThemeColors }[] = [
  {
    name: 'Escuro Padrão',
    icon: 'moon',
    colors: defaultColors,
  },
  {
    name: 'Claro',
    icon: 'sun',
    colors: {
      primary: '217 91% 50%',
      accent: '199 89% 42%',
      background: '0 0% 97%',
      foreground: '220 20% 12%',
      card: '0 0% 100%',
      cardForeground: '220 20% 12%',
      sidebar: '220 15% 95%',
      sidebarForeground: '220 15% 35%',
      secondary: '220 14% 92%',
      secondaryForeground: '220 15% 25%',
      muted: '220 14% 90%',
      mutedForeground: '220 10% 45%',
      border: '220 13% 88%',
      input: '220 13% 90%',
      success: '152 69% 36%',
      warning: '38 92% 45%',
      destructive: '0 72% 48%',
    },
  },
  {
    name: 'Oceano',
    icon: 'moon',
    colors: {
      primary: '199 89% 48%',
      accent: '185 80% 45%',
      background: '210 30% 6%',
      foreground: '200 15% 93%',
      card: '210 25% 10%',
      cardForeground: '200 15% 93%',
      sidebar: '210 28% 7%',
      sidebarForeground: '200 15% 65%',
      secondary: '210 20% 14%',
      secondaryForeground: '200 15% 88%',
      muted: '210 16% 16%',
      mutedForeground: '200 12% 48%',
      border: '210 16% 14%',
      input: '210 16% 16%',
      success: '152 69% 41%',
      warning: '38 92% 50%',
      destructive: '0 72% 51%',
    },
  },
  {
    name: 'Esmeralda',
    icon: 'moon',
    colors: {
      primary: '152 69% 41%',
      accent: '168 76% 42%',
      background: '160 20% 5%',
      foreground: '150 15% 93%',
      card: '160 18% 9%',
      cardForeground: '150 15% 93%',
      sidebar: '160 22% 6%',
      sidebarForeground: '150 15% 65%',
      secondary: '160 16% 13%',
      secondaryForeground: '150 15% 88%',
      muted: '160 12% 15%',
      mutedForeground: '150 10% 48%',
      border: '160 12% 13%',
      input: '160 12% 15%',
      success: '152 69% 41%',
      warning: '38 92% 50%',
      destructive: '0 72% 51%',
    },
  },
  {
    name: 'Roxo',
    icon: 'moon',
    colors: {
      primary: '263 70% 58%',
      accent: '290 60% 50%',
      background: '260 22% 6%',
      foreground: '260 15% 93%',
      card: '260 18% 10%',
      cardForeground: '260 15% 93%',
      sidebar: '260 20% 7%',
      sidebarForeground: '260 14% 65%',
      secondary: '260 16% 14%',
      secondaryForeground: '260 14% 88%',
      muted: '260 12% 16%',
      mutedForeground: '260 10% 48%',
      border: '260 12% 14%',
      input: '260 12% 16%',
      success: '152 69% 41%',
      warning: '38 92% 50%',
      destructive: '0 72% 51%',
    },
  },
  {
    name: 'Claro Cinza',
    icon: 'sun',
    colors: {
      primary: '220 14% 35%',
      accent: '220 10% 50%',
      background: '220 10% 96%',
      foreground: '220 20% 15%',
      card: '0 0% 100%',
      cardForeground: '220 20% 15%',
      sidebar: '220 12% 93%',
      sidebarForeground: '220 12% 40%',
      secondary: '220 12% 90%',
      secondaryForeground: '220 14% 30%',
      muted: '220 10% 88%',
      mutedForeground: '220 8% 50%',
      border: '220 10% 86%',
      input: '220 10% 88%',
      success: '152 60% 36%',
      warning: '38 85% 45%',
      destructive: '0 65% 48%',
    },
  },
  {
    name: 'Rosa',
    icon: 'moon',
    colors: {
      primary: '330 80% 58%',
      accent: '340 75% 50%',
      background: '330 18% 6%',
      foreground: '330 12% 93%',
      card: '330 14% 10%',
      cardForeground: '330 12% 93%',
      sidebar: '330 16% 7%',
      sidebarForeground: '330 12% 65%',
      secondary: '330 12% 14%',
      secondaryForeground: '330 12% 88%',
      muted: '330 10% 16%',
      mutedForeground: '330 8% 48%',
      border: '330 10% 14%',
      input: '330 10% 16%',
      success: '152 69% 41%',
      warning: '38 92% 50%',
      destructive: '0 72% 51%',
    },
  },
  {
    name: 'Laranja',
    icon: 'moon',
    colors: {
      primary: '24 90% 52%',
      accent: '38 92% 50%',
      background: '20 20% 6%',
      foreground: '20 12% 93%',
      card: '20 16% 10%',
      cardForeground: '20 12% 93%',
      sidebar: '20 18% 7%',
      sidebarForeground: '20 12% 65%',
      secondary: '20 14% 14%',
      secondaryForeground: '20 12% 88%',
      muted: '20 10% 16%',
      mutedForeground: '20 8% 48%',
      border: '20 10% 14%',
      input: '20 10% 16%',
      success: '152 69% 41%',
      warning: '38 92% 50%',
      destructive: '0 72% 51%',
    },
  },
];

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hex = hslToHex(value);
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
      <input
        type="color"
        value={hex}
        onChange={e => onChange(hexToHsl(e.target.value))}
        className="w-8 h-8 rounded-md cursor-pointer border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-none">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{hex.toUpperCase()}</p>
      </div>
    </div>
  );
}

function PresetCard({ name, icon, colors, isActive, onClick }: { name: string; icon?: 'sun' | 'moon'; colors: ThemeColors; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer ${
        isActive ? 'bg-primary/15 ring-1 ring-primary/40' : 'bg-secondary/30 hover:bg-secondary/50'
      }`}
    >
      {isActive && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-primary-foreground" />
        </div>
      )}
      <div className="flex items-center gap-1">
        {icon === 'sun' ? <Sun className="w-3 h-3 text-muted-foreground" /> : <Moon className="w-3 h-3 text-muted-foreground" />}
        <div className="flex gap-0.5">
          <div className="w-4 h-4 rounded-full" style={{ background: `hsl(${colors.primary})` }} />
          <div className="w-4 h-4 rounded-full" style={{ background: `hsl(${colors.accent})` }} />
        </div>
      </div>
      <span className="text-[11px] font-medium leading-tight text-center">{name}</span>
    </button>
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

  const applyPreset = (preset: typeof presets[0]) => {
    Object.entries(preset.colors).forEach(([key, value]) => {
      setColor(key as keyof ThemeColors, value);
    });
    toast({ title: `Tema "${preset.name}" aplicado!` });
  };

  const isPresetActive = (preset: typeof presets[0]) => {
    return Object.entries(preset.colors).every(([key, value]) => colors[key as keyof ThemeColors] === value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-base mt-1">Configurações do sistema e dados da empresa</p>
      </div>

      <Tabs defaultValue="empresa" className="w-full">
        <TabsList className="w-full sm:w-auto bg-transparent border-0 p-0 gap-1">
          <TabsTrigger value="empresa" className="gap-2 data-[state=active]:bg-secondary/60 data-[state=active]:shadow-none"><Store className="w-4 h-4" />Empresa</TabsTrigger>
          <TabsTrigger value="perfil" className="gap-2 data-[state=active]:bg-secondary/60 data-[state=active]:shadow-none"><User className="w-4 h-4" />Perfil</TabsTrigger>
          <TabsTrigger value="cores" className="gap-2 data-[state=active]:bg-secondary/60 data-[state=active]:shadow-none"><Palette className="w-4 h-4" />Cores</TabsTrigger>
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
                <div className="space-y-2"><Label>Nome da Empresa</Label><Input value={company.name} onChange={e => setCompany(f => ({ ...f, name: e.target.value }))} className="bg-secondary/50 border-0" /></div>
                <div className="space-y-2"><Label>CNPJ</Label><Input value={company.cnpj} onChange={e => setCompany(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0000-00" className="bg-secondary/50 border-0" /></div>
                <div className="space-y-2"><Label>Endereço</Label><Input value={company.address} onChange={e => setCompany(f => ({ ...f, address: e.target.value }))} className="bg-secondary/50 border-0" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Telefone</Label><Input value={company.phone} onChange={e => setCompany(f => ({ ...f, phone: e.target.value }))} className="bg-secondary/50 border-0" /></div>
                  <div className="space-y-2"><Label>Email</Label><Input value={company.email} onChange={e => setCompany(f => ({ ...f, email: e.target.value }))} className="bg-secondary/50 border-0" /></div>
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
                <div className="space-y-2"><Label>Email</Label><Input value={user?.email || ''} disabled className="bg-secondary/50 opacity-60 border-0" /></div>
                <div className="space-y-2"><Label>Nova Senha</Label><Input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="••••••••" className="bg-secondary/50 border-0" /></div>
                <div className="space-y-2"><Label>Confirmar Senha</Label><Input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="••••••••" className="bg-secondary/50 border-0" /></div>
                <Button className="w-full" onClick={updatePassword} disabled={loading}>Atualizar Senha</Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="cores">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Presets */}
            <Card className="glass-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Temas Prontos
                </CardTitle>
                <p className="text-xs text-muted-foreground">Clique para aplicar instantaneamente</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {presets.map(preset => (
                    <PresetCard
                      key={preset.name}
                      name={preset.name}
                      icon={preset.icon}
                      colors={preset.colors}
                      isActive={isPresetActive(preset)}
                      onClick={() => applyPreset(preset)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Colors */}
            <Card className="glass-card border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Ajustar Cores</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Alterações em tempo real</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { resetColors(); toast({ title: 'Cores restauradas!' }); }} className="gap-1.5 text-xs h-8">
                    <RotateCcw className="w-3 h-3" />
                    Restaurar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
                  {editableColorLabels.map(({ key, label }) => (
                    <ColorPicker
                      key={key}
                      label={label}
                      value={colors[key]}
                      onChange={v => setColor(key, v)}
                    />
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-lg bg-secondary/20">
                  <p className="text-xs text-muted-foreground mb-2">Pré-visualização</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">Principal</Button>
                    <Button size="sm" variant="secondary">Secundário</Button>
                    <Button size="sm" variant="destructive">Erro</Button>
                    <Button size="sm" variant="outline">Outline</Button>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <div className="w-5 h-5 rounded-full" style={{ background: `hsl(${colors.success})` }} />
                      <div className="w-5 h-5 rounded-full" style={{ background: `hsl(${colors.warning})` }} />
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
