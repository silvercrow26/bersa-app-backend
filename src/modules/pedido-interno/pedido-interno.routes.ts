import { Router } from 'express'
import {
  crearPedido,
  listarPedidosPropios,
  listarPedidosRecibidos,
  prepararPedido,
} from './pedido-interno.controller'
import { requireRole } from '../auth/requireRole'

const router = Router()

/* =====================================================
   Crear pedido interno
   (Sucursal solicita mercadería)
===================================================== */
router.post(
  '/api/pedidos-internos',
  requireRole(['ENCARGADO', 'ADMIN']),
  crearPedido
)

/* =====================================================
   Pedidos creados por mi sucursal
===================================================== */
router.get(
  '/api/pedidos-internos/mios',
  requireRole(['ENCARGADO', 'ADMIN']),
  listarPedidosPropios
)

/* =====================================================
   Pedidos que debo abastecer (MAIN)
===================================================== */
router.get(
  '/api/pedidos-internos/recibidos',
  requireRole(['BODEGUERO', 'ENCARGADO', 'ADMIN']),
  listarPedidosRecibidos
)

/* =====================================================
   Preparar pedido interno
===================================================== */
router.post(
  '/api/pedidos-internos/:id/preparar',
  requireRole(['BODEGUERO', 'ADMIN']),
  prepararPedido
)

export default router