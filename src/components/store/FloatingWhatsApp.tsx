import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  phone: string;
}

export default function FloatingWhatsApp({ phone }: FloatingWhatsAppProps) {
  const cleanNumber = phone.replace(/\D/g, '');
  
  if (!cleanNumber) return null;

  const handleClick = () => {
    const message = encodeURIComponent('Olá! Vim pela loja online e gostaria de mais informações.');
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
