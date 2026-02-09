import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Store, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Configurações do sistema</p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Nome da Empresa</Label><Input defaultValue="Minha Loja" className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>CNPJ</Label><Input defaultValue="12.345.678/0001-90" className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>Endereço</Label><Input defaultValue="Rua Exemplo, 123" className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input defaultValue="(11) 1234-5678" className="bg-secondary/50" /></div>
            <Button className="w-full">Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Perfil do Administrador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Nome</Label><Input defaultValue="Administrador" className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue="loja-admin@gmail.com" disabled className="bg-secondary/50 opacity-60" /></div>
            <div className="space-y-2"><Label>Nova Senha</Label><Input type="password" placeholder="••••••••" className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>Confirmar Senha</Label><Input type="password" placeholder="••••••••" className="bg-secondary/50" /></div>
            <Button className="w-full">Atualizar Perfil</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
