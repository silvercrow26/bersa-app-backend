export type RealtimeEventType =
  // Caja
  | 'CAJA_ABIERTA'
  | 'CAJA_CERRADA'

  // Catálogo productos
  | 'PRODUCTO_CREATED'
  | 'PRODUCTO_UPDATED'
  | 'PRODUCTO_DELETED'

export interface RealtimeEventPayload {
  type: RealtimeEventType

  /**
   * - sucursalId real → eventos por sucursal (cajas)
   * - 'GLOBAL' → eventos de catálogo (productos)
   */
  sucursalId: string

  // opcionales según evento
  cajaId?: string
  aperturaCajaId?: string

  productoId?: string

  // quién originó el evento (para ignorar eco)
  origenUsuarioId?: string
}