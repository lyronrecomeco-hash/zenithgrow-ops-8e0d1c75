import { useMemo } from 'react';
import {
  Package, Barcode, Tag, Box, CheckCircle2, XCircle,
  Cpu, HardDrive, Smartphone, Monitor, Battery, Wifi,
  Camera, Ruler, Weight, Palette, Zap, Shield,
  Clock, Thermometer, Volume2, Bluetooth, MemoryStick,
  CircuitBoard, Gauge, Layers, Settings, Star, Hash
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TechSpecsProps {
  product: {
    name: string;
    code: string;
    brand: string | null;
    price: number;
    stock: number;
    description: string | null;
  };
}

interface SpecItem {
  label: string;
  value: string;
  icon: React.ElementType;
}

// Map keywords to icons for auto-detection
const ICON_MAP: { keywords: string[]; icon: React.ElementType }[] = [
  { keywords: ['processador', 'cpu', 'chipset', 'chip', 'núcleo'], icon: Cpu },
  { keywords: ['memória', 'ram', 'memoria'], icon: MemoryStick },
  { keywords: ['armazenamento', 'storage', 'hd', 'ssd', 'disco', 'capacidade', 'gb', 'tb'], icon: HardDrive },
  { keywords: ['tela', 'display', 'resolução', 'polegadas', 'lcd', 'amoled', 'oled', 'painel'], icon: Monitor },
  { keywords: ['bateria', 'autonomia', 'mah', 'carga'], icon: Battery },
  { keywords: ['câmera', 'camera', 'megapixel', 'mp', 'lente', 'foto'], icon: Camera },
  { keywords: ['peso', 'gramas', 'kg'], icon: Weight },
  { keywords: ['dimensão', 'dimensões', 'tamanho', 'medidas', 'altura', 'largura', 'comprimento', 'profundidade'], icon: Ruler },
  { keywords: ['cor', 'cores', 'acabamento', 'material'], icon: Palette },
  { keywords: ['wifi', 'wi-fi', 'rede', 'conectividade', '4g', '5g', 'internet'], icon: Wifi },
  { keywords: ['bluetooth'], icon: Bluetooth },
  { keywords: ['potência', 'watts', 'watt', 'voltagem', 'tensão', 'volt'], icon: Zap },
  { keywords: ['garantia', 'certificação', 'proteção', 'ip6', 'ip5', 'resistência'], icon: Shield },
  { keywords: ['velocidade', 'rpm', 'ghz', 'mhz', 'frequência'], icon: Gauge },
  { keywords: ['temperatura', 'btu', 'refrigeração'], icon: Thermometer },
  { keywords: ['som', 'áudio', 'audio', 'alto-falante', 'microfone', 'decibel'], icon: Volume2 },
  { keywords: ['sistema', 'android', 'ios', 'windows', 'software'], icon: Smartphone },
  { keywords: ['placa', 'gpu', 'vídeo', 'gráfica'], icon: CircuitBoard },
  { keywords: ['tempo', 'duração', 'horas', 'minutos'], icon: Clock },
  { keywords: ['camada', 'versão', 'geração', 'modelo', 'tipo', 'classe', 'categoria'], icon: Layers },
  { keywords: ['configuração', 'modo', 'função', 'recurso', 'tecnologia', 'suporte'], icon: Settings },
];

function getIconForLabel(label: string): React.ElementType {
  const lower = label.toLowerCase();
  for (const entry of ICON_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.icon;
    }
  }
  return Star;
}

/**
 * Tries to parse the description into structured specs.
 * Supports formats like:
 * - "Label: Value"
 * - "Label - Value"
 * - "**Label**: Value" (markdown bold)
 * - "• Label: Value" (bullet points)
 */
function parseDescriptionToSpecs(description: string): SpecItem[] {
  if (!description) return [];

  const lines = description.split('\n').map((l) => l.trim()).filter(Boolean);
  const specs: SpecItem[] = [];

  for (const line of lines) {
    // Skip headers (lines that are ALL CAPS or start with # or are very short generic text)
    if (/^#{1,3}\s/.test(line)) continue;
    if (line.length < 4) continue;

    // Clean markdown bold
    const cleaned = line
      .replace(/^\s*[-•*]\s*/, '') // remove bullet
      .replace(/\*\*/g, '')        // remove bold markers
      .replace(/^➤\s*/, '')        // remove arrow
      .trim();

    // Try "Label: Value" or "Label - Value"
    const colonMatch = cleaned.match(/^([^:]{2,40}):\s*(.+)$/);
    const dashMatch = !colonMatch ? cleaned.match(/^([^–—-]{2,40})\s*[-–—]\s*(.+)$/) : null;

    const match = colonMatch || dashMatch;
    if (match) {
      const label = match[1].trim();
      const value = match[2].trim();

      // Skip if value is too long (likely a paragraph, not a spec)
      if (value.length > 200) continue;
      // Skip if label looks like a sentence
      if (label.split(' ').length > 5) continue;

      specs.push({
        label,
        value,
        icon: getIconForLabel(label),
      });
    }
  }

  return specs;
}

function SpecRow({ label, value, icon: Icon }: SpecItem) {
  return (
    <div className="flex items-start gap-3 px-4 sm:px-6 py-3 sm:py-3.5 group hover:bg-secondary/10 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm text-foreground font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

export default function TechSpecs({ product }: TechSpecsProps) {
  const inStock = product.stock > 0;
  const formattedPrice = product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const parsedSpecs = useMemo(() => parseDescriptionToSpecs(product.description || ''), [product.description]);

  // Fixed specs that always show
  const fixedSpecs: SpecItem[] = [
    { label: 'Produto', value: product.name, icon: Package },
    { label: 'Código', value: product.code, icon: Barcode },
    ...(product.brand ? [{ label: 'Marca', value: product.brand, icon: Tag }] : []),
  ];

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border/40 bg-secondary/20 flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
          <Hash className="w-4 h-4 text-primary" />
          Ficha Técnica
        </h3>
        {parsedSpecs.length > 0 && (
          <Badge variant="secondary" className="text-[10px] font-medium">
            {fixedSpecs.length + parsedSpecs.length + 2} specs
          </Badge>
        )}
      </div>

      <div className="divide-y divide-border/20">
        {/* Identification section */}
        <div>
          <div className="px-4 sm:px-6 py-2 bg-muted/20">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Identificação</p>
          </div>
          <div className="divide-y divide-border/10">
            {fixedSpecs.map((spec) => (
              <SpecRow key={spec.label} {...spec} />
            ))}
          </div>
        </div>

        {/* AI-parsed specs section */}
        {parsedSpecs.length > 0 && (
          <div>
            <div className="px-4 sm:px-6 py-2 bg-muted/20">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Especificações</p>
            </div>
            <div className="divide-y divide-border/10">
              {parsedSpecs.map((spec, i) => (
                <SpecRow key={`${spec.label}-${i}`} {...spec} />
              ))}
            </div>
          </div>
        )}

        {/* Price & availability section */}
        <div>
          <div className="px-4 sm:px-6 py-2 bg-muted/20">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Comercial</p>
          </div>
          <div className="divide-y divide-border/10">
            <div className="flex items-start gap-3 px-4 sm:px-6 py-3 sm:py-3.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Box className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Preço</p>
                <p className="text-lg text-primary font-extrabold">{formattedPrice}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-4 sm:px-6 py-3 sm:py-3.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${inStock ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
                {inStock ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-destructive" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Disponibilidade</p>
                <Badge variant={inStock ? 'default' : 'destructive'} className="text-xs">
                  {inStock ? 'Em estoque' : 'Esgotado'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
