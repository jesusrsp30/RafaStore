export type Categoria = 'Calzado' | 'Ropa Ligera' | 'Accesorios' | 'Otro';
export type Tienda = 'Shein' | 'Amazon' | 'Adidas' | 'Otra';

export const ESTIMACIONES_ENVIO: Record<Categoria, number> = {
  'Calzado': 8.00,
  'Ropa Ligera': 2.50,
  'Accesorios': 1.50,
  'Otro': 0.00
};

export function estimarCostoEnvio(categoria: Categoria, tienda: Tienda): number {
  return ESTIMACIONES_ENVIO[categoria] || 0;
}

// Ganancia estimada: usa el envío estimado (antes de saber el real)
export function calcularGananciaEstimada(precioCliente: number, precioCosto: number, envioEstimado: number): number {
  return precioCliente - precioCosto - envioEstimado;
}

// Ganancia real: usa el envío real cuando ya se conoce
// La ganancia incluye lo que cobraste de envío al cliente menos lo que realmente pagaste
export function calcularGananciaReal(precioCliente: number, precioCosto: number, envioCobrado: number, envioReal: number): number {
  // Ganancia = (Precio al cliente - Costo del producto) + (Envío cobrado - Envío real)
  return (precioCliente - precioCosto) + (envioCobrado - envioReal);
}

// Mantener compatibilidad con código existente
export function calcularGananciaNeta(precioCliente: number, precioCosto: number, costoEnvio: number): number {
  return precioCliente - precioCosto - costoEnvio;
}

export function calcularSaldoPendiente(precioCliente: number, anticipo: number): number {
  const saldo = precioCliente - anticipo;
  return saldo > 0 ? saldo : 0;
}

export function getEstadoPago(precioCliente: number, anticipo: number): string {
  if (anticipo <= 0) return 'pendiente';
  if (anticipo >= precioCliente) return 'pagado';
  return 'parcial';
}
