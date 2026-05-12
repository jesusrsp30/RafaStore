'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DollarSign, X, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';

interface RegistroPagoProps {
  pedidoId: string;
  saldoPendiente: number;
  onClose: () => void;
  onSuccess: () => void;
}

type Moneda = 'USD' | 'VES' | 'COP';

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'pago_movil', label: 'Pago Móvil' },
  { value: 'otro', label: 'Otro' },
];

export default function RegistroPago({ pedidoId, saldoPendiente, onClose, onSuccess }: RegistroPagoProps) {
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [monto, setMonto] = useState<string>('');
  const [moneda, setMoneda] = useState<Moneda>('USD');
  const [tasaCambio, setTasaCambio] = useState<string>('1');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [notas, setNotas] = useState('');
  
  const [tasasGuardadas, setTasasGuardadas] = useState<{[key: string]: number}>({
    USD: 1,
    VES: 36.50,
    COP: 4200
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const client = createClient();
        setSupabase(client);
        fetchTasas(client);
      } catch (e) {
        console.log('[v0] Supabase not configured');
      }
    }
  }, []);

  async function fetchTasas(client: ReturnType<typeof createClient>) {
    try {
      const { data, error } = await client
        .from('tasas_cambio')
        .select('moneda, tasa')
        .eq('activa', true);
      
      if (error) throw error;
      
      if (data) {
        const tasas: {[key: string]: number} = { USD: 1 };
        data.forEach((t: any) => {
          tasas[t.moneda] = Number(t.tasa);
        });
        setTasasGuardadas(tasas);
        if (moneda !== 'USD') {
          setTasaCambio(tasas[moneda]?.toString() || '1');
        }
      }
    } catch (error) {
      console.error('Error fetching tasas:', error);
    }
  }

  useEffect(() => {
    if (moneda === 'USD') {
      setTasaCambio('1');
    } else {
      setTasaCambio(tasasGuardadas[moneda]?.toString() || '1');
    }
  }, [moneda, tasasGuardadas]);

  // Calcular monto en USD
  const montoNum = parseFloat(monto) || 0;
  const tasaNum = parseFloat(tasaCambio) || 1;
  const montoUSD = moneda === 'USD' ? montoNum : montoNum / tasaNum;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !monto) return;
    
    setLoading(true);
    try {
      // 1. Registrar el pago
      const { error: pagoError } = await supabase
        .from('pagos')
        .insert({
          pedido_id: pedidoId,
          monto: montoNum,
          moneda: moneda,
          tasa_cambio: tasaNum,
          monto_usd: montoUSD,
          metodo_pago: metodoPago,
          notas: notas || null
        });
      
      if (pagoError) throw pagoError;

      // 2. Actualizar anticipo del pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .select('anticipo, precio_cliente')
        .eq('id', pedidoId)
        .single();
      
      if (pedidoError) throw pedidoError;

      const nuevoAnticipo = Number(pedido.anticipo) + montoUSD;
      const precioCliente = Number(pedido.precio_cliente);
      
      const nuevoEstadoPago = nuevoAnticipo >= precioCliente 
        ? 'pagado' 
        : (nuevoAnticipo > 0 ? 'parcial' : 'pendiente');

      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ 
          anticipo: nuevoAnticipo,
          estado_pago: nuevoEstadoPago
        })
        .eq('id', pedidoId);
      
      if (updateError) throw updateError;

      // 3. Actualizar tasa de cambio si cambió
      if (moneda !== 'USD' && tasaNum !== tasasGuardadas[moneda]) {
        await supabase
          .from('tasas_cambio')
          .update({ activa: false })
          .eq('moneda', moneda)
          .eq('activa', true);
        
        await supabase
          .from('tasas_cambio')
          .insert({ moneda, tasa: tasaNum, activa: true });
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);

    } catch (error: any) {
      console.error('Error registrando pago:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Registrar Pago</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-xs text-amber-600">Saldo pendiente:</p>
          <p className="text-xl font-black text-amber-700">${saldoPendiente.toFixed(2)} USD</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Monto</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full h-12 pl-9 pr-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Moneda</label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value as Moneda)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="USD">USD (Dólar)</option>
                <option value="VES">VES (Bolívar)</option>
                <option value="COP">COP (Peso Col.)</option>
              </select>
            </div>
          </div>

          {moneda !== 'USD' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                Tasa de cambio ({moneda}/USD)
                <RefreshCw className="h-3 w-3 text-slate-400" />
              </label>
              <input
                type="number"
                step="0.0001"
                value={tasaCambio}
                onChange={(e) => setTasaCambio(e.target.value)}
                placeholder="0.00"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-xs text-slate-500">
                {montoNum > 0 && `${montoNum.toFixed(2)} ${moneda} = ${montoUSD.toFixed(2)} USD`}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Método de pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
            >
              {METODOS_PAGO.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Notas (opcional)</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Referencia, comentarios..."
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !monto || success}
            className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              success 
                ? 'bg-green-500 text-white' 
                : 'bg-primary text-white hover:bg-primary/90'
            } disabled:opacity-50`}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : success ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Pago Registrado
              </>
            ) : (
              <>
                <DollarSign className="h-5 w-5" />
                Registrar Pago (${montoUSD.toFixed(2)} USD)
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
