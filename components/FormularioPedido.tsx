'use client';

import { useState, useEffect } from 'react';
import { Plus, UserPlus, Calculator, Wallet, Link as LinkIcon, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Categoria, Tienda, estimarCostoEnvio, calcularGananciaNeta, calcularSaldoPendiente } from '@/lib/shipping';

export default function FormularioPedido() {
  const [categoria, setCategoria] = useState<Categoria>('Ropa Ligera');
  const [tienda, setTienda] = useState<Tienda>('Shein');
  const [precioCliente, setPrecioCliente] = useState<number>(0);
  const [precioReal, setPrecioReal] = useState<number>(0);
  const [envio, setEnvio] = useState<number>(2.50);
  const [anticipo, setAnticipo] = useState<number>(0);
  const [link, setLink] = useState('');
  
  const [ganancia, setGanancia] = useState<number>(0);
  const [saldo, setSaldo] = useState<number>(0);

  useEffect(() => {
    setEnvio(estimarCostoEnvio(categoria, tienda));
  }, [categoria, tienda]);

  useEffect(() => {
    setGanancia(calcularGananciaNeta(precioCliente, precioReal, envio));
    setSaldo(calcularSaldoPendiente(precioCliente, anticipo));
  }, [precioCliente, precioReal, envio, anticipo]);

  return (
    <div className="space-y-6 glass-card p-6 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-slate-800">Nuevo Pedido</h2>
        </div>
        <button type="button" className="group flex items-center gap-2 text-sm font-semibold text-primary bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-all">
          <UserPlus className="h-4 w-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Producto</label>
            <input 
              type="text" 
              placeholder="Ej: Tenis Nike Air Max"
              className="w-full h-12 px-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none"
            />
          </div>
          <div className="space-y-1.5">
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Precio Cliente</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input 
                type="number" 
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
                value={precioReal || ''}
                onChange={(e) => setPrecioReal(Number(e.target.value))}
                className="w-full h-12 pl-8 pr-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Envío</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input 
                type="number" 
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
                value={anticipo || ''}
                onChange={(e) => setAnticipo(Number(e.target.value))}
                className="w-full h-12 pl-8 pr-4 rounded-2xl border-0 bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none font-bold text-primary"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Foto del Producto</label>
          <div className="w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
            <ImageIcon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Subir o arrastrar imagen</span>
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

      <button className="w-full h-14 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-black text-lg shadow-xl shadow-pink-200 hover:shadow-pink-300 transform transition-all active:scale-95 flex items-center justify-center gap-2">
        <Plus className="h-6 w-6 stroke-[3]" />
        GUARDAR PEDIDO
      </button>
    </div>
  );
}
