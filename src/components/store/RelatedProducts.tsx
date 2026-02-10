import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Package } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
  brand: string | null;
}

interface RelatedProductsProps {
  categoryId: string | null;
  currentProductId: string;
}

export default function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!categoryId) return;
    const load = async () => {
      const { data } = await supabase
        .from('products')
        .select('id,code,name,price,image_url,stock,brand')
        .eq('category_id', categoryId)
        .neq('id', currentProductId)
        .gt('stock', 0)
        .limit(6);
      if (data) setProducts(data);
    };
    load();
  }, [categoryId, currentProductId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-6 sm:mt-10">
      <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Veja também</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/produto/${p.id}`)}
            className="bg-card border border-border/60 rounded-xl overflow-hidden cursor-pointer group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all"
          >
            <div className="aspect-[4/3] bg-secondary/30 flex items-center justify-center overflow-hidden">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              ) : (
                <Package className="w-8 h-8 text-muted-foreground/20" />
              )}
            </div>
            <div className="p-2.5 space-y-0.5 border-t border-border/40">
              <p className="text-sm sm:text-base font-extrabold text-primary">
                {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-xs text-foreground/80 line-clamp-2 font-medium">{p.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
