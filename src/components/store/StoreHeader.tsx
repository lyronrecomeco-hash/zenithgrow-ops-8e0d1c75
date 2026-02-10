import { Store } from 'lucide-react';

interface StoreHeaderProps {
  companyName: string;
}

export default function StoreHeader({ companyName }: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass-card-strong border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{companyName}</h1>
        </div>
      </div>
    </header>
  );
}
