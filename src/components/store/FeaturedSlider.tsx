import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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

interface FeaturedSliderProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export default function FeaturedSlider({ products, onProductSelect }: FeaturedSliderProps) {
  const [current, setCurrent] = useState(0);
  const featured = products.filter((p) => p.stock > 0 && p.image_url).slice(0, 10);

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
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" />
            Destaques
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">
            Produtos em Destaque
          </h3>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl glass-card p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center cursor-pointer"
                onClick={() => onProductSelect(product)}
              >
                <div className="w-full sm:w-48 md:w-56 aspect-square rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden shrink-0">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2 min-w-0 w-full">
                  {product.brand && (
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {product.brand}
                    </span>
                  )}
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-foreground line-clamp-2 break-words">
                    {product.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">Cód: {product.code}</p>
                  {product.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words">
                      {product.description}
                    </p>
                  )}
                  <p className="text-xl md:text-2xl font-bold text-primary">
                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {featured.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-1 md:-left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass-card-strong flex items-center justify-center text-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="absolute right-1 md:-right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass-card-strong flex items-center justify-center text-foreground hover:text-primary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex justify-center gap-1.5 mt-4">
                {featured.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === current ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
