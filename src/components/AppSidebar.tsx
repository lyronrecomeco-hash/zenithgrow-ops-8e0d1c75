import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, Warehouse, Users,
  ShoppingCart, DollarSign, Settings, BarChart3,
  CreditCard, Receipt, LogOut, Store, Menu
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Produtos', icon: Package, path: '/products' },
  { label: 'Categorias', icon: Tags, path: '/categories' },
  { label: 'Estoque', icon: Warehouse, path: '/stock' },
  { label: 'Clientes', icon: Users, path: '/clients' },
  { label: 'Vendas', icon: ShoppingCart, path: '/sales' },
  { label: 'Pagamentos', icon: CreditCard, path: '/installments' },
  { label: 'Financeiro', icon: DollarSign, path: '/financial' },
  { label: 'Notas Fiscais', icon: Receipt, path: '/invoices' },
  { label: 'Relatórios', icon: BarChart3, path: '/reports' },
  { label: 'Configurações', icon: Settings, path: '/settings' },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { logout, user } = useAuth();
  const { companyName } = useCompany();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-sidebar/50 backdrop-blur-xl">
      <div className="p-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-base text-foreground">{companyName}</h1>
            <p className="text-xs text-muted-foreground">Sistema ERP</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-white/5 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px] shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-primary">A</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Administrador</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-3 left-3 z-50 h-10 w-10 bg-card/60 backdrop-blur-xl border border-white/10 shadow-lg"
          onClick={() => setOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="p-0 w-72 border-white/10 bg-sidebar/60 backdrop-blur-2xl">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <aside className="w-[260px] shrink-0 hidden md:block h-screen sticky top-0 border-r border-white/8 bg-sidebar/40 backdrop-blur-xl">
      <SidebarNav />
    </aside>
  );
}
