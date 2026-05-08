'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Phone, Trash2, Edit2, X, Check, Loader2, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Cliente {
  id: string;
  nombre: string;
  whatsapp: string | null;
  creado_at: string;
  pedidos_count?: number;
}

export default function ListaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const client = createClient();
      setSupabase(client);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supabase) {
      fetchClientes();
    }
  }, [supabase]);

  async function fetchClientes() {
    if (!supabase) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select(`
          *,
          pedidos:pedidos(count)
        `)
        .order('creado_at', { ascending: false });

      if (error) throw error;
      
      const clientesConCount = data?.map(c => ({
        ...c,
        pedidos_count: c.pedidos?.[0]?.count || 0
      })) || [];
      
      setClientes(clientesConCount);
    } catch (err) {
      console.error('Error fetching clientes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !nombre.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('clientes')
          .update({ nombre: nombre.trim(), whatsapp: whatsapp.trim() || null })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([{ nombre: nombre.trim(), whatsapp: whatsapp.trim() || null }]);
        if (error) throw error;
      }
      
      resetForm();
      fetchClientes();
    } catch (err) {
      console.error('Error saving cliente:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!supabase || !confirm('¿Eliminar este cliente? Se eliminarán también todos sus pedidos.')) return;

    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
      fetchClientes();
    } catch (err) {
      console.error('Error deleting cliente:', err);
    }
  }

  function handleEdit(cliente: Cliente) {
    setEditingId(cliente.id);
    setNombre(cliente.nombre);
    setWhatsapp(cliente.whatsapp || '');
    setShowForm(true);
  }

  function resetForm() {
    setNombre('');
    setWhatsapp('');
    setEditingId(null);
    setShowForm(false);
  }

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.whatsapp && c.whatsapp.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Clientes</h2>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
            {clientes.length}
          </span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancelar' : 'Nuevo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-muted/50 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nombre</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full h-11 px-4 rounded-xl border-0 bg-background ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">WhatsApp</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+504 9999-9999"
                className="w-full h-11 px-4 rounded-xl border-0 bg-background ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || !nombre.trim()}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {editingId ? 'Actualizar' : 'Guardar'}
          </button>
        </form>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border-0 bg-muted/50 ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none text-sm"
        />
      </div>

      {filteredClientes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p className="font-medium">No hay clientes</p>
          <p className="text-sm">Agrega tu primer cliente arriba</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredClientes.map((cliente) => (
            <div
              key={cliente.id}
              className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{cliente.nombre}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    {cliente.whatsapp && (
                      <a 
                        href={`https://wa.me/${cliente.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-green-600 transition-colors"
                      >
                        <Phone className="h-3 w-3" />
                        {cliente.whatsapp}
                      </a>
                    )}
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {cliente.pedidos_count} pedido{cliente.pedidos_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(cliente)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
