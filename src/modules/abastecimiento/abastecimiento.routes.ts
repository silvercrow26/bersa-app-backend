import { Router } from 'express'
import {
  createIngresoStock,
  getAbastecimientos,
} from './abastecimiento.controller'

const router = Router()

router.post(
  '/api/abastecimientos/ingreso',
  createIngresoStock
)

router.get(
  '/api/abastecimientos',
  getAbastecimientos
)

export default router
