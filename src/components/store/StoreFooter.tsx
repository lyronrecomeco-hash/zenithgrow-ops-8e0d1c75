import { MapPin, Clock, MessageCircle } from 'lucide-react';

interface StoreFooterProps {
  companyName: string;
  phone?: string | null;
  address?: string | null;
}

export default function StoreFooter({ companyName, phone, address }: StoreFooterProps) {
  return (
    <footer className="border-t border-border/50 py-8 sm:py-12 mt-16 bg-card/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground">{companyName}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sua loja de confiança. Produtos selecionados com os melhores preços.
            </p>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground">Informações</h4>
            <div className="space-y-1.5">
              {address && (
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {address}
                </p>
              )}
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                Seg - Sáb: 8h às 18h
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground">Contato</h4>
            {phone && (
              <a
                href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp: {phone}
              </a>
            )}
          </div>
        </div>

        <div className="border-t border-border/30 pt-4 text-center text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} {companyName}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
