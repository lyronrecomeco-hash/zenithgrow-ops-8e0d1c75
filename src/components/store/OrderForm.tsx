import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, User, Phone, MapPin, FileText, Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  whatsappNumber: string;
}

export default function OrderForm({ open, onClose, whatsappNumber }: OrderFormProps) {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid = form.name.trim().length >= 2 && form.phone.trim().length >= 8 && items.length > 0;

  const handleSubmit = () => {
    if (!isValid) return;

    const cleanName = form.name.trim().slice(0, 100);
    const cleanPhone = form.phone.trim().slice(0, 20);
    const cleanAddress = form.address.trim().slice(0, 200);
    const cleanCity = form.city.trim().slice(0, 100);
    const cleanNotes = form.notes.trim().slice(0, 300);

    let message = `Olá! Gostaria de fazer um pedido:\n\n`;
    message += `🛒 *Itens do Pedido:*\n`;
    items.forEach((item, i) => {
      const itemTotal = (item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const unitPrice = item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      message += `${i + 1}. ${item.name}\n`;
      message += `   Cód: ${item.code} | Qtd: ${item.quantity} x ${unitPrice} = ${itemTotal}\n`;
    });
    const formattedTotal = totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    message += `\n💰 *Total: ${formattedTotal}*\n`;
    message += `\n👤 *Dados do Cliente:*\n`;
    message += `• Nome: ${cleanName}\n`;
    message += `• Telefone: ${cleanPhone}\n`;
    if (cleanAddress) message += `• Endereço: ${cleanAddress}\n`;
    if (cleanCity) message += `• Cidade: ${cleanCity}\n`;
    if (cleanNotes) message += `\n📝 *Observações:* ${cleanNotes}\n`;

    const encoded = encodeURIComponent(message);
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank');
    clearCart();
    onClose();
    setForm({ name: '', phone: '', address: '', city: '', notes: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border/60">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Finalizar Pedido
          </DialogTitle>
        </DialogHeader>

        {/* Cart items */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-16 h-16 rounded-full bg-secondary/40 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-foreground">Carrinho vazio</p>
              <p className="text-xs text-muted-foreground">Adicione produtos para fazer seu pedido.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 mt-1 text-xs border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => { onClose(); navigate('/loja'); }}
            >
              Ver produtos <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/40">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-12 h-12 object-contain rounded-lg bg-secondary/40" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-secondary/40 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">{item.name}</p>
                  <p className="text-sm font-extrabold text-primary">
                    {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-foreground w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors ml-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 px-1">
              <span className="text-sm text-muted-foreground font-medium">Total</span>
              <span className="text-lg font-extrabold text-primary">
                {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        )}

        {/* Form - only show when cart has items */}
        {items.length > 0 && (
          <>
            <div className="space-y-3 mt-1">
              <div className="space-y-1.5">
                <Label htmlFor="order-name" className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Nome completo *
                </Label>
                <Input
                  id="order-name"
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  maxLength={100}
                  className="bg-secondary/20 border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="order-phone" className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Telefone *
                </Label>
                <Input
                  id="order-phone"
                  placeholder="(00) 00000-0000"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  maxLength={20}
                  className="bg-secondary/20 border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="order-address" className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Endereço de entrega
                </Label>
                <Input
                  id="order-address"
                  placeholder="Rua, número, bairro"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  maxLength={200}
                  className="bg-secondary/20 border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="order-city" className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Cidade
                </Label>
                <Input
                  id="order-city"
                  placeholder="Sua cidade"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  maxLength={100}
                  className="bg-secondary/20 border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="order-notes" className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Observações
                </Label>
                <Textarea
                  id="order-notes"
                  placeholder="Cor, tamanho, detalhes..."
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  maxLength={300}
                  rows={2}
                  className="bg-secondary/20 border-border/50 focus:border-primary/50 resize-none"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!isValid}
              className="w-full gap-2 h-12 text-sm font-bold gradient-primary text-primary-foreground hover:opacity-90 rounded-xl mt-2"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar pedido pelo WhatsApp
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
