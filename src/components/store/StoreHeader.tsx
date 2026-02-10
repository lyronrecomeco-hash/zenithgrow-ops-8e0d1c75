import { Store, Search } from 'lucide-react';

interface StoreHeaderProps {
  companyName: string;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function StoreHeader({ companyName, search, onSearchChange }: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Top row: logo + name */}
        <div className="flex items-center gap-2.5 py-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-base font-bold text-foreground truncate">{companyName}</h1>
        </div>
        {/* Search bar integrated into header like ML */}
        <div className="pb-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary/50 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
