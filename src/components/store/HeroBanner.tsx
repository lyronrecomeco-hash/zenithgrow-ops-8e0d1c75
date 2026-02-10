import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  image_url: string | null;
  stock: number;
  brand: string | null;
  description: string | null;
  category_id?: string | null;
}

interface HeroBannerProps {
  companyName: string;
  products?: Product[];
  onProductSelect?: (product: Product) => void;
}

export default function HeroBanner({ companyName, products = [], onProductSelect }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const featured = products.filter((p) => p.stock > 0 && p.image_url).slice(0, 8);

  const next = useCallback(() => {
    if (featured.length === 0) return;
    setCurrent((c) => (c + 1) % featured.length);
  }, [featured.length]);

  const prev = useCallback(() => {
    if (featured.length === 0) return;
    setCurrent((c) => (c - 1 + featured.length) % featured.length);
  }, [featured.length]);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, featured.length]);

  if (featured.length === 0) return null;

  const product = featured[current];

  return (
    <section className="relative bg-gradient-to-b from-primary/5 to-transparent">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-4 sm:py-6">
        <div className="relative overflow-hidden rounded-xl bg-card/40 border border-border/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 sm:gap-5 p-3 sm:p-5 cursor-pointer"
              onClick={() => onProductSelect?.(product)}
            >
              {/* Image */}
              <div className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-lg bg-secondary/30 flex items-center justify-center overflow-hidden shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Package className="w-8 h-8 text-muted-foreground/20" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                {product.brand && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                    {product.brand}
                  </span>
                )}
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-foreground line-clamp-2 leading-snug">
                  {product.name}
                </h3>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary leading-none">
                  {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-[10px] sm:text-xs text-[hsl(var(--success))]">Disponível</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows */}
          {featured.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-card/80 border border-border/30 flex items-center justify-center text-foreground hover:text-primary transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button onClick={next} className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-card/80 border border-border/30 flex items-center justify-center text-foreground hover:text-primary transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {featured.length > 1 && (
          <div className="flex justify-center gap-1 mt-2.5">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'bg-primary w-4' : 'bg-muted-foreground/20 w-1.5'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
