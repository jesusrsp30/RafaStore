import { Clock, CheckCircle2, Truck, ExternalLink, Image as ImageIcon } from 'lucide-react';

const PEDIDOS_MOCK = [
  { 
    id: 1, 
    cliente: 'Ana García', 
    producto: 'Zapatillas Adidas Ultraboost', 
    tienda: 'Adidas', 
    precio: 120.00, 
    anticipo: 50.00,
    estado: 'pendiente',
    pago: 'parcial',
    link: 'https://adidas.com',
    imagen: null
  },
  { 
    id: 2, 
    cliente: 'Juan Pérez', 
    producto: 'Camiseta Essential Negra', 
    tienda: 'Shein', 
    precio: 25.50, 
    anticipo: 25.50,
    estado: 'comprado',
    pago: 'pagado',
    link: 'https://shein.com',
    imagen: null
  }
];

export default function ListaPedidos() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-slate-800">Control de Pedidos</h3>
        <button className="text-sm font-semibold text-primary">Gestionar Todo</button>
      </div>

      <div className="space-y-3">
        {PEDIDOS_MOCK.map((pedido) => (
          <div key={pedido.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-50">
              {pedido.imagen ? (
                <img src={pedido.imagen} alt={pedido.producto} className="object-cover h-full w-full" />
              ) : (
                <ImageIcon className="h-6 w-6 opacity-50" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-bold text-slate-800 truncate">{pedido.cliente}</h4>
                <a href={pedido.link} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-xs text-slate-500 truncate mb-2">{pedido.producto}</p>
              
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  pedido.pago === 'pagado' ? 'bg-green-100 text-green-700' :
                  pedido.pago === 'parcial' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {pedido.pago}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-600`}>
                  {pedido.tienda}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-black text-slate-900">${pedido.precio.toFixed(2)}</div>
              <div className="text-[10px] text-red-500 font-bold">Debe: ${(pedido.precio - pedido.anticipo).toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
