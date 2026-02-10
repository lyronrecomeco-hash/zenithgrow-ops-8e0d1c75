import { Store } from 'lucide-react';
import CartButton from '@/components/store/CartButton';
import { useState } from 'react';
import OrderForm from '@/components/store/OrderForm';

interface StoreHeaderProps {
  companyName: string;
  whatsappNumber?: string;
}

export default function StoreHeader({ companyName, whatsappNumber = '' }: StoreHeaderProps) {
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 glass-card-strong border-b border-border/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Store className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground truncate flex-1">{companyName}</h1>
          <CartButton onClick={() => setShowCart(true)} />
        </div>
      </header>
      <OrderForm
        open={showCart}
        onClose={() => setShowCart(false)}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}
