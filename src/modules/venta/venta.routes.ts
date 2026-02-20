import { Router } from 'express'

import {
  createVentaPOS,
  anularVentaController,
  getVentaDetalleController,
  listarVentasAdminController,
  getVentaDetalleAdminController,
} from './venta.controller'

import { requireRole } from '../auth/roles'
import { authMiddleware } from '../auth/auth.middleware'

const router = Router()

/* ================================
   VENTAS POS
================================ */

// Crear venta
router.post(
  '/api/ventas',
  authMiddleware,
  createVentaPOS
)

// Anular venta
router.post(
  '/api/ventas/:ventaId/anular',
  authMiddleware,
  anularVentaController
)

// Detalle venta POS
router.get(
  '/api/ventas/:ventaId/detalle',
  authMiddleware,
  getVentaDetalleController
)

/* ================================
   VENTAS ADMIN
================================ */

// Listar ventas (admin)
router.get(
  '/api/admin/ventas',
  authMiddleware,
  requireRole(['ADMIN', 'ENCARGADO']),
  listarVentasAdminController
)

// Detalle venta (admin)
router.get(
  '/api/admin/ventas/:ventaId',
  authMiddleware,
  requireRole(['ADMIN', 'ENCARGADO']),
  getVentaDetalleAdminController
)

export default router