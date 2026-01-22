import { Router } from 'express'
import {
  crearGuiaDespachoController,
} from './guia-despacho.controller'
import {
  descargarPdfGuiaDespacho,
} from './guia-despacho-pdf.controller'
import { requireRole } from '../../auth/requireRole'

const router = Router()

/* Crear / obtener guía */
router.post(
  '/api/guias-despacho/despacho/:despachoId',
  requireRole(['BODEGUERO', 'ADMIN']),
  crearGuiaDespachoController
)

/* PDF de guía */
router.get(
  '/api/guias-despacho/:id/pdf',
  requireRole(['BODEGUERO', 'ENCARGADO', 'ADMIN']),
  descargarPdfGuiaDespacho
)

export default router