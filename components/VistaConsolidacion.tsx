'use client';

import { useState } from 'react';
import { Package, Truck, Calendar, Tag, Layers, Check } from 'lucide-react';

const PEDIDOS_POR_CONSOLIDAR = [
  { id: 1, cliente: 'Ana García', producto: 'Zapatillas Adidas', tienda: 'Adidas', precio_costo: 60.00 },
  { id: 3, cliente: 'Carlos Ruiz', producto: 'Camiseta Blanca', tienda: 'Adidas', precio_costo: 15.00 },
  { id: 4, cliente: 'Lucía Méndez', producto: 'Bolso Negro', tienda: 'Shein', precio_costo: 12.00 },
];

export default function VistaConsolidacion() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const totalCosto = PEDIDOS_POR_CONSOLIDAR
    .filter(p => selectedIds.includes(p.id))
    .reduce((acc, curr) => acc + curr.precio_costo, 0);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Consolidar Paquete</h2>
            <p className="text-xs text-slate-500 font-medium">Agrupa pedidos para una sola compra</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {PEDIDOS_POR_CONSOLIDAR.map(pedido => (
            <div 
              key={pedido.id} 
              onClick={() => toggleSelect(pedido.id)}
              className={`p-4 rounded-2xl border-2 transition-all flex justify-between items-center group cursor-pointer ${
                selectedIds.includes(pedido.id) 
                  ? 'border-secondary bg-secondary/5' 
                  : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedIds.includes(pedido.id) ? 'bg-secondary border-secondary text-white' : 'border-slate-300'
                }`}>
                  {selectedIds.includes(pedido.id) && <Check className="h-4 w-4 stroke-[3]" />}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-700">{pedido.cliente}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{pedido.producto} • {pedido.tienda}</p>
                </div>
              </div>
              <div className="font-black text-slate-700">${pedido.precio_costo.toFixed(2)}</div>
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
                  <input type="date" className="w-full h-11 pl-11 pr-4 rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-secondary outline-none text-sm font-medium" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Nro. de Tracking</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="Ej: 1Z999AA1..." className="w-full h-11 pl-11 pr-4 rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-secondary outline-none text-sm font-medium" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-5 flex justify-between items-center shadow-lg shadow-slate-200">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Inversión</p>
                <p className="text-white text-2xl font-black">${totalCosto.toFixed(2)}</p>
              </div>
              <button className="bg-secondary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-400/20 hover:bg-blue-500 active:scale-95 transition-all flex items-center gap-2">
                <Truck className="h-5 w-5" />
                <span>CONFIRMAR COMPRA</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
