import { motion } from 'framer-motion';
import { Package, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const inStock = product.stock > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(product)}
      className="glass-card overflow-hidden cursor-pointer group hover:border-primary/30 transition-all duration-300 flex flex-col rounded-xl"
    >
      <div className="aspect-square bg-secondary/50 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <Package className="w-10 h-10 sm:w-14 sm:h-14 text-muted-foreground/30" />
        )}
      </div>

      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 gap-1.5">
        {product.brand && (
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate leading-none">
            {product.brand}
          </span>
        )}

        <h3 className="font-semibold text-foreground line-clamp-2 leading-tight text-xs sm:text-sm">
          {product.name}
        </h3>

        <p className="text-[10px] text-muted-foreground truncate leading-none">
          Cód: {product.code}
        </p>

        <div className="flex items-end justify-between gap-1 mt-auto pt-1.5">
          <span className="text-sm sm:text-base font-bold text-primary leading-none">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <Badge
            variant={inStock ? 'default' : 'destructive'}
            className="text-[8px] sm:text-[9px] px-1.5 py-0.5 leading-none shrink-0"
          >
            {inStock ? 'Disponível' : 'Esgotado'}
          </Badge>
        </div>

        <button className="w-full mt-1.5 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-lg bg-primary/10 text-primary text-[11px] sm:text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-all">
          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          Ver Detalhes
        </button>
      </div>
    </motion.div>
  );
}
