-- Agregar columna costo_envio_real a la tabla pedidos
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS costo_envio_real DECIMAL(10,2) DEFAULT NULL;

-- Comentario para la columna
COMMENT ON COLUMN pedidos.costo_envio_real IS 'Costo real del envío (se llena cuando llega el pedido)';
