import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MessageCircle } from 'lucide-react';

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

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  whatsappNumber: string;
}

export default function ProductModal({ product, open, onClose, whatsappNumber }: ProductModalProps) {
  if (!product) return null;

  const inStock = product.stock > 0;
  const formattedPrice = product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleConfirm = () => {
    const message = encodeURIComponent(
      `Olá! O produto que escolhi foi esse:\n\n` +
      `📦 Nome: *${product.name}*\n` +
      `🔖 Código: ${product.code}\n` +
      `💰 Valor: ${formattedPrice}`
    );
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Image */}
        <div className="aspect-video bg-secondary/50 flex items-center justify-center overflow-hidden rounded-t-lg">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <Package className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground/30" />
          )}
        </div>

        {/* Content */}
        <div className="px-5 pb-5 space-y-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg sm:text-xl leading-snug">{product.name}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Código: {product.code}
            </DialogDescription>
          </DialogHeader>

          {product.brand && (
            <div className="text-sm text-muted-foreground">
              Marca: <span className="text-foreground font-medium">{product.brand}</span>
            </div>
          )}

          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed break-words">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-2xl font-bold text-primary">{formattedPrice}</span>
            <Badge variant={inStock ? 'default' : 'destructive'}>
              {inStock ? 'Disponível' : 'Esgotado'}
            </Badge>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={!inStock || !whatsappNumber}
            className="w-full gap-2 h-12 text-sm sm:text-base gradient-primary text-primary-foreground hover:opacity-90"
          >
            <MessageCircle className="w-5 h-5" />
            Confirmar pelo WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
