import Header from '@/components/Header';
import DashboardStats from '@/components/DashboardStats';
import FormularioPedido from '@/components/FormularioPedido';
import ListaPedidos from '@/components/ListaPedidos';
import VistaConsolidacion from '@/components/VistaConsolidacion';

export default function Home() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="container mx-auto px-4 pt-6 space-y-8 max-w-2xl">
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h1 className="text-2xl font-black text-foreground">Hola, Rafela 👋</h1>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">PLAN PREMIUM</span>
          </div>
          <DashboardStats gananciaTotal={342.50} pedidosActivos={12} />
        </section>

        <section className="space-y-4">
          <div className="flex gap-2">
            <button className="flex-1 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold">Registro</button>
            <button className="flex-1 py-2 rounded-full bg-muted text-muted-foreground text-sm font-bold">Historial</button>
          </div>
          <FormularioPedido />
        </section>

        <section>
          <VistaConsolidacion />
        </section>

        <section>
          <ListaPedidos />
        </section>
      </div>

      {/* Navegación Inferior (Estilo Mobile App) */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-white/80 backdrop-blur-lg px-6 py-3 flex justify-between items-center z-50">
        <button className="flex flex-col items-center gap-1 text-primary">
          <div className="p-1 rounded-lg bg-primary/10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          <span className="text-[10px] font-bold">Inicio</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          <span className="text-[10px] font-bold">Pedidos</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <span className="text-[10px] font-bold">Clientes</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="text-[10px] font-bold">Ajustes</span>
        </button>
      </nav>
    </main>
  );
}
