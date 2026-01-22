import { Request, Response } from 'express'
import {
  crearGuiaDespachoDesdeDespacho,
} from './guia-despacho.service'

/* =====================================================
   Crear (o obtener) guía de despacho desde un despacho
===================================================== */
export async function crearGuiaDespachoController(
  req: Request,
  res: Response
) {
  try {
    const { despachoId } = req.params
    const { observacion } = req.body

    if (!despachoId) {
      return res.status(400).json({
        message: 'DespachoId es requerido',
      })
    }

    const guia = await crearGuiaDespachoDesdeDespacho(
      despachoId,
      observacion
    )

    res.status(201).json(guia)
  } catch (error: any) {
    res.status(400).json({
      message:
        error.message ??
        'Error al crear guía de despacho',
    })
  }
}