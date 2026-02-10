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
  category_id?: string | null;
}

interface HeroBannerProps {
  companyName: string;
  products?: Product[];
  onProductSelect?: (product: Product) => void;
}

export default function HeroBanner({ companyName, products = [], onProductSelect }: HeroBannerProps) {
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

  const product = featured[current];

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-primary opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto sm:px-4 pt-0 sm:py-10 md:py-14">
        {/* Title section - hidden on mobile, shown on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-2 sm:mb-8 px-3 sm:px-0 hidden sm:block"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-3">
            <ShoppingBag className="w-3 h-3" />
            Catálogo de Produtos
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            {companyName}
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Confira nossos produtos e finalize pelo WhatsApp!
          </p>
        </motion.div>

        {/* Product slider */}
        {featured.length > 0 && product && (
          <div className="relative sm:max-w-4xl sm:mx-auto">
            {/* MOBILE: full-bleed ML style */}
            <div className="sm:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="relative cursor-pointer"
                  onClick={() => onProductSelect?.(product)}
                >
                  <div className="w-full aspect-[16/9] bg-secondary/30 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-14 h-14 text-muted-foreground/30" />
                    )}
                  </div>
                  {/* Overlay with info */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-4 pb-3 pt-10">
                    {product.brand && (
                      <span className="text-[10px] text-white/60 uppercase tracking-widest">
                        {product.brand}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-white line-clamp-1 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-2xl font-extrabold text-white mt-0.5">
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Mobile nav arrows */}
              {featured.length > 1 && (
                <>
                  <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 active:scale-95 z-10">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 active:scale-95 z-10">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Mobile dots */}
              {featured.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-2 mb-1">
                  {featured.map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-primary w-5' : 'bg-muted-foreground/30 w-1.5'}`} />
                  ))}
                </div>
              )}
            </div>

            {/* DESKTOP: glass card style */}
            <div className="hidden sm:block">
              <div className="overflow-hidden rounded-2xl glass-card">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.35 }}
                    className="cursor-pointer"
                    onClick={() => onProductSelect?.(product)}
                  >
                    <div className="flex flex-row gap-6 items-center p-5">
                      <div className="w-44 h-44 md:w-52 md:h-52 rounded-xl bg-secondary/30 flex items-center justify-center overflow-hidden shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <Package className="w-10 h-10 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        {product.brand && (
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            {product.brand}
                          </span>
                        )}
                        <h3 className="text-lg md:text-xl font-bold text-foreground line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                        <p className="text-2xl md:text-3xl font-bold text-primary leading-tight">
                          {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <span className="inline-block text-xs font-medium text-green-400">
                          Disponível
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Desktop nav arrows */}
              {featured.length > 1 && (
                <>
                  <button onClick={prev} className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass-card-strong flex items-center justify-center text-foreground hover:text-primary transition-colors z-10">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={next} className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass-card-strong flex items-center justify-center text-foreground hover:text-primary transition-colors z-10">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Desktop dots */}
              {featured.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {featured.map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-primary w-5' : 'bg-muted-foreground/30 w-1.5'}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
