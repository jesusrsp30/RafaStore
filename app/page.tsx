'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import DashboardStats from '@/components/DashboardStats';
import FormularioPedido from '@/components/FormularioPedido';
import ListaPedidos from '@/components/ListaPedidos';
import VistaConsolidacion from '@/components/VistaConsolidacion';
import ListaClientes from '@/components/ListaClientes';
import { createClient } from '@/lib/supabase/client';

type Tab = 'inicio' | 'pedidos' | 'clientes' | 'ajustes';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setSupabase(createClient());
    }
  }, []);

  async function insertarDatosPrueba() {
    if (!supabase) return;
    setLoadingDemo(true);
    try {
      // Crear cliente de prueba
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .insert([{ nombre: 'María García', whatsapp: '5215512345678' }])
        .select()
        .single();
      
      if (clienteError) throw clienteError;

      // Crear pedidos de prueba
      const pedidos = [
        {
          cliente_id: cliente.id,
          producto: 'Tenis Nike Air Max',
          tienda: 'Amazon',
          categoria: 'Calzado',
          precio_cliente: 150,
          precio_costo: 95,
          costo_envio_estimado: 12,
          anticipo: 75,
          estado_pago: 'parcial',
          estado_pedido: 'en_transito'
        },
        {
          cliente_id: cliente.id,
          producto: 'Blusa Shein Floral',
          tienda: 'Shein',
          categoria: 'Ropa Ligera',
          precio_cliente: 45,
          precio_costo: 22,
          costo_envio_estimado: 5,
          anticipo: 45,
          estado_pago: 'pagado',
          estado_pedido: 'pendiente'
        }
      ];

      const { error: pedidosError } = await supabase.from('pedidos').insert(pedidos);
      if (pedidosError) throw pedidosError;

      alert('Datos de prueba insertados correctamente. Ve a Pedidos para verlos.');
      setActiveTab('pedidos');
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoadingDemo(false);
    }
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="container mx-auto px-4 pt-6 space-y-8 max-w-2xl">
        {activeTab === 'inicio' && (
          <>
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h1 className="text-2xl font-black text-foreground">Hola, Rafela</h1>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">PLAN PREMIUM</span>
              </div>
              <DashboardStats />
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
          </>
        )}

        {activeTab === 'pedidos' && (
          <section>
            <ListaPedidos />
          </section>
        )}

        {activeTab === 'clientes' && (
          <section>
            <ListaClientes />
          </section>
        )}

        {activeTab === 'ajustes' && (
          <section className="space-y-4">
            <h1 className="text-2xl font-black text-foreground">Ajustes</h1>
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="font-medium">Nombre del negocio</span>
                <span className="text-muted-foreground">RafaStore</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="font-medium">Plan</span>
                <span className="text-primary font-bold">Premium</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="font-medium">Versión</span>
                <span className="text-muted-foreground">1.0.0</span>
              </div>
            </div>
            
            {/* Botón para insertar datos de prueba */}
            <button
              onClick={insertarDatosPrueba}
              disabled={loadingDemo || !supabase}
              className="w-full py-3 px-4 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingDemo ? 'Insertando...' : 'Insertar Datos de Prueba'}
            </button>
          </section>
        )}
      </div>

      {/* Navegación Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-white/80 backdrop-blur-lg px-6 py-3 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab('inicio')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'inicio' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'inicio' ? 'bg-primary/10' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          <span className="text-[10px] font-bold">Inicio</span>
        </button>
        <button 
          onClick={() => setActiveTab('pedidos')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'pedidos' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'pedidos' ? 'bg-primary/10' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <span className="text-[10px] font-bold">Pedidos</span>
        </button>
        <button 
          onClick={() => setActiveTab('clientes')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'clientes' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'clientes' ? 'bg-primary/10' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <span className="text-[10px] font-bold">Clientes</span>
        </button>
        <button 
          onClick={() => setActiveTab('ajustes')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'ajustes' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'ajustes' ? 'bg-primary/10' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <span className="text-[10px] font-bold">Ajustes</span>
        </button>
      </nav>
    </main>
  );
}
