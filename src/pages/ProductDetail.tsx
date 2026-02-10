import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, Package, ShoppingBag, Info, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import OrderForm from '@/components/store/OrderForm';

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [company, setCompany] = useState<CompanySettings>({ name: 'Loja', phone: null });
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [prodRes, compRes] = await Promise.all([
        supabase.from('products').select('id,name,code,price,image_url,stock,brand,description,category_id').eq('id', id!).maybeSingle(),
        supabase.from('company_settings').select('name,phone').limit(1).maybeSingle(),
      ]);
      if (prodRes.data) setProduct(prodRes.data);
      if (compRes.data) setCompany({ name: compRes.data.name, phone: compRes.data.phone });
      setLoading(false);
    };
    load();
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
        <StoreHeader companyName={company.name} />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Package className="w-16 h-16 text-muted-foreground/30" />
          <p className="text-muted-foreground">Produto não encontrado.</p>
          <Button variant="outline" onClick={() => navigate('/loja')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar à loja
          </Button>
        </div>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const formattedPrice = product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="relative z-10">
        <StoreHeader companyName={company.name} />

        <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/loja')}
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
              <div className="w-full md:w-1/2 aspect-square sm:aspect-[4/3] bg-card border border-border/60 rounded-2xl flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 sm:p-6"
                  />
                ) : (
                  <Package className="w-20 h-20 text-muted-foreground/20" />
                )}
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
                  <Badge
                    variant={inStock ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {inStock ? 'Disponível' : 'Esgotado'}
                  </Badge>
                </div>

                {product.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-line break-words">
                    {product.description}
                  </p>
                )}

                <Button
                  onClick={() => setShowOrderForm(true)}
                  disabled={!inStock || !company.phone}
                  size="lg"
                  className="w-full gap-2 mt-auto gradient-primary text-primary-foreground hover:opacity-90 h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl"
                >
                  <MessageCircle className="w-5 h-5" />
                  Eu quero!
                </Button>
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
                  Detalhes
                </TabsTrigger>
                <TabsTrigger
                  value="specs"
                  className="flex-1 gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Especificações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-3 sm:mt-4">
                <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6">
                  {product.description ? (
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line break-words">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground/60 italic">
                      Nenhuma descrição disponível para este produto.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-3 sm:mt-4">
                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        { label: 'Nome', value: product.name },
                        { label: 'Código', value: product.code, mono: true },
                        ...(product.brand ? [{ label: 'Marca', value: product.brand }] : []),
                        { label: 'Preço', value: formattedPrice, highlight: true },
                        { label: 'Disponibilidade', value: inStock ? 'Em estoque' : 'Esgotado', badge: true, inStock },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-border/30 last:border-b-0">
                          <td className="px-4 py-3 text-muted-foreground bg-secondary/30 font-medium w-32 sm:w-40">
                            {row.label}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {row.badge ? (
                              <Badge variant={row.inStock ? 'default' : 'destructive'} className="text-xs">
                                {row.value}
                              </Badge>
                            ) : row.highlight ? (
                              <span className="font-bold text-primary">{row.value}</span>
                            ) : row.mono ? (
                              <span className="font-mono text-xs">{row.value}</span>
                            ) : (
                              <span className="break-words">{row.value}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>

        <StoreFooter companyName={company.name} />
      </div>

      {/* Order Form Modal */}
      <OrderForm
        product={product}
        open={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        whatsappNumber={company.phone || ''}
      />
    </div>
  );
}
