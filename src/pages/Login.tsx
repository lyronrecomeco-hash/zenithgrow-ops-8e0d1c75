import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowRight, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Email ou senha inválidos. Verifique suas credenciais.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 100%, hsl(260 60% 15% / 0.5), hsl(220 25% 6%) 70%)' }}>
      
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'hsl(260, 80%, 50%)' }} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
        style={{ background: 'hsl(199, 89%, 48%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-[900px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden"
        style={{
          background: 'hsl(0 0% 100% / 0.03)',
          border: '1px solid hsl(0 0% 100% / 0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Left - Branding */}
        <div className="relative p-10 lg:p-12 flex flex-col justify-center overflow-hidden min-h-[320px] lg:min-h-[520px]">
          {/* Animated blob */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full opacity-40 blur-[60px]"
              style={{ background: 'linear-gradient(135deg, hsl(260, 80%, 50%), hsl(199, 89%, 48%))' }} />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full opacity-20 blur-[50px]"
              style={{ background: 'hsl(320, 70%, 50%)' }} />
          </div>

          <div className="relative z-10">
            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-6 uppercase flex items-center gap-2">
              <span className="w-4 h-[2px] bg-primary inline-block" />
              Store Manager v1.0
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-3">
              Gerencie sua<br />
              <span className="text-primary">Loja.</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">
              O sistema inteligente que centraliza estoque, vendas e finanças em um só lugar.
            </p>
          </div>
        </div>

        {/* Right - Login Form */}
        <div className="p-10 lg:p-12 flex flex-col justify-center"
          style={{
            borderLeft: '1px solid hsl(0 0% 100% / 0.06)',
          }}>
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(0 0% 100% / 0.05)', border: '1px solid hsl(0 0% 100% / 0.1)' }}>
              <Hexagon className="w-6 h-6 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-bold tracking-tight">Acesse sua conta</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">Bem-vindo de volta. Digite seus dados para entrar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all glass-input"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-destructive text-sm p-3 rounded-xl"
                style={{ background: 'hsl(0 72% 51% / 0.1)', border: '1px solid hsl(0 72% 51% / 0.2)' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-sm gradient-primary border-0 hover:opacity-90 transition-opacity" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                <>
                  ENTRAR
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Dificuldades no acesso? Contatar o suporte
          </p>
        </div>
      </motion.div>
    </div>
  );
}
