import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StoreHeader from '@/components/store/StoreHeader';
import HeroBanner from '@/components/store/HeroBanner';
import CategoryFilter from '@/components/store/CategoryFilter';
import ProductCard from '@/components/store/ProductCard';
import StoreFooter from '@/components/store/StoreFooter';
import FloatingWhatsApp from '@/components/store/FloatingWhatsApp';

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  image_url: string | null;
  stock: number;
  brand: string | null;
  description: string | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface CompanySettings {
  name: string;
  phone: string | null;
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

const ITEMS_PER_PAGE = 12;

export default function Store() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [company, setCompany] = useState<CompanySettings>({ name: 'Loja', phone: null });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>('name-asc');
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  useEffect(() => {
    const load = async () => {
      const [prodRes, catRes, compRes] = await Promise.all([
        supabase.from('products').select('id,name,code,price,image_url,stock,brand,description,category_id'),
        supabase.from('categories').select('id,name'),
        supabase.from('company_settings').select('name,phone').limit(1).maybeSingle(),
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (compRes.data) setCompany({ name: compRes.data.name, phone: compRes.data.phone });
      setLoading(false);
    };
    load();
  }, []);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [selectedCategory, search, sort, stockFilter]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchCat = !selectedCategory || p.category_id === selectedCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || (p.brand?.toLowerCase().includes(q));
      const matchStock = stockFilter === 'all' || (stockFilter === 'available' ? p.stock > 0 : p.stock <= 0);
      return matchCat && matchSearch && matchStock;
    });

    result.sort((a, b) => {
      switch (sort) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        default: return 0;
      }
    });

    return result;
  }, [products, selectedCategory, search, sort, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background visual effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.05),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="relative z-10">
      <StoreHeader companyName={company.name} whatsappNumber={company.phone || ''} search={search} onSearchChange={setSearch} />

      <HeroBanner

        {/* Results count */}
        <p className="text-xs text-muted-foreground text-center">
          {filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          <AnimatePresence mode="popLayout">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Nenhum produto encontrado.</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-lg text-sm glass-input text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:text-primary transition-colors"
            >
              Anterior
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | 'dots')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('dots');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'dots' ? (
                    <span key={`dots-${idx}`} className="px-2 py-2 text-muted-foreground text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === item
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                          : 'glass-input text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-lg text-sm glass-input text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:text-primary transition-colors"
            >
              Próximo
            </button>
          </div>
        )}
      </main>

      <StoreFooter companyName={company.name} phone={company.phone} />
      </div>

      <FloatingWhatsApp phone={company.phone || ''} />
    </div>
  );
}
