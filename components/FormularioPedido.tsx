'use client';

import { useState, useEffect } from 'react';
import { Plus, UserPlus, Calculator, Wallet, Link as LinkIcon, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Categoria, Tienda, estimarCostoEnvio, calcularGananciaNeta, calcularSaldoPendiente } from '@/lib/shipping';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from './ImageUpload';

export default function FormularioPedido() {
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const client = createClient();
      setSupabase(client);
    }
  }, []);
  
  // Form states
  const [producto, setProducto] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('Ropa Ligera');
  const [tienda, setTienda] = useState<Tienda>('Shein');
  const [precioCliente, setPrecioCliente] = useState<number>(0);
  const [precioReal, setPrecioReal] = useState<number>(0);
  const [envio, setEnvio] = useState<number>(2.50);
  const [anticipo, setAnticipo] = useState<number>(0);
  const [link, setLink] = useState('');
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [ganancia, setGanancia] = useState<number>(0);
  const [saldo, setSaldo] = useState<number>(0);

  useEffect(() => {
    setEnvio(estimarCostoEnvio(categoria, tienda));
  }, [categoria, tienda]);

  useEffect(() => {
    setGanancia(calcularGananciaNeta(precioCliente, precioReal, envio));
    setSaldo(calcularSaldoPendiente(precioCliente, anticipo));
  }, [precioCliente, precioReal, envio, anticipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Buscar o crear cliente
      let clienteId;
      const { data: clienteExistente, error: errorBusqueda } = await supabase
        .from('clientes')
        .select('id')
        .eq('nombre', nombreCliente.trim())
        .single();

      if (errorBusqueda && errorBusqueda.code !== 'PGRST116') {
        throw errorBusqueda;
      }

      if (clienteExistente) {
        clienteId = clienteExistente.id;
      } else {
        const { data: nuevoCliente, error: errorCreacion } = await supabase
          .from('clientes')
          .insert([{ nombre: nombreCliente.trim() }])
          .select()
          .single();
        
        if (errorCreacion) throw errorCreacion;
        clienteId = nuevoCliente.id;
      }

      // 2. Guardar el pedido
      const { error: errorPedido } = await supabase
        .from('pedidos')
        .insert([{
          cliente_id: clienteId,
          producto: producto,
          link_producto: link,
          imagen_url: imagenUrl,
          tienda: tienda,
          categoria: categoria,
          precio_cliente: precioCliente,
          precio_costo: precioReal,
          costo_envio_estimado: envio,
          anticipo: anticipo,
          estado_pago: anticipo >= precioCliente ? 'pagado' : (anticipo > 0 ? 'parcial' : 'pendiente'),
          estado_pedido: 'pendiente'
        }]);

      if (errorPedido) throw errorPedido;

      setSuccess(true);
      // Reset form
      setProducto('');
      setNombreCliente('');
      setPrecioCliente(0);
      setPrecioReal(0);
      setAnticipo(0);
      setLink('');
      setImagenUrl(null);
      
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      console.error('Error guardando pedido:', err);
      setError(err.message || 'Error al guardar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 glass-card p-6 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-slate-800">Nuevo Pedido</h2>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Nombre del Cliente</label>
            <div className="relative">
              <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                required
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full h-12 pl-11 pr-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Producto</label>
            <input 
              type="text" 
              required
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              placeholder="Ej: Tenis Nike Air Max"
              className="w-full h-12 px-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Imagen del Producto</label>
            <ImageUpload value={imagenUrl || undefined} onChange={setImagenUrl} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Link del Artículo</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="url" 
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full h-12 pl-11 pr-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Tienda</label>
              <select 
                value={tienda}
                onChange={(e) => setTienda(e.target.value as Tienda)}
                className="w-full h-12 px-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none"
              >
                <option value="Shein">Shein</option>
                <option value="Amazon">Amazon</option>
                <option value="Adidas">Adidas</option>
                <option value="Otra">Otra</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Categoría</label>
              <select 
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as Categoria)}
                className="w-full h-12 px-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none"
              >
                <option value="Ropa Ligera">Ropa Ligera</option>
                <option value="Calzado">Calzado</option>
                <option value="Accesorios">Accesorios</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Precio Cliente</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input 
                type="number" 
                step="0.01"
                value={precioCliente || ''}
                onChange={(e) => setPrecioCliente(Number(e.target.value))}
                className="w-full h-12 pl-8 pr-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Costo Real</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input 
                type="number" 
                step="0.01"
                value={precioReal || ''}
                onChange={(e) => setPrecioReal(Number(e.target.value))}
                className="w-full h-12 pl-8 pr-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Envío</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input 
                type="number" 
                step="0.01"
                value={envio || ''}
                onChange={(e) => setEnvio(Number(e.target.value))}
                className="w-full h-12 pl-8 pr-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Anticipo</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input 
                type="number" 
                step="0.01"
                value={anticipo || ''}
                onChange={(e) => setAnticipo(Number(e.target.value))}
                className="w-full h-12 pl-8 pr-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none font-bold text-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
          <div className="flex items-center gap-1 text-green-700 text-[10px] font-bold uppercase mb-1">
            <Calculator className="h-3 w-3" />
            <span>Ganancia Estimada</span>
          </div>
          <div className={`text-xl font-black ${ganancia >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            ${ganancia.toFixed(2)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
          <div className="flex items-center gap-1 text-blue-700 text-[10px] font-bold uppercase mb-1">
            <Wallet className="h-3 w-3" />
            <span>Restante</span>
          </div>
          <div className="text-xl font-black text-blue-700">
            ${saldo.toFixed(2)}
          </div>
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading || !nombreCliente || !producto}
        className={`w-full h-14 rounded-2xl font-black text-lg shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-2 
          ${success 
            ? 'bg-green-500 text-white shadow-green-200' 
            : 'bg-gradient-to-r from-primary to-accent text-white shadow-pink-200 hover:shadow-pink-300'
          } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : success ? (
          <>
            <CheckCircle2 className="h-6 w-6" />
            ¡GUARDADO!
          </>
        ) : (
          <>
            <Plus className="h-6 w-6 stroke-[3]" />
            GUARDAR PEDIDO
          </>
        )}
      </button>
    </form>
  );
}
