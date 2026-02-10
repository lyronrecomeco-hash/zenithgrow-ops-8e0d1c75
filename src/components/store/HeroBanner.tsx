import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Package, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  image_url: string | null;
  stock: number;
  brand: string | null;
  description: string | null;
}

interface HeroBannerProps {
  companyName: string;
  products?: Product[];
  onProductSelect?: (product: Product) => void;
}

export default function HeroBanner({ companyName, products = [], onProductSelect }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const featured = products.slice(0, 8);

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

  return (
    <section className="relative overflow-hidden py-10 md:py-16">
      <div className="absolute inset-0 gradient-primary opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_70%)]" />
      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <ShoppingBag className="w-4 h-4" />
            Catálogo de Produtos
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-2 tracking-tight">
            {companyName}
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Confira nossos produtos e finalize pelo WhatsApp!
          </p>
        </motion.div>

        {featured.length > 0 && (
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl glass-card p-4 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={featured[current]?.id}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 md:gap-6 items-center cursor-pointer"
                  onClick={() => onProductSelect?.(featured[current])}
                >
                  <div className="w-full sm:w-48 md:w-56 aspect-square rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden shrink-0">
                    {featured[current]?.image_url ? (
                      <img
                        src={featured[current].image_url!}
                        alt={featured[current].name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                    {featured[current]?.brand && (
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {featured[current].brand}
                      </span>
                    )}
                    <h3 className="text-lg md:text-xl font-bold text-foreground line-clamp-2">
                      {featured[current]?.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">Cód: {featured[current]?.code}</p>
                    <p className="text-xl md:text-2xl font-bold text-primary">
                      {featured[current]?.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
        )}
      </div>
    </section>
  );
}
