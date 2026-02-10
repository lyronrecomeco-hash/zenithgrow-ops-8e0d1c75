import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, User, Phone, MapPin, FileText } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  image_url: string | null;
  stock: number;
  brand: string | null;
  description: string | null;
}

interface OrderFormProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  whatsappNumber: string;
}

export default function OrderForm({ product, open, onClose, whatsappNumber }: OrderFormProps) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  if (!product) return null;

  const formattedPrice = product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid = form.name.trim().length >= 2 && form.phone.trim().length >= 8;

  const handleSubmit = () => {
    if (!isValid) return;

    const cleanName = form.name.trim().slice(0, 100);
    const cleanPhone = form.phone.trim().slice(0, 20);
    const cleanAddress = form.address.trim().slice(0, 200);
    const cleanCity = form.city.trim().slice(0, 100);
    const cleanNotes = form.notes.trim().slice(0, 300);

    let message = `Olá! Gostaria de fazer um pedido:\n\n`;
    message += `📦 *Produto:* ${product.name}\n`;
    message += `🔖 *Código:* ${product.code}\n`;
    message += `💰 *Valor:* ${formattedPrice}\n`;
    message += `\n👤 *Dados do Cliente:*\n`;
    message += `• Nome: ${cleanName}\n`;
    message += `• Telefone: ${cleanPhone}\n`;
    if (cleanAddress) message += `• Endereço: ${cleanAddress}\n`;
    if (cleanCity) message += `• Cidade: ${cleanCity}\n`;
    if (cleanNotes) message += `\n📝 *Observações:* ${cleanNotes}\n`;

    const encoded = encodeURIComponent(message);
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank');
    onClose();
    setForm({ name: '', phone: '', address: '', city: '', notes: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-border/60">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Finalizar Pedido
          </DialogTitle>
        </DialogHeader>

        {/* Product summary */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/40">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-14 h-14 object-contain rounded-lg bg-secondary/40" />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-secondary/40 flex items-center justify-center">
              <FileText className="w-6 h-6 text-muted-foreground/30" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</p>
            <p className="text-lg font-extrabold text-primary">{formattedPrice}</p>
          </div>
        </div>

        {/* Form */}
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
      </DialogContent>
    </Dialog>
  );
}
