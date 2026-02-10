import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface CartButtonProps {
  onClick: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  const { totalItems } = useCart();

  return (
    <button
      onClick={onClick}
      className="relative p-2.5 rounded-xl border border-border/50 bg-card/60 text-foreground hover:text-primary hover:border-primary/50 transition-colors"
      aria-label="Carrinho"
    >
      <ShoppingCart className="w-5 h-5" />
      {totalItems > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </button>
  );
}
