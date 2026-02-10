import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface HeroBannerProps {
  companyName: string;
}

export default function HeroBanner({ companyName }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden py-10 md:py-16">
      <div className="absolute inset-0 gradient-primary opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_70%)]" />
      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <ShoppingBag className="w-4 h-4" />
            Catálogo de Produtos
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-2 tracking-tight">
            {companyName}
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Confira nossos produtos e finalize pelo WhatsApp!
          </p>
        </motion.div>
      </div>
    </section>
  );
}
