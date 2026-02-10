import { motion } from 'framer-motion';
import { Package, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const inStock = product.stock > 0;
  const formattedPrice = product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      onClick={() => navigate(`/produto/${product.code}`)}
      className="bg-card border border-border/70 overflow-hidden cursor-pointer group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/15 transition-all duration-200 flex flex-col rounded-xl relative"
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_70%)] pointer-events-none" />

      {/* Image */}
      <div className="aspect-[4/3] bg-secondary/40 flex items-center justify-center overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <Package className="w-10 h-10 text-muted-foreground/25" />
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center">
            <span className="text-[10px] font-semibold text-destructive bg-destructive/15 px-2.5 py-1 rounded-full border border-destructive/30">
              Esgotado
            </span>
          </div>
        )}
        {inStock && (
          <div className="absolute top-1.5 right-1.5">
            <span className="text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
              Disponível
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 gap-1 border-t border-border/50 relative">
        {/* Price - prominent */}
        <span className="text-lg sm:text-xl font-extrabold text-primary leading-tight">
          {formattedPrice}
        </span>

        {/* Product name */}
        <h3 className="text-xs sm:text-sm text-foreground/80 line-clamp-2 leading-snug mt-0.5 font-medium">
          {product.name}
        </h3>

        {/* Brand */}
        {product.brand && (
          <span className="text-[10px] text-muted-foreground/60 leading-none uppercase tracking-wide">
            {product.brand}
          </span>
        )}

        {/* CTA Button */}
        <button
          className="mt-auto pt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
          onClick={(e) => { e.stopPropagation(); navigate(`/produto/${product.code}`); }}
        >
          <Eye className="w-3.5 h-3.5" />
          Ver detalhes
        </button>
      </div>
    </motion.div>
  );
}
