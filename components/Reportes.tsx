'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BarChart3, TrendingUp, Users, Package, Calendar, Download, Filter, DollarSign, Loader2 } from 'lucide-react';

type Periodo = 'hoy' | 'semana' | 'mes' | 'año' | 'todo';
type TipoReporte = 'general' | 'clientes' | 'pedidos';

export default function Reportes() {
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('general');
  
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);

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
      fetchData();
    }
  }, [supabase, periodo]);

  function getFechaInicio(): Date | null {
    const now = new Date();
    switch (periodo) {
      case 'hoy':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'semana':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        return weekStart;
      case 'mes':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'año':
        return new Date(now.getFullYear(), 0, 1);
      case 'todo':
        return null;
    }
  }

  async function fetchData() {
    if (!supabase) return;
    setLoading(true);
    
    try {
      const fechaInicio = getFechaInicio();
      
      // Fetch pedidos
      let pedidosQuery = supabase.from('pedidos').select('*, clientes(nombre)');
      if (fechaInicio) {
        pedidosQuery = pedidosQuery.gte('creado_at', fechaInicio.toISOString());
      }
      const { data: pedidosData } = await pedidosQuery;
      setPedidos(pedidosData || []);
      
      // Fetch clientes
      const { data: clientesData } = await supabase.from('clientes').select('*');
      setClientes(clientesData || []);
      
      // Fetch pagos
      let pagosQuery = supabase.from('pagos').select('*');
      if (fechaInicio) {
        pagosQuery = pagosQuery.gte('fecha_pago', fechaInicio.toISOString());
      }
      const { data: pagosData } = await pagosQuery;
      setPagos(pagosData || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calcular métricas generales
  const totalPedidos = pedidos.length;
  const pedidosEntregados = pedidos.filter(p => p.estado_pedido === 'entregado').length;
  const pedidosPendientes = pedidos.filter(p => p.estado_pedido === 'pendiente').length;
  const pedidosEnTransito = pedidos.filter(p => p.estado_pedido === 'en_transito').length;
  
  const totalVentas = pedidos.reduce((sum, p) => sum + Number(p.precio_cliente), 0);
  const totalCostos = pedidos.reduce((sum, p) => sum + Number(p.precio_costo), 0);
  const totalEnvios = pedidos.reduce((sum, p) => sum + Number(p.costo_envio_estimado), 0);
  const totalEnviosReal = pedidos.reduce((sum, p) => sum + Number(p.costo_envio_real || p.costo_envio_estimado), 0);
  const gananciaBruta = totalVentas - totalCostos;
  const gananciaNeta = gananciaBruta + (totalEnvios - totalEnviosReal);
  
  const totalCobrado = pedidos.reduce((sum, p) => sum + Number(p.anticipo), 0);
  const totalPorCobrar = totalVentas - totalCobrado;
  
  const pedidosPagados = pedidos.filter(p => p.estado_pago === 'pagado').length;
  const pedidosParciales = pedidos.filter(p => p.estado_pago === 'parcial').length;
  const pedidosSinPagar = pedidos.filter(p => p.estado_pago === 'pendiente').length;

  // Calcular clientes top
  const clientesConPedidos = clientes.map(c => {
    const pedidosCliente = pedidos.filter(p => p.cliente_id === c.id);
    const totalCliente = pedidosCliente.reduce((sum, p) => sum + Number(p.precio_cliente), 0);
    const gananciaCliente = pedidosCliente.reduce((sum, p) => sum + (Number(p.precio_cliente) - Number(p.precio_costo)), 0);
    return {
      ...c,
      pedidos: pedidosCliente.length,
      total: totalCliente,
      ganancia: gananciaCliente
    };
  }).sort((a, b) => b.total - a.total);

  // Agrupar por tienda
  const pedidosPorTienda: {[key: string]: {cantidad: number, total: number}} = {};
  pedidos.forEach(p => {
    const tienda = p.tienda || 'Sin tienda';
    if (!pedidosPorTienda[tienda]) {
      pedidosPorTienda[tienda] = { cantidad: 0, total: 0 };
    }
    pedidosPorTienda[tienda].cantidad++;
    pedidosPorTienda[tienda].total += Number(p.precio_cliente);
  });

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Reportes
        </h2>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="flex rounded-xl bg-slate-100 p-1">
          {(['hoy', 'semana', 'mes', 'año', 'todo'] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                periodo === p ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p === 'hoy' ? 'Hoy' : p === 'semana' ? '7 días' : p === 'mes' ? 'Este mes' : p === 'año' ? 'Este año' : 'Todo'}
            </button>
          ))}
        </div>
        
        <div className="flex rounded-xl bg-slate-100 p-1">
          {(['general', 'clientes', 'pedidos'] as TipoReporte[]).map((t) => (
            <button
              key={t}
              onClick={() => setTipoReporte(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                tipoReporte === t ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'general' ? 'General' : t === 'clientes' ? 'Clientes' : 'Pedidos'}
            </button>
          ))}
        </div>
      </div>

      {/* Reporte General */}
      {tipoReporte === 'general' && (
        <div className="space-y-4">
          {/* Métricas principales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-600 text-[10px] font-bold uppercase mb-1">
                <Package className="h-3 w-3" /> Total Pedidos
              </div>
              <div className="text-2xl font-black text-blue-700">{totalPedidos}</div>
              <div className="text-[10px] text-blue-500 mt-1">
                {pedidosEntregados} entregados / {pedidosPendientes} pendientes
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="flex items-center gap-2 text-green-600 text-[10px] font-bold uppercase mb-1">
                <DollarSign className="h-3 w-3" /> Total Ventas
              </div>
              <div className="text-2xl font-black text-green-700">${totalVentas.toFixed(2)}</div>
              <div className="text-[10px] text-green-500 mt-1">
                Costo: ${totalCostos.toFixed(2)}
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <div className="flex items-center gap-2 text-purple-600 text-[10px] font-bold uppercase mb-1">
                <TrendingUp className="h-3 w-3" /> Ganancia Neta
              </div>
              <div className={`text-2xl font-black ${gananciaNeta >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                ${gananciaNeta.toFixed(2)}
              </div>
              <div className="text-[10px] text-purple-500 mt-1">
                Bruta: ${gananciaBruta.toFixed(2)}
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-600 text-[10px] font-bold uppercase mb-1">
                <DollarSign className="h-3 w-3" /> Por Cobrar
              </div>
              <div className="text-2xl font-black text-amber-700">${totalPorCobrar.toFixed(2)}</div>
              <div className="text-[10px] text-amber-500 mt-1">
                Cobrado: ${totalCobrado.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Estado de pagos */}
          <div className="p-4 rounded-2xl bg-white border border-slate-100">
            <h4 className="font-bold text-slate-700 text-sm mb-3">Estado de Pagos</h4>
            <div className="flex gap-2 h-3 rounded-full overflow-hidden bg-slate-100">
              {pedidosPagados > 0 && (
                <div 
                  className="bg-green-500 rounded-full"
                  style={{ width: `${(pedidosPagados / totalPedidos) * 100}%` }}
                />
              )}
              {pedidosParciales > 0 && (
                <div 
                  className="bg-blue-500 rounded-full"
                  style={{ width: `${(pedidosParciales / totalPedidos) * 100}%` }}
                />
              )}
              {pedidosSinPagar > 0 && (
                <div 
                  className="bg-red-500 rounded-full"
                  style={{ width: `${(pedidosSinPagar / totalPedidos) * 100}%` }}
                />
              )}
            </div>
            <div className="flex justify-between mt-2 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Pagados ({pedidosPagados})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Parciales ({pedidosParciales})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Pendientes ({pedidosSinPagar})
              </span>
            </div>
          </div>

          {/* Por tienda */}
          <div className="p-4 rounded-2xl bg-white border border-slate-100">
            <h4 className="font-bold text-slate-700 text-sm mb-3">Ventas por Tienda</h4>
            <div className="space-y-2">
              {Object.entries(pedidosPorTienda).map(([tienda, data]) => (
                <div key={tienda} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <span className="font-medium text-slate-800 text-sm">{tienda}</span>
                    <span className="text-slate-400 text-xs ml-2">({data.cantidad} pedidos)</span>
                  </div>
                  <span className="font-bold text-slate-800">${data.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reporte por Clientes */}
      {tipoReporte === 'clientes' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-bold uppercase mb-1">
              <Users className="h-3 w-3" /> Total Clientes
            </div>
            <div className="text-2xl font-black text-indigo-700">{clientes.length}</div>
          </div>
          
          <div className="p-4 rounded-2xl bg-white border border-slate-100">
            <h4 className="font-bold text-slate-700 text-sm mb-3">Top Clientes</h4>
            <div className="space-y-2">
              {clientesConPedidos.slice(0, 10).map((cliente, index) => (
                <div key={cliente.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-amber-100 text-amber-700' :
                    index === 1 ? 'bg-slate-200 text-slate-600' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium text-slate-800 text-sm">{cliente.nombre}</span>
                    <span className="text-slate-400 text-xs ml-2">({cliente.pedidos} pedidos)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">${cliente.total.toFixed(2)}</div>
                    <div className="text-[10px] text-green-600">+${cliente.ganancia.toFixed(2)}</div>
                  </div>
                </div>
              ))}
              {clientesConPedidos.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No hay clientes con pedidos en este período</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reporte detallado de Pedidos */}
      {tipoReporte === 'pedidos' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
              <div className="text-xl font-black text-amber-700">{pedidosPendientes}</div>
              <div className="text-[10px] text-amber-600 font-bold">Pendientes</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
              <div className="text-xl font-black text-blue-700">{pedidosEnTransito}</div>
              <div className="text-[10px] text-blue-600 font-bold">En tránsito</div>
            </div>
            <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-center">
              <div className="text-xl font-black text-green-700">{pedidosEntregados}</div>
              <div className="text-[10px] text-green-600 font-bold">Entregados</div>
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-white border border-slate-100">
            <h4 className="font-bold text-slate-700 text-sm mb-3">Detalle de Pedidos ({pedidos.length})</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 text-sm truncate">{pedido.producto}</div>
                    <div className="text-[10px] text-slate-500">{pedido.clientes?.nombre || 'Sin cliente'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      pedido.estado_pedido === 'entregado' ? 'bg-green-100 text-green-700' :
                      pedido.estado_pedido === 'en_transito' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {pedido.estado_pedido?.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-slate-800">${Number(pedido.precio_cliente).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {pedidos.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No hay pedidos en este período</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
