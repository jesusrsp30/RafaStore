import { DollarSign, Package, TrendingUp, Wallet, ArrowDownCircle } from 'lucide-react';

interface StatsProps {
  gananciaTotal: number;
  pedidosActivos: number;
}

export default function DashboardStats({ gananciaTotal, pedidosActivos }: StatsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-gradient-to-br from-white to-pink-50/30 p-5 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ganancia Real</span>
          </div>
          <div className="text-3xl font-black text-slate-800">${gananciaTotal.toFixed(2)}</div>
          <p className="text-[10px] text-green-600 font-bold mt-1">Listo para retirar</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <Package className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">En Tránsito</span>
          </div>
          <div className="text-3xl font-black text-slate-800">{pedidosActivos}</div>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Pedidos activos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-slate-900 p-5 shadow-xl flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/10 text-primary">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Saldo por Cobrar</p>
              <p className="text-white text-2xl font-black">$1,250.00</p>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover:bg-primary transition-colors cursor-pointer">
            <ArrowDownCircle className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
