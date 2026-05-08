'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ShoppingBag, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-pink-200 mb-4">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">RafaStore</h1>
          <p className="text-slate-500 font-medium">Bienvenida de nuevo, Rafela</p>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rafastore.com"
                  className="w-full h-12 pl-12 pr-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-slate-800 transform transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              {loading ? 'Entrando...' : 'INICIAR SESIÓN'}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
