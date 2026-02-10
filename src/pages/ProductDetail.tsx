import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, Package, ShoppingBag, Info, MessageCircle, Share2, ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import OrderForm from '@/components/store/OrderForm';
import RelatedProducts from '@/components/store/RelatedProducts';
import TechSpecs from '@/components/store/TechSpecs';
import FloatingWhatsApp from '@/components/store/FloatingWhatsApp';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  image_url: string | null;
  stock: number;
  brand: string | null;
  description: string | null;
  category_id: string | null;
}

interface CompanySettings {
  name: string;
  phone: string | null;
}

export default function ProductDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [company, setCompany] = useState<CompanySettings>({ name: 'Loja', phone: null });
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [prodRes, compRes] = await Promise.all([
        supabase.from('products').select('id,name,code,price,image_url,stock,brand,description,category_id').eq('code', code!).maybeSingle(),
        supabase.from('company_settings').select('name,phone').limit(1).maybeSingle(),
      ]);
      if (prodRes.data) setProduct(prodRes.data);
      if (compRes.data) setCompany({ name: compRes.data.name, phone: compRes.data.phone });
      setLoading(false);
    };
    load();
    setQuantity(1);
    setAddedToCart(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <StoreHeader companyName={company.name} whatsappNumber={company.phone || ''} />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Package className="w-16 h-16 text-muted-foreground/30" />
          <p className="text-muted-foreground">Produto não encontrado.</p>
          <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar à loja
          </Button>
        </div>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const formattedPrice = product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleShare = async () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/produto/${product.id}`;
    const shareText = `Confira: ${product.name} por ${formattedPrice}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast({ title: 'Link copiado!', description: 'Compartilhe com seus contatos.' });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      code: product.code,
      price: product.price,
      image_url: product.image_url,
    }, quantity);
    setAddedToCart(true);
    toast({ title: 'Adicionado ao carrinho!', description: `${quantity}x ${product.name}` });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      code: product.code,
      price: product.price,
      image_url: product.image_url,
    }, quantity);
    setShowOrderForm(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="relative z-10">
        <StoreHeader companyName={company.name} whatsappNumber={company.phone || ''} />

        <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar à loja
          </button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Top section: Image + Key info */}
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Image */}
              <div className="w-full md:w-1/2 aspect-square sm:aspect-[4/3] bg-card border border-border/60 rounded-2xl flex items-center justify-center overflow-hidden relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 sm:p-6"
                  />
                ) : (
                  <Package className="w-20 h-20 text-muted-foreground/20" />
                )}
                {/* Share button on image */}
                <button
                  onClick={handleShare}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Compartilhar"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Key info */}
              <div className="w-full md:w-1/2 flex flex-col gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  {product.brand && (
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {product.brand}
                    </span>
                  )}
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
                    {product.name}
                  </h1>
                  <p className="text-xs text-muted-foreground">Código: {product.code}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary">
                    {formattedPrice}
                  </span>
                  <Badge variant={inStock ? 'default' : 'destructive'} className="text-xs">
                    {inStock ? 'Disponível' : 'Esgotado'}
                  </Badge>
                </div>

                {product.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-line break-words">
                    {product.description}
                  </p>
                )}

                {/* Quantity selector */}
                {inStock && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground font-medium">Quantidade:</span>
                    <div className="flex items-center gap-1.5 bg-secondary/30 rounded-lg border border-border/50 px-1">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-foreground">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-2 mt-auto">
                  <Button
                    onClick={handleBuyNow}
                    disabled={!inStock}
                    size="lg"
                    className="w-full gap-2 gradient-primary text-primary-foreground hover:opacity-90 h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Eu quero!
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    variant="outline"
                    size="lg"
                    className="w-full gap-2 h-11 sm:h-12 text-sm font-semibold rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                  >
                    {addedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    {addedToCart ? 'Adicionado!' : 'Adicionar ao carrinho'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs: Details */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full bg-card/60 border border-border/50 rounded-xl h-11 sm:h-12 p-1">
                <TabsTrigger
                  value="details"
                  className="flex-1 gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
                >
                  <Info className="w-3.5 h-3.5" />
                  Descrição
                </TabsTrigger>
                <TabsTrigger
                  value="specs"
                  className="flex-1 gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Ficha Técnica
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-3 sm:mt-4">
                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border/40 bg-secondary/20">
                    <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Descrição do Produto
                    </h3>
                  </div>
                  <div className="p-4 sm:p-6">
                    {product.description ? (
                      <div className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line break-words">
                        {product.description}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                        <Info className="w-8 h-8 text-muted-foreground/20" />
                        <p className="text-sm text-muted-foreground/60">Nenhuma descrição disponível.</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-3 sm:mt-4">
                <TechSpecs product={product} />
              </TabsContent>
            </Tabs>

            {/* Related products */}
            <RelatedProducts categoryId={product.category_id} currentProductId={product.id} />
          </motion.div>
        </main>

        <StoreFooter companyName={company.name} phone={company.phone} />
      </div>

      <FloatingWhatsApp phone={company.phone || ''} />

      <OrderForm
        open={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        whatsappNumber={company.phone || ''}
      />
    </div>
  );
}
