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

-- Tabla de Pedidos (Solicitudes de clientes)
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    compra_id UUID REFERENCES compras(id) ON DELETE SET NULL,
    producto TEXT NOT NULL,
    link_producto TEXT, -- Link de compra
    imagen_url TEXT,    -- URL de la imagen del producto
    tienda TEXT NOT NULL,
    categoria TEXT NOT NULL,
    precio_cliente DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_costo DECIMAL(10,2) NOT NULL DEFAULT 0,
    costo_envio_estimado DECIMAL(10,2) NOT NULL DEFAULT 0, -- Lo que cobras al cliente
    costo_envio_real DECIMAL(10,2) DEFAULT NULL, -- Lo que realmente pagas (se llena cuando llega)
    anticipo DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado_pago TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, pagado, parcial
    estado_pedido TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, en_orden, entregado
    creado_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
CREATE POLICY "Rafela gestiona clientes" ON clientes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Rafela gestiona compras" ON compras FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Rafela gestiona pedidos" ON pedidos FOR ALL USING (auth.role() = 'authenticated');

-- Bucket de Storage para fotos de productos
-- Nota: Esto se configura en el panel de Supabase, pero aquí dejo la referencia.
-- Nombre del bucket sugerido: "productos"
