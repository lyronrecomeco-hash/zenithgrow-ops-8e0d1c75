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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect(product)}
      className="bg-card/60 border border-border/50 overflow-hidden cursor-pointer group hover:border-primary/30 transition-all duration-200 flex flex-col rounded-xl"
    >
      {/* Image - fixed aspect ratio */}
      <div className="aspect-square bg-secondary/30 flex items-center justify-center overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <Package className="w-10 h-10 text-muted-foreground/20" />
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        {product.brand && (
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">
            {product.brand}
          </span>
        )}

        <h3 className="font-medium text-foreground line-clamp-2 leading-snug text-sm min-h-[2.5em]">
          {product.name}
        </h3>

        <p className="text-[10px] text-muted-foreground leading-none mt-auto">
          Cód: {product.code}
        </p>

        <div className="pt-1.5 mt-1 border-t border-border/30">
          <span className="text-base font-bold text-primary leading-none">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
