'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle2, Truck, ExternalLink, Image as ImageIcon, Loader2, MessageCircle, Send, Edit3, X, DollarSign, ChevronDown, ChevronUp, Package, Calendar, Store, Tag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [envioReal, setEnvioReal] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const client = createClient();
      setSupabase(client);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    
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
  }, [supabase]);

  async function fetchPedidos() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*, clientes(nombre, whatsapp)')
        .order('creado_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Error fetching pedidos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function guardarEnvioReal(pedidoId: string) {
    if (!supabase || !envioReal) return;
    
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ costo_envio_real: parseFloat(envioReal) })
        .eq('id', pedidoId);
      
      if (error) throw error;
      
      setEditingId(null);
      setEnvioReal('');
      fetchPedidos();
    } catch (error) {
      console.error('Error actualizando envío real:', error);
    }
  }

  function startEditing(pedido: any) {
    setEditingId(pedido.id);
    setEnvioReal(pedido.costo_envio_real?.toString() || '');
  }

  function sendWhatsAppMessage(pedido: any, messageType: 'arrived' | 'ready' | 'custom') {
    const whatsapp = pedido.clientes?.whatsapp;
    if (!whatsapp) {
      alert('Este cliente no tiene WhatsApp registrado');
      return;
    }
    
    const cleanNumber = whatsapp.replace(/[^0-9]/g, '');
    const saldoPendiente = (Number(pedido.precio_cliente) - Number(pedido.anticipo)).toFixed(2);
    
    let message = '';
    switch (messageType) {
      case 'arrived':
        message = `Hola ${pedido.clientes?.nombre}! Tu pedido "${pedido.producto}" ya llego. El saldo pendiente es de $${saldoPendiente}. Cuando gustes puedes pasar a recogerlo.`;
        break;
      case 'ready':
        message = `Hola ${pedido.clientes?.nombre}! Tu pedido "${pedido.producto}" esta listo para entrega. Total a pagar: $${saldoPendiente}`;
        break;
      case 'custom':
        message = `Hola ${pedido.clientes?.nombre}! `;
        break;
    }
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, '_blank');
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
          pedidos.map((pedido) => {
            const isExpanded = expandedId === pedido.id;
            const saldoPendiente = Number(pedido.precio_cliente) - Number(pedido.anticipo);
            const gananciaEstimada = Number(pedido.precio_cliente) - Number(pedido.precio_costo);
            const gananciaReal = pedido.costo_envio_real !== null 
              ? gananciaEstimada + (Number(pedido.costo_envio_estimado) - Number(pedido.costo_envio_real))
              : null;
            
            return (
              <div key={pedido.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Header - siempre visible */}
                <div 
                  className="p-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : pedido.id)}
                >
                  <div className="relative h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-50 flex-shrink-0">
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
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-2">{pedido.producto}</p>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        pedido.estado_pago === 'pagado' ? 'bg-green-100 text-green-700' :
                        pedido.estado_pago === 'parcial' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {pedido.estado_pago}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        pedido.estado_pedido === 'entregado' ? 'bg-green-100 text-green-700' :
                        pedido.estado_pedido === 'en_transito' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {pedido.estado_pedido?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-slate-900">${Number(pedido.precio_cliente).toFixed(2)}</div>
                    <div className="text-[10px] text-red-500 font-bold">
                      Debe: ${saldoPendiente.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>
                
                {/* Detalle expandido */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="grid grid-cols-2 gap-4 py-4">
                      {/* Columna izquierda - Info del producto */}
                      <div className="space-y-3">
                        <h5 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                          <Package className="h-4 w-4" /> Detalles del Producto
                        </h5>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Producto:</span>
                            <span className="font-medium text-slate-800 text-right max-w-[60%]">{pedido.producto}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Tienda:</span>
                            <span className="font-medium text-slate-800">{pedido.tienda || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Categoría:</span>
                            <span className="font-medium text-slate-800">{pedido.categoria || '-'}</span>
                          </div>
                          {pedido.link_producto && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Link:</span>
                              <a href={pedido.link_producto} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                Ver producto <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                          {pedido.tracking && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Tracking:</span>
                              <span className="font-medium text-slate-800">{pedido.tracking}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Columna derecha - Info financiera */}
                      <div className="space-y-3">
                        <h5 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                          <DollarSign className="h-4 w-4" /> Información Financiera
                        </h5>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Precio cliente:</span>
                            <span className="font-bold text-slate-800">${Number(pedido.precio_cliente).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Costo producto:</span>
                            <span className="font-medium text-slate-800">${Number(pedido.precio_costo).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Envío cobrado:</span>
                            <span className="font-medium text-slate-800">${Number(pedido.costo_envio_estimado).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Envío real:</span>
                            {editingId === pedido.id ? (
                              <div className="flex items-center gap-1">
                                <div className="relative">
                                  <DollarSign className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={envioReal}
                                    onChange={(e) => setEnvioReal(e.target.value)}
                                    placeholder="0.00"
                                    className="w-20 h-6 pl-5 pr-1 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-primary outline-none"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); guardarEnvioReal(pedido.id); }}
                                  className="p-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingId(null); setEnvioReal(''); }}
                                  className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                {pedido.costo_envio_real !== null ? (
                                  <span className="font-medium text-green-600">${Number(pedido.costo_envio_real).toFixed(2)}</span>
                                ) : (
                                  <span className="text-amber-600">Pendiente</span>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); startEditing(pedido); }}
                                  title="Editar envío real"
                                  className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Anticipo:</span>
                            <span className="font-medium text-green-600">${Number(pedido.anticipo).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                            <span className="text-slate-500">Saldo pendiente:</span>
                            <span className="font-bold text-red-600">${saldoPendiente.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Ganancia:</span>
                            <span className={`font-bold ${gananciaReal !== null ? 'text-green-600' : 'text-slate-600'}`}>
                              ${(gananciaReal !== null ? gananciaReal : gananciaEstimada).toFixed(2)}
                              {gananciaReal === null && <span className="text-[10px] text-slate-400 ml-1">(est.)</span>}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Fechas */}
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 border-t border-slate-200 pt-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Creado: {new Date(pedido.creado_at).toLocaleDateString('es-MX')}
                      </span>
                      {pedido.fecha_compra && (
                        <span className="flex items-center gap-1">
                          <Store className="h-3 w-3" />
                          Comprado: {new Date(pedido.fecha_compra).toLocaleDateString('es-MX')}
                        </span>
                      )}
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        {pedido.clientes?.whatsapp && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); sendWhatsAppMessage(pedido, 'arrived'); }}
                              className="px-3 py-1.5 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-xs font-bold flex items-center gap-1"
                            >
                              <MessageCircle className="h-3.5 w-3.5" /> Notificar llegada
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); sendWhatsAppMessage(pedido, 'ready'); }}
                              className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-xs font-bold flex items-center gap-1"
                            >
                              <Send className="h-3.5 w-3.5" /> Listo para entrega
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

