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
      className="glass-card overflow-hidden cursor-pointer group hover:border-primary/30 transition-all duration-300 flex flex-col"
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
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/30" />
        )}
      </div>

      <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 flex flex-col flex-1">
        {product.brand && (
          <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider truncate">
            {product.brand}
          </span>
        )}
        <h3 className="font-semibold text-foreground line-clamp-2 leading-snug text-sm sm:text-base">
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Cód: {product.code}</p>
        <div className="flex items-center justify-between pt-1 mt-auto">
          <span className="text-base sm:text-lg font-bold text-primary">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <Badge variant={inStock ? 'default' : 'destructive'} className="text-[9px] sm:text-[10px] px-1.5 py-0.5">
            {inStock ? 'Disponível' : 'Esgotado'}
          </Badge>
        </div>
        <button className="w-full mt-1.5 sm:mt-2 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-lg bg-primary/10 text-primary text-xs sm:text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all">
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Ver Detalhes
        </button>
      </div>
    </motion.div>
  );
}
