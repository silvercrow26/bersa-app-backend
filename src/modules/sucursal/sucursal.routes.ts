import { Router } from 'express'
import {
  getSucursales,
  createSucursal,
  updateSucursal,
  deleteSucursal,
  getSucursalById,
  getSucursalPrincipal,
} from './sucursal.controller'

const router = Router()

/* ===============================
   ⚠️ ESPECÍFICAS PRIMERO
=============================== */
router.get(
  '/api/sucursales/principal',
  getSucursalPrincipal
)

/* ===============================
   CRUD / Contexto
=============================== */
router.get('/api/sucursales', getSucursales)
router.post('/api/sucursales', createSucursal)
router.get('/api/sucursales/:id', getSucursalById)
router.put('/api/sucursales/:id', updateSucursal)
router.delete('/api/sucursales/:id', deleteSucursal)

export default router