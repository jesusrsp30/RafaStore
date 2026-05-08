'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Package, TrendingUp, Wallet, ArrowDownCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PedidoStats {
  precio_cliente: number | null;
  precio_costo: number | null;
  costo_envio_estimado: number | null;
  costo_envio_real: number | null;
  anticipo: number | null;
  estado_pedido: string | null;
}

interface StatsAccumulator {
  gananciaTotal: number;
  pedidosActivos: number;
  saldoPorCobrar: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState({
    gananciaTotal: 0,
    pedidosActivos: 0,
    saldoPorCobrar: 0
  });
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    // Only create client on the client side
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const client = createClient();
      setSupabase(client);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    
    fetchStats();
    
    // Suscribirse a cambios para actualizar el dashboard
    const channel = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function fetchStats() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('precio_cliente, precio_costo, costo_envio_estimado, costo_envio_real, anticipo, estado_pedido');

      if (error) throw error;

      const results = data.reduce((acc: StatsAccumulator, p: PedidoStats) => {
        const precio = Number(p.precio_cliente);
        const costo = Number(p.precio_costo);
        const envioCobrado = Number(p.costo_envio_estimado); // Lo que cobras al cliente
        const envioReal = p.costo_envio_real !== null ? Number(p.costo_envio_real) : null;
        const ant = Number(p.anticipo);
        
        // Ganancia: Si ya tenemos envío real, calculamos ganancia real
        // Si no, usamos el estimado (asumiendo que cobrarás lo mismo que pagarás)
        if (envioReal !== null) {
          // Ganancia real = (Precio cliente - Costo producto) + (Envío cobrado - Envío real)
          acc.gananciaTotal += (precio - costo) + (envioCobrado - envioReal);
        } else {
          // Ganancia estimada = Precio cliente - Costo producto (el envío se asume neutro)
          acc.gananciaTotal += (precio - costo);
        }
        
        // Pedidos activos (no entregados)
        if (p.estado_pedido !== 'entregado') {
          acc.pedidosActivos += 1;
        }

        // Saldo por cobrar
        acc.saldoPorCobrar += (precio - ant);

        return acc;
      }, { gananciaTotal: 0, pedidosActivos: 0, saldoPorCobrar: 0 });

      setStats(results);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-gradient-to-br from-white to-pink-50/30 p-5 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ganancia Real</span>
          </div>
          <div className="text-3xl font-black text-slate-800">${stats.gananciaTotal.toFixed(2)}</div>
          <p className="text-[10px] text-green-600 font-bold mt-1">Listo para retirar</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <Package className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">En Tránsito</span>
          </div>
          <div className="text-3xl font-black text-slate-800">{stats.pedidosActivos}</div>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Pedidos activos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-slate-900 p-5 shadow-xl flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/10 text-primary">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Saldo por Cobrar</p>
              <p className="text-white text-2xl font-black">${stats.saldoPorCobrar.toFixed(2)}</p>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover:bg-primary transition-colors cursor-pointer">
            <ArrowDownCircle className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

