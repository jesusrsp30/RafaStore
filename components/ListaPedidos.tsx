'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle2, Truck, ExternalLink, Image as ImageIcon, Loader2, MessageCircle, Send, Edit3, X, DollarSign, ChevronDown, ChevronUp, Package, Calendar, Store, Tag, Plus, Trash2, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import RegistroPago from './RegistroPago';

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [envioReal, setEnvioReal] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pedidoItems, setPedidoItems] = useState<{[key: string]: any[]}>({});
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    producto: '',
    tienda: '',
    precio_cliente: '',
    precio_costo: ''
  });
  const [registrandoPago, setRegistrandoPago] = useState<{id: string, saldo: number} | null>(null);

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
        .select('*, clientes(nombre, whatsapp), pedido_items(*)')
        .order('creado_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
      
      // Organizar items por pedido
      const itemsMap: {[key: string]: any[]} = {};
      (data || []).forEach((pedido: any) => {
        itemsMap[pedido.id] = pedido.pedido_items || [];
      });
      setPedidoItems(itemsMap);
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

  async function agregarItem(pedidoId: string) {
    if (!supabase || !newItem.producto) return;
    
    try {
      const { error } = await supabase
        .from('pedido_items')
        .insert({
          pedido_id: pedidoId,
          producto: newItem.producto,
          tienda: newItem.tienda || null,
          precio_cliente: parseFloat(newItem.precio_cliente) || 0,
          precio_costo: parseFloat(newItem.precio_costo) || 0
        });
      
      if (error) throw error;
      
      // Actualizar totales del pedido
      const items = [...(pedidoItems[pedidoId] || []), {
        precio_cliente: parseFloat(newItem.precio_cliente) || 0,
        precio_costo: parseFloat(newItem.precio_costo) || 0
      }];
      const totalCliente = items.reduce((sum, item) => sum + Number(item.precio_cliente), 0);
      const totalCosto = items.reduce((sum, item) => sum + Number(item.precio_costo), 0);
      
      const pedido = pedidos.find(p => p.id === pedidoId);
      await supabase
        .from('pedidos')
        .update({
          precio_cliente: Number(pedido?.precio_cliente || 0) + (parseFloat(newItem.precio_cliente) || 0),
          precio_costo: Number(pedido?.precio_costo || 0) + (parseFloat(newItem.precio_costo) || 0)
        })
        .eq('id', pedidoId);
      
      setAddingItemTo(null);
      setNewItem({ producto: '', tienda: '', precio_cliente: '', precio_costo: '' });
      fetchPedidos();
    } catch (error) {
      console.error('Error agregando item:', error);
    }
  }

  async function eliminarItem(itemId: string, pedidoId: string, item: any) {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('pedido_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      // Actualizar totales del pedido
      const pedido = pedidos.find(p => p.id === pedidoId);
      await supabase
        .from('pedidos')
        .update({
          precio_cliente: Math.max(0, Number(pedido?.precio_cliente || 0) - Number(item.precio_cliente)),
          precio_costo: Math.max(0, Number(pedido?.precio_costo || 0) - Number(item.precio_costo))
        })
        .eq('id', pedidoId);
      
      fetchPedidos();
    } catch (error) {
      console.error('Error eliminando item:', error);
    }
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
      {registrandoPago && (
        <RegistroPago
          pedidoId={registrandoPago.id}
          saldoPendiente={registrandoPago.saldo}
          onClose={() => setRegistrandoPago(null)}
          onSuccess={fetchPedidos}
        />
      )}
      
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
                    {/* Items del pedido */}
                    <div className="py-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                          <Package className="h-4 w-4" /> Artículos del Pedido ({(pedidoItems[pedido.id]?.length || 0) + (pedido.producto ? 1 : 0)})
                        </h5>
                        <button
                          onClick={(e) => { e.stopPropagation(); setAddingItemTo(pedido.id); }}
                          className="px-2 py-1 rounded-lg bg-primary text-white text-xs font-bold flex items-center gap-1 hover:bg-primary/90"
                        >
                          <Plus className="h-3 w-3" /> Agregar
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {/* Producto principal */}
                        {pedido.producto && (
                          <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              {pedido.imagen_url ? (
                                <img src={pedido.imagen_url} alt={pedido.producto} className="object-cover h-full w-full rounded-lg" />
                              ) : (
                                <ImageIcon className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800 text-sm truncate">{pedido.producto}</p>
                              <p className="text-[10px] text-slate-500">{pedido.tienda} - {pedido.categoria}</p>
                            </div>
                            <div className="text-right text-xs">
                              <p className="font-bold text-slate-800">${Number(pedido.precio_costo).toFixed(2)}</p>
                              <p className="text-green-600">${Number(pedido.precio_cliente).toFixed(2)}</p>
                            </div>
                            {pedido.link_producto && (
                              <a href={pedido.link_producto} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary" onClick={(e) => e.stopPropagation()}>
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        )}
                        
                        {/* Items adicionales */}
                        {(pedidoItems[pedido.id] || []).map((item: any) => (
                          <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              {item.imagen_url ? (
                                <img src={item.imagen_url} alt={item.producto} className="object-cover h-full w-full rounded-lg" />
                              ) : (
                                <ImageIcon className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800 text-sm truncate">{item.producto}</p>
                              <p className="text-[10px] text-slate-500">{item.tienda || 'Sin tienda'} {item.cantidad > 1 && `x${item.cantidad}`}</p>
                            </div>
                            <div className="text-right text-xs">
                              <p className="font-bold text-slate-800">${Number(item.precio_costo).toFixed(2)}</p>
                              <p className="text-green-600">${Number(item.precio_cliente).toFixed(2)}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); eliminarItem(item.id, pedido.id, item); }}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        
                        {/* Formulario para agregar item */}
                        {addingItemTo === pedido.id && (
                          <div className="bg-white p-3 rounded-xl border-2 border-dashed border-primary/30 space-y-2">
                            <input
                              type="text"
                              placeholder="Nombre del producto"
                              value={newItem.producto}
                              onChange={(e) => setNewItem({...newItem, producto: e.target.value})}
                              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-primary outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                placeholder="Tienda"
                                value={newItem.tienda}
                                onChange={(e) => setNewItem({...newItem, tienda: e.target.value})}
                                className="px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-primary outline-none"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <input
                                type="number"
                                placeholder="Costo"
                                value={newItem.precio_costo}
                                onChange={(e) => setNewItem({...newItem, precio_costo: e.target.value})}
                                className="px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-primary outline-none"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <input
                                type="number"
                                placeholder="Precio cliente"
                                value={newItem.precio_cliente}
                                onChange={(e) => setNewItem({...newItem, precio_cliente: e.target.value})}
                                className="px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-primary outline-none"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); agregarItem(pedido.id); }}
                                className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setAddingItemTo(null); setNewItem({ producto: '', tienda: '', precio_cliente: '', precio_costo: '' }); }}
                                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-200">
                      {/* Columna izquierda - Info adicional */}
                      <div className="space-y-3">
                        <h5 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                          <Store className="h-4 w-4" /> Información de Envío
                        </h5>
                        
                        <div className="space-y-2 text-xs">
                          {pedido.tracking && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Tracking:</span>
                              <span className="font-medium text-slate-800">{pedido.tracking}</span>
                            </div>
                          )}
                          {pedido.notas && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Notas:</span>
                              <span className="font-medium text-slate-800 text-right max-w-[60%]">{pedido.notas}</span>
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
                        {saldoPendiente > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setRegistrandoPago({ id: pedido.id, saldo: saldoPendiente }); }}
                            className="px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors text-xs font-bold flex items-center gap-1"
                          >
                            <CreditCard className="h-3.5 w-3.5" /> Registrar Pago
                          </button>
                        )}
                        {pedido.clientes?.whatsapp && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); sendWhatsAppMessage(pedido, 'arrived'); }}
                              className="px-3 py-1.5 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-xs font-bold flex items-center gap-1"
                            >
                              <MessageCircle className="h-3.5 w-3.5" /> Notificar
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); sendWhatsAppMessage(pedido, 'ready'); }}
                              className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-xs font-bold flex items-center gap-1"
                            >
                              <Send className="h-3.5 w-3.5" /> Listo
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

