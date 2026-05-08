-- Script de configuración de base de datos para RafaStore (Final)

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    whatsapp TEXT,
    creado_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Compras Consolidadas (Pedidos al proveedor)
CREATE TABLE IF NOT EXISTS compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tienda TEXT NOT NULL, -- Shein, Amazon, Adidas
    fecha_compra DATE,
    tracking_number TEXT,
    costo_total_envio DECIMAL(10,2) DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'procesando', -- procesando, en_transito, recibido
    creado_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Pedidos (Solicitudes de clientes - puede tener múltiples items)
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    compra_id UUID REFERENCES compras(id) ON DELETE SET NULL,
    -- Campos para pedido simple (un solo producto - compatibilidad)
    producto TEXT,
    link_producto TEXT,
    imagen_url TEXT,
    tienda TEXT,
    categoria TEXT,
    precio_cliente DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_costo DECIMAL(10,2) NOT NULL DEFAULT 0,
    -- Envío y pagos
    costo_envio_estimado DECIMAL(10,2) NOT NULL DEFAULT 0, -- Lo que cobras al cliente
    costo_envio_real DECIMAL(10,2) DEFAULT NULL, -- Lo que realmente pagas
    anticipo DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado_pago TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, pagado, parcial
    estado_pedido TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, en_transito, entregado
    notas TEXT, -- Notas adicionales del pedido
    creado_at TIMESTAMPTZ DEFAULT now()
);

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

-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
CREATE POLICY "Rafela gestiona clientes" ON clientes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Rafela gestiona compras" ON compras FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Rafela gestiona pedidos" ON pedidos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Rafela gestiona pedido_items" ON pedido_items FOR ALL USING (auth.role() = 'authenticated');

-- Bucket de Storage para fotos de productos
-- Nota: Esto se configura en el panel de Supabase, pero aquí dejo la referencia.
-- Nombre del bucket sugerido: "productos"
