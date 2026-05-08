'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, Calendar, Tag, Layers, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function VistaConsolidacion() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [fechaCompra, setFechaCompra] = useState('');
  const [tracking, setTracking] = useState('');
  const [tienda, setTienda] = useState('');

  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const client = createClient();
      setSupabase(client);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supabase) {
      fetchPendingOrders();
    }
  }, [supabase]);

  async function fetchPendingOrders() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('id, producto, tienda, precio_costo, clientes(nombre)')
        .is('compra_id', null)
        .order('creado_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
      if (data && data.length > 0) {
        setTienda(data[0].tienda); // Default to first order's shop
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const totalCosto = pedidos
    .filter(p => selectedIds.includes(p.id))
    .reduce((acc, curr) => acc + Number(curr.precio_costo), 0);

  const handleConfirmarCompra = async () => {
    if (!supabase || selectedIds.length === 0) return;
    
    setSaving(true);
    try {
      // 1. Crear la compra consolidada
      const { data: compra, error: errorCompra } = await supabase
        .from('compras')
        .insert([{
          tienda: tienda,
          fecha_compra: fechaCompra || null,
          tracking_number: tracking,
          estado: 'procesando',
          costo_total_envio: 0 // Se puede actualizar después
        }])
        .select()
        .single();

      if (errorCompra) throw errorCompra;

      // 2. Vincular pedidos a esta compra
      const { error: errorUpdate } = await supabase
        .from('pedidos')
        .update({ 
          compra_id: compra.id,
          estado_pedido: 'en_orden' 
        })
        .in('id', selectedIds);

      if (errorUpdate) throw errorUpdate;

      // Limpiar estado
      setSelectedIds([]);
      setFechaCompra('');
      setTracking('');
      await fetchPendingOrders();
      alert('¡Compra consolidada con éxito!');

    } catch (error: any) {
      console.error('Error al consolidar:', error);
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-secondary" /></div>;
  }

  if (pedidos.length === 0) {
    return null; // Ocultar si no hay nada que consolidar
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-3xl border-2 border-secondary/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Consolidar Paquete</h2>
            <p className="text-xs text-slate-500 font-medium">Agrupa pedidos para una sola compra</p>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-2 scrollbar-thin">
          {pedidos.map(pedido => (
            <div 
              key={pedido.id} 
              onClick={() => toggleSelect(pedido.id)}
              className={`p-3 rounded-xl border-2 transition-all flex justify-between items-center group cursor-pointer ${
                selectedIds.includes(pedido.id) 
                  ? 'border-secondary bg-secondary/5' 
                  : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedIds.includes(pedido.id) ? 'bg-secondary border-secondary text-white' : 'border-slate-300'
                }`}>
                  {selectedIds.includes(pedido.id) && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-700">{pedido.clientes?.nombre}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{pedido.producto} • {pedido.tienda}</p>
                </div>
              </div>
              <div className="font-black text-xs text-slate-700">${Number(pedido.precio_costo).toFixed(2)}</div>
            </div>
          ))}
        </div>

        {selectedIds.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Fecha de Compra</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="date" 
                    value={fechaCompra}
                    onChange={(e) => setFechaCompra(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-secondary outline-none text-sm font-medium" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Nro. de Tracking</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="Ej: 1Z999AA1..." 
                    className="w-full h-11 pl-11 pr-4 rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-secondary outline-none text-sm font-medium" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-5 flex justify-between items-center shadow-lg shadow-slate-200">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Inversión</p>
                <p className="text-white text-2xl font-black">${totalCosto.toFixed(2)}</p>
              </div>
              <button 
                onClick={handleConfirmarCompra}
                disabled={saving}
                className="bg-secondary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-400/20 hover:bg-blue-500 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Truck className="h-5 w-5" />}
                <span>{saving ? 'PROCESANDO...' : 'CONFIRMAR COMPRA'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

