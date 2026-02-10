import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(product)}
      className="bg-card/50 border border-border/40 overflow-hidden cursor-pointer hover:border-primary/30 transition-colors duration-200 flex flex-col rounded-lg"
    >
      {/* Image */}
      <div className="aspect-square bg-secondary/20 flex items-center justify-center overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Package className="w-8 h-8 text-muted-foreground/20" />
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded border border-destructive/20">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Content - clean vertical stack like ML */}
      <div className="p-2.5 sm:p-3 flex flex-col gap-1.5 flex-1">
        {/* Product name - 2 lines max */}
        <h3 className="text-[13px] sm:text-sm text-foreground leading-[1.3] line-clamp-2 font-normal">
          {product.name}
        </h3>

        {/* Price - prominent */}
        <p className="text-[15px] sm:text-lg font-semibold text-foreground leading-none mt-auto pt-1">
          {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>

        {/* Shipping-like info line */}
        {inStock && (
          <p className="text-[10px] sm:text-[11px] text-[hsl(var(--success))] font-medium leading-none">
            Disponível em estoque
          </p>
        )}
      </div>
    </motion.div>
  );
}
