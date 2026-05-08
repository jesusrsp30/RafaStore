'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle2, Truck, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPedidos();
    
    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('pedidos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        fetchPedidos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchPedidos() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*, clientes(nombre)')
        .order('creado_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Error fetching pedidos:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-slate-800">Control de Pedidos</h3>
        <button onClick={fetchPedidos} className="text-sm font-semibold text-primary">Actualizar</button>
      </div>

      <div className="space-y-3">
        {pedidos.length === 0 ? (
          <div className="text-center p-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">No hay pedidos registrados aún.</p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-50">
                {pedido.imagen_url ? (
                  <img src={pedido.imagen_url} alt={pedido.producto} className="object-cover h-full w-full" />
                ) : (
                  <ImageIcon className="h-6 w-6 opacity-50" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-bold text-slate-800 truncate">
                    {pedido.clientes?.nombre || 'Cliente desconocido'}
                  </h4>
                  {pedido.link_producto && (
                    <a href={pedido.link_producto} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate mb-2">{pedido.producto}</p>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    pedido.estado_pago === 'pagado' ? 'bg-green-100 text-green-700' :
                    pedido.estado_pago === 'parcial' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {pedido.estado_pago}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-600`}>
                    {pedido.tienda}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-black text-slate-900">${Number(pedido.precio_cliente).toFixed(2)}</div>
                <div className="text-[10px] text-red-500 font-bold">
                  Debe: ${(Number(pedido.precio_cliente) - Number(pedido.anticipo)).toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

