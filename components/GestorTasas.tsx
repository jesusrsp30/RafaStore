'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DollarSign, TrendingUp, Calendar, Plus, History, Loader2, Check } from 'lucide-react';

interface TasaCambio {
  id: string;
  moneda: string;
  tasa: number;
  fecha: string;
  activa: boolean;
}

export default function GestorTasas() {
  const [tasas, setTasas] = useState<TasaCambio[]>([]);
  const [historial, setHistorial] = useState<TasaCambio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nuevaTasa, setNuevaTasa] = useState('');
  const [showHistorial, setShowHistorial] = useState(false);
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
      fetchTasas();
    }
  }, [supabase]);

  async function fetchTasas() {
    if (!supabase) return;
    
    try {
      // Obtener tasa activa actual
      const { data: activas, error: errorActivas } = await supabase
        .from('tasas_cambio')
        .select('*')
        .eq('activa', true)
        .order('fecha', { ascending: false });

      if (errorActivas) throw errorActivas;
      setTasas(activas || []);

      // Obtener historial (últimas 30 tasas)
      const { data: hist, error: errorHist } = await supabase
        .from('tasas_cambio')
        .select('*')
        .eq('moneda', 'BS')
        .order('fecha', { ascending: false })
        .limit(30);

      if (errorHist) throw errorHist;
      setHistorial(hist || []);

    } catch (error) {
      console.error('Error fetching tasas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function actualizarTasa() {
    if (!supabase || !nuevaTasa) return;
    
    const tasaNum = parseFloat(nuevaTasa);
    if (isNaN(tasaNum) || tasaNum <= 0) {
      alert('Ingresa una tasa válida');
      return;
    }

    setSaving(true);
    try {
      // Desactivar tasa anterior
      await supabase
        .from('tasas_cambio')
        .update({ activa: false })
        .eq('moneda', 'BS')
        .eq('activa', true);

      // Insertar nueva tasa
      const { error } = await supabase
        .from('tasas_cambio')
        .insert({
          moneda: 'BS',
          tasa: tasaNum,
          activa: true,
          fecha: new Date().toISOString()
        });

      if (error) throw error;

      setNuevaTasa('');
      fetchTasas();
    } catch (error) {
      console.error('Error actualizando tasa:', error);
      alert('Error al actualizar la tasa');
    } finally {
      setSaving(false);
    }
  }

  const tasaActualBS = tasas.find(t => t.moneda === 'BS');

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tasa Actual */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-3xl border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tasa del Día (BS/USD)
          </h3>
          <button
            onClick={() => setShowHistorial(!showHistorial)}
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
          >
            <History className="h-4 w-4" />
            {showHistorial ? 'Ocultar' : 'Ver'} Historial
          </button>
        </div>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-1">Tasa actual</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800">
                {tasaActualBS ? tasaActualBS.tasa.toFixed(2) : '0.00'}
              </span>
              <span className="text-slate-500 font-medium">Bs/$</span>
            </div>
            {tasaActualBS && (
              <p className="text-[10px] text-slate-400 mt-1">
                Actualizada: {new Date(tasaActualBS.fecha).toLocaleDateString('es-VE', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>

        {/* Formulario actualizar tasa */}
        <div className="mt-4 pt-4 border-t border-primary/20">
          <p className="text-xs font-bold text-slate-600 mb-2">Actualizar Tasa</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="number"
                step="0.01"
                value={nuevaTasa}
                onChange={(e) => setNuevaTasa(e.target.value)}
                placeholder="Ej: 36.50"
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              />
            </div>
            <button
              onClick={actualizarTasa}
              disabled={saving || !nuevaTasa}
              className="px-6 h-11 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Historial de Tasas */}
      {showHistorial && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Historial de Tasas (Últimos 30 registros)
          </h4>
          
          {historial.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No hay historial de tasas</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-left text-xs text-slate-500 border-b">
                    <th className="pb-2 font-medium">Fecha</th>
                    <th className="pb-2 font-medium text-right">Tasa (Bs/$)</th>
                    <th className="pb-2 font-medium text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historial.map((tasa) => (
                    <tr key={tasa.id} className="hover:bg-slate-50">
                      <td className="py-2 text-slate-600">
                        {new Date(tasa.fecha).toLocaleDateString('es-VE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-2 text-right font-bold text-slate-800">
                        {tasa.tasa.toFixed(2)}
                      </td>
                      <td className="py-2 text-center">
                        {tasa.activa ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                            Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            Anterior
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Nota informativa */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-700">
          <strong>Nota:</strong> Cada pago registrado en Bolívares guardará la tasa vigente en el momento del registro. 
          Esto permite mantener un historial preciso de los pagos con la tasa real de cada día.
        </p>
      </div>
    </div>
  );
}
