'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, Package, Calendar, DollarSign, User, Loader2, Image as ImageIcon } from 'lucide-react';

export default function HistorialPedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const client = createClient();
        setSupabase(client);
      } catch (e) {
        console.log('[v0] Supabase not configured');
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (supabase) {
      fetchHistorial();
    }
  }, [supabase]);

  async function fetchHistorial() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*, clientes(nombre, whatsapp)')
        .eq('estado_pedido', 'entregado')
        .order('creado_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Error fetching historial:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calcular totales del historial
  const totalVentas = pedidos.reduce((sum, p) => sum + Number(p.precio_cliente), 0);
  const totalGanancias = pedidos.reduce((sum, p) => {
    const ganancia = Number(p.precio_cliente) - Number(p.precio_costo);
    if (p.costo_envio_real !== null) {
      return sum + ganancia + (Number(p.costo_envio_estimado) - Number(p.costo_envio_real));
    }
    return sum + ganancia;
  }, 0);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen del historial */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
          <div className="text-[10px] font-bold uppercase text-green-600 mb-1">Pedidos Entregados</div>
          <div className="text-2xl font-black text-green-700">{pedidos.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
          <div className="text-[10px] font-bold uppercase text-blue-600 mb-1">Total Ventas</div>
          <div className="text-2xl font-black text-blue-700">${totalVentas.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
          <div className="text-[10px] font-bold uppercase text-purple-600 mb-1">Ganancias</div>
          <div className="text-2xl font-black text-purple-700">${totalGanancias.toFixed(2)}</div>
        </div>
      </div>

      {/* Lista de pedidos entregados */}
      <div className="space-y-3">
        {pedidos.length === 0 ? (
          <div className="text-center p-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay pedidos entregados aún.</p>
            <p className="text-slate-400 text-xs mt-1">Los pedidos marcados como entregados aparecerán aquí.</p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {pedido.imagen_url ? (
                    <img src={pedido.imagen_url} alt={pedido.producto} className="object-cover h-full w-full" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-slate-400" />
                    <span className="font-bold text-slate-800 text-sm truncate">
                      {pedido.clientes?.nombre || 'Cliente'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <Package className="h-3 w-3" />
                    {pedido.producto}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(pedido.creado_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900">${Number(pedido.precio_cliente).toFixed(2)}</div>
                  <div className="text-[10px] text-green-600 font-bold flex items-center gap-1 justify-end">
                    <DollarSign className="h-3 w-3" />
                    +${(Number(pedido.precio_cliente) - Number(pedido.precio_costo)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
