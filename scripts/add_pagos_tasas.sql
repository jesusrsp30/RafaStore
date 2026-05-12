-- Tabla de Pagos (para registrar cada pago recibido)
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    moneda TEXT NOT NULL DEFAULT 'USD', -- USD, VES, COP
    tasa_cambio DECIMAL(15,4) DEFAULT 1, -- Tasa usada al momento del pago
    monto_usd DECIMAL(10,2) NOT NULL, -- Monto convertido a USD
    metodo_pago TEXT DEFAULT 'efectivo', -- efectivo, transferencia, zelle, etc.
    notas TEXT,
    fecha_pago TIMESTAMPTZ DEFAULT now(),
    creado_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Tasas de Cambio (para guardar tasas históricas)
CREATE TABLE IF NOT EXISTS tasas_cambio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moneda TEXT NOT NULL, -- VES, COP
    tasa DECIMAL(15,4) NOT NULL, -- Cuántas unidades de moneda = 1 USD
    fecha TIMESTAMPTZ DEFAULT now(),
    activa BOOLEAN DEFAULT true -- Para saber cuál es la tasa actual
);

-- Habilitar RLS
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasas_cambio ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Gestionar pagos" ON pagos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gestionar tasas" ON tasas_cambio FOR ALL USING (auth.role() = 'authenticated');

-- Insertar tasas iniciales de ejemplo
INSERT INTO tasas_cambio (moneda, tasa, activa) VALUES ('VES', 36.50, true);
INSERT INTO tasas_cambio (moneda, tasa, activa) VALUES ('COP', 4200, true);
