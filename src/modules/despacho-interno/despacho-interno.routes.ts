import { Router } from 'express'
import {
  despacharPedidoController,
  recibirDespachoController,
  crearDespachoManualController,
  listarDespachosController,
  getDespachoByIdController,
} from './despacho-interno.controller'
import { requireRole } from '../auth/requireRole'

const router = Router()

/* =====================================================
   LISTAR despachos internos
===================================================== */
router.get(
  '/api/despachos-internos',
  requireRole(['ADMIN', 'BODEGUERO', 'ENCARGADO']),
  listarDespachosController
)

/* =====================================================
   Obtener despacho por ID
===================================================== */
router.get(
  '/api/despachos-internos/:id',
  requireRole(['ADMIN', 'BODEGUERO', 'ENCARGADO']),
  getDespachoByIdController
)

/* =====================================================
   Despachar desde pedido
===================================================== */
router.post(
  '/api/despachos-internos/desde-pedido/:pedidoId',
  requireRole(['BODEGUERO', 'ADMIN']),
  despacharPedidoController
)

/* =====================================================
   Despacho manual
===================================================== */
router.post(
  '/api/despachos-internos/manual',
  requireRole(['BODEGUERO', 'ADMIN']),
  crearDespachoManualController
)

/* =====================================================
   Recepción de despacho
===================================================== */
router.post(
  '/api/despachos-internos/:id/recibir',
  requireRole(['ENCARGADO', 'ADMIN']),
  recibirDespachoController
)

export default router