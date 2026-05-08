-- Tabla de Items del Pedido (para pedidos con múltiples productos)
CREATE TABLE IF NOT EXISTS pedido_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    producto TEXT NOT NULL,
    link_producto TEXT,
    imagen_url TEXT,
    tienda TEXT,
    categoria TEXT,
    precio_cliente DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_costo DECIMAL(10,2) NOT NULL DEFAULT 0,
    cantidad INTEGER NOT NULL DEFAULT 1,
    creado_at TIMESTAMPTZ DEFAULT now()
);

-- Agregar columna notas a pedidos si no existe
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS notas TEXT;

-- Habilitar RLS
ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;

-- Política de seguridad
CREATE POLICY "Rafela gestiona pedido_items" ON pedido_items FOR ALL USING (auth.role() = 'authenticated');
