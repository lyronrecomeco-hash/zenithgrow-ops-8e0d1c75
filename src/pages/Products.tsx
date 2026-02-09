import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Package, Sparkles, Upload, ChevronRight, ChevronLeft, Loader2, X, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Step = 'data' | 'description' | 'images';

const STEPS: { key: Step; label: string }[] = [
  { key: 'data', label: 'Dados' },
  { key: 'description', label: 'Descrição' },
  { key: 'images', label: 'Imagens' },
];

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({ name: '', brand: '', price: '', code: '', category_id: '', description: '', image_url: '' });
  const [step, setStep] = useState<Step>('data');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiImageLoading, setAiImageLoading] = useState(false);
  const [aiImages, setAiImages] = useState<{ url: string; source: string; is_main?: boolean }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [p, c] = await Promise.all([
      supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    if (p.data) setProducts(p.data);
    if (c.data) setCategories(c.data);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    if (categories.length === 0) {
      toast({ title: 'Crie uma categoria primeiro', description: 'Vá em Categorias e adicione pelo menos uma antes de criar produtos.', variant: 'destructive' });
      return;
    }
    setEditProduct(null);
    setForm({ name: '', brand: '', price: '', code: '', category_id: '', description: '', image_url: '' });
    setAiImages([]);
    setSelectedImageIndex(0);
    setStep('data');
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditProduct(p);
    setForm({ name: p.name, brand: p.brand || '', price: String(p.price), code: p.code, category_id: p.category_id || '', description: p.description || '', image_url: p.image_url || '' });
    setAiImages([]);
    setSelectedImageIndex(0);
    setStep('data');
    setDialogOpen(true);
  };

  const generateCode = () => {
    const prefix = form.brand ? form.brand.substring(0, 4).toUpperCase() : 'PROD';
    const num = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    setForm(f => ({ ...f, code: `${prefix}-${num}` }));
  };

  const generateDescription = async () => {
    if (!form.name) { toast({ title: 'Preencha o nome do produto primeiro', variant: 'destructive' }); return; }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-product', {
        body: { action: 'description', name: form.name, brand: form.brand },
      });
      if (error) throw error;
      if (data?.description) {
        setForm(f => ({ ...f, description: data.description }));
        toast({ title: 'Especificações técnicas geradas!' });
      }
    } catch (err: any) {
      toast({ title: 'Erro ao gerar descrição', description: err.message, variant: 'destructive' });
    }
    setAiLoading(false);
  };

  const searchImages = async () => {
    if (!form.name) { toast({ title: 'Preencha o nome do produto primeiro', variant: 'destructive' }); return; }
    setAiImageLoading(true);
    setAiImages([]);
    try {
      const { data, error } = await supabase.functions.invoke('ai-product', {
        body: { action: 'image', name: form.name, brand: form.brand },
      });
      if (error) throw error;
      if (data?.images && data.images.length > 0) {
        setAiImages(data.images);
        // Auto-select main image
        const mainIdx = data.images.findIndex((img: any) => img.is_main);
        if (mainIdx >= 0) {
          setForm(f => ({ ...f, image_url: data.images[mainIdx].url }));
          setSelectedImageIndex(mainIdx);
        } else {
          setForm(f => ({ ...f, image_url: data.images[0].url }));
          setSelectedImageIndex(0);
        }
        toast({ title: `${data.images.length} imagem(ns) encontrada(s)!` });
      } else {
        toast({ title: 'Nenhuma imagem encontrada', description: 'Tente enviar manualmente', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Erro ao buscar imagens', description: err.message, variant: 'destructive' });
    }
    setAiImageLoading(false);
  };

  const selectAiImage = (url: string, index: number) => {
    setForm(f => ({ ...f, image_url: url }));
    setSelectedImageIndex(index);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setForm(f => ({ ...f, image_url: urlData.publicUrl }));
      toast({ title: 'Imagem enviada!' });
    } catch (err: any) {
      toast({ title: 'Erro ao enviar imagem', description: err.message, variant: 'destructive' });
    }
    setUploadingImage(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    if (!form.category_id) {
      toast({ title: 'Selecione uma categoria', variant: 'destructive' });
      return;
    }
    const data = {
      name: form.name,
      brand: form.brand,
      price: Number(form.price),
      code: form.code || `PROD-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
      category_id: form.category_id,
      description: form.description,
      image_url: form.image_url,
    };
    if (editProduct) {
      await supabase.from('products').update(data).eq('id', editProduct.id);
      toast({ title: 'Produto atualizado' });
    } else {
      await supabase.from('products').insert(data);
      toast({ title: 'Produto criado' });
    }
    setDialogOpen(false);
    loadData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('products').delete().eq('id', deleteId);
    toast({ title: 'Produto removido' });
    setDeleteId(null);
    loadData();
  };

  const canGoNext = () => {
    if (step === 'data') return !!form.name && !!form.price && !!form.category_id;
    return true;
  };

  const nextStep = () => {
    const idx = STEPS.findIndex(s => s.key === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  };

  const prevStep = () => {
    const idx = STEPS.findIndex(s => s.key === step);
    if (idx > 0) setStep(STEPS[idx - 1].key);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">{products.length} produtos cadastrados</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" />Novo Produto</Button>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border/50" />
      </div>

      {/* Product Cards Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="glass-card overflow-hidden group hover:border-primary/20 transition-all">
            <div className="relative w-full h-40 bg-secondary/30">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-10 h-10 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="icon" className="h-7 w-7 bg-background/80 backdrop-blur-sm" onClick={() => openEdit(p)}><Pencil className="w-3 h-3" /></Button>
                <Button variant="secondary" size="icon" className="h-7 w-7 bg-background/80 backdrop-blur-sm text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
              {p.stock <= p.min_stock && (
                <Badge variant="destructive" className="absolute top-2 left-2 text-[10px] bg-destructive/90">Estoque Baixo</Badge>
              )}
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-base truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand || 'Sem marca'} · {p.code}</p>
                </div>
              </div>
              {(p.categories as any)?.name && (
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">{(p.categories as any).name}</Badge>
              )}
              <div className="flex items-center justify-between pt-1">
                <p className="text-lg font-bold">R$ {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <Badge variant="secondary" className={cn("text-xs", p.stock <= p.min_stock ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-secondary')}>
                  {p.stock} un.
                </Badge>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full glass-card p-12 text-center text-muted-foreground">Nenhum produto encontrado</div>
        )}
      </motion.div>

      {/* Multi-step Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg glass-card-strong border-border/30 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{editProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>
              {step === 'data' && 'Preencha os dados básicos do produto'}
              {step === 'description' && 'Especificações técnicas do produto'}
              {step === 'images' && 'Adicione até 4 imagens reais do produto'}
            </DialogDescription>
          </DialogHeader>

          {/* Step indicators */}
          <div className="flex items-center gap-2 py-2">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => setStep(s.key)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all w-full justify-center",
                    step === s.key ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold",
                    step === s.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>{i + 1}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              </div>
            ))}
          </div>

          <div className="py-4">
            {/* Step 1: Data */}
            {step === 'data' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary/50" /></div>
                  <div className="space-y-2"><Label>Marca</Label><Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="bg-secondary/50" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Preço (R$) *</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="bg-secondary/50" /></div>
                  <div className="space-y-2">
                    <Label>Código</Label>
                    <div className="flex gap-2">
                      <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="AUTO" className="bg-secondary/50" />
                      <Button variant="outline" size="icon" onClick={generateCode} type="button" className="shrink-0"><Package className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                    <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {categories.length === 0 && <p className="text-xs text-destructive">Nenhuma categoria cadastrada. Crie uma primeiro.</p>}
                </div>
              </div>
            )}

            {/* Step 2: Description - Technical Specs Only */}
            {step === 'description' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Especificações Técnicas</Label>
                    <Button variant="outline" size="sm" onClick={generateDescription} disabled={aiLoading} className="gap-1.5">
                      {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
                      Gerar com IA
                    </Button>
                  </div>
                  <Textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="bg-secondary/50 min-h-[220px] text-sm"
                    placeholder="Clique em 'Gerar com IA' para obter as especificações técnicas reais (RAM, tela, bateria, processador, etc)..."
                  />
                </div>
                {aiLoading && (
                  <div className="glass-card p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <div>
                      <p className="text-sm font-medium">Buscando especificações técnicas...</p>
                      <p className="text-xs text-muted-foreground">RAM, tela, bateria, processador de "{form.name}"</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Images - 1 main + 3 secondary */}
            {step === 'images' && (
              <div className="space-y-4">
                {/* Main selected image */}
                {form.image_url && (
                  <div className="relative rounded-xl overflow-hidden border border-border/30">
                    <img
                      src={form.image_url}
                      alt="Produto"
                      className="w-full h-52 object-contain bg-secondary/20"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="text-[10px] bg-primary/90"><Star className="w-3 h-3 mr-1" /> Principal</Badge>
                    </div>
                    <Button variant="destructive" size="sm" className="absolute top-2 right-2 h-7 text-xs" onClick={() => setForm(f => ({ ...f, image_url: '' }))}>
                      <X className="w-3 h-3 mr-1" /> Remover
                    </Button>
                  </div>
                )}

                {/* Upload / AI buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="glass-card p-6 flex flex-col items-center gap-3 hover:border-primary/30 transition-all cursor-pointer text-center"
                  >
                    {uploadingImage ? <Loader2 className="w-8 h-8 text-primary animate-spin" /> : <Upload className="w-8 h-8 text-primary" />}
                    <div>
                      <p className="font-medium text-sm">Enviar do Dispositivo</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP</p>
                    </div>
                  </button>
                  <button
                    onClick={searchImages}
                    disabled={aiImageLoading || !form.name}
                    className="glass-card p-6 flex flex-col items-center gap-3 hover:border-primary/30 transition-all cursor-pointer text-center"
                  >
                    {aiImageLoading ? <Loader2 className="w-8 h-8 text-primary animate-spin" /> : <Sparkles className="w-8 h-8 text-primary" />}
                    <div>
                      <p className="font-medium text-sm">Buscar com IA</p>
                      <p className="text-xs text-muted-foreground mt-1">Extrai até 4 imagens reais</p>
                    </div>
                  </button>
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

                {aiImageLoading && (
                  <div className="glass-card p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <div>
                      <p className="text-sm font-medium">Extraindo imagens reais da internet...</p>
                      <p className="text-xs text-muted-foreground">Buscando fotos de "{form.name}" em lojas e fabricantes</p>
                    </div>
                  </div>
                )}

                {/* AI found images - grid of 4 */}
                {aiImages.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Imagens encontradas — clique para definir como principal</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {aiImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => selectAiImage(img.url, i)}
                          className={cn(
                            "relative rounded-xl overflow-hidden border-2 transition-all h-28 bg-secondary/20",
                            form.image_url === img.url ? "border-primary ring-2 ring-primary/20" : "border-border/30 hover:border-primary/40"
                          )}
                        >
                          <img
                            src={img.url}
                            alt={`Imagem ${i + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                          />
                          <span className="absolute bottom-1 left-1 right-1 text-[9px] text-muted-foreground bg-background/80 backdrop-blur-sm rounded px-1 py-0.5 truncate">{img.source}</span>
                          {form.image_url === img.url && (
                            <div className="absolute top-1 left-1">
                              <Badge className="text-[8px] px-1 py-0"><Star className="w-2 h-2 mr-0.5" />Principal</Badge>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 w-full sm:w-auto">
              {step !== 'data' && (
                <Button variant="outline" onClick={prevStep} className="flex-1 sm:flex-none">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
              )}
              {step === 'data' && (
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 sm:flex-none">Cancelar</Button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {step !== 'images' ? (
                <Button onClick={nextStep} disabled={!canGoNext()} className="flex-1 sm:flex-none">
                  Próximo <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSave} className="flex-1 sm:flex-none">
                  {editProduct ? 'Salvar' : 'Criar Produto'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md glass-card-strong border-border/30">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>Tem certeza? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
