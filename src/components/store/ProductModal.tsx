import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Package, MessageCircle, Info, ShoppingBag } from 'lucide-react';

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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 bg-card border-border/60 [&>button]:z-20">
        {/* Image - fixed top */}
        <div className="aspect-[4/3] bg-secondary/30 flex items-center justify-center overflow-hidden rounded-t-lg relative">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-3" />
          ) : (
            <Package className="w-16 h-16 text-muted-foreground/20" />
          )}
          {/* Price overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card/90 to-transparent pt-8 pb-3 px-4">
            <div className="flex items-end justify-between gap-2">
              <span className="text-2xl font-bold text-primary">{formattedPrice}</span>
              <Badge variant={inStock ? 'default' : 'destructive'} className="text-xs shrink-0">
                {inStock ? 'Disponível' : 'Esgotado'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full rounded-none bg-secondary/50 border-b border-border/40 h-11">
            <TabsTrigger value="overview" className="flex-1 gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:text-primary rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
              <ShoppingBag className="w-3.5 h-3.5" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="details" className="flex-1 gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:text-primary rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
              <Info className="w-3.5 h-3.5" />
              Detalhes
            </TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="mt-0 p-4 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground leading-snug break-words">
                {product.name}
              </h3>
              {product.brand && (
                <p className="text-sm text-muted-foreground">
                  Marca: <span className="text-foreground font-medium">{product.brand}</span>
                </p>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 break-words whitespace-pre-line">
                {product.description}
              </p>
            )}

            <Button
              onClick={handleConfirm}
              disabled={!inStock || !whatsappNumber}
              className="w-full gap-2 h-12 text-sm gradient-primary text-primary-foreground hover:opacity-90"
            >
              <MessageCircle className="w-4 h-4" />
              Confirmar pelo WhatsApp
            </Button>
          </TabsContent>

          {/* Tab: Detalhes */}
          <TabsContent value="details" className="mt-0 p-4 space-y-4">
            {/* Specs table */}
            <div className="rounded-lg border border-border/40 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border/30">
                    <td className="px-3 py-2.5 text-muted-foreground bg-secondary/30 font-medium w-28">Nome</td>
                    <td className="px-3 py-2.5 text-foreground break-words">{product.name}</td>
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="px-3 py-2.5 text-muted-foreground bg-secondary/30 font-medium">Código</td>
                    <td className="px-3 py-2.5 text-foreground font-mono text-xs">{product.code}</td>
                  </tr>
                  {product.brand && (
                    <tr className="border-b border-border/30">
                      <td className="px-3 py-2.5 text-muted-foreground bg-secondary/30 font-medium">Marca</td>
                      <td className="px-3 py-2.5 text-foreground">{product.brand}</td>
                    </tr>
                  )}
                  <tr className="border-b border-border/30">
                    <td className="px-3 py-2.5 text-muted-foreground bg-secondary/30 font-medium">Preço</td>
                    <td className="px-3 py-2.5 text-primary font-bold">{formattedPrice}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 text-muted-foreground bg-secondary/30 font-medium">Estoque</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={inStock ? 'default' : 'destructive'} className="text-xs">
                        {inStock ? 'Disponível' : 'Esgotado'}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Full description */}
            {product.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Descrição</h4>
                <div className="rounded-lg bg-secondary/20 border border-border/30 p-3">
                  <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
