import { Request, Response } from 'express'

import {
  despacharPedidoInterno,
  crearDespachoManual,
  recibirDespachoInterno,
  listarDespachosInternos,
} from './despacho-interno.service'
import { DespachoInternoModel } from './despacho-interno.model'

/* =====================================================
   Despachar pedido interno preparado
===================================================== */
export async function despacharPedidoController(
  req: Request,
  res: Response
) {
  try {
    const despacho = await despacharPedidoInterno(
      req.params.pedidoId,
      req.user!.sucursalId
    )

    res.status(201).json(despacho)
  } catch (error: any) {
    res.status(400).json({
      message: error.message ?? 'Error al despachar pedido interno',
    })
  }
}

/* =====================================================
   Despacho manual / urgente (sin pedido)
===================================================== */
export async function crearDespachoManualController(
  req: Request,
  res: Response
) {
  try {
    const { sucursalDestinoId, items, observacion } = req.body

    if (!sucursalDestinoId) {
      return res.status(400).json({
        message: 'Sucursal destino es requerida',
      })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'El despacho debe contener al menos un item',
      })
    }

    const despacho = await crearDespachoManual({
      sucursalOrigenId: req.user!.sucursalId,
      sucursalDestinoId,
      items,
      observacion,
    })

    res.status(201).json(despacho)
  } catch (error: any) {
    res.status(400).json({
      message: error.message ?? 'Error al crear despacho manual',
    })
  }
}

/* =====================================================
   Recepción de despacho
===================================================== */
export async function recibirDespachoController(
  req: Request,
  res: Response
) {
  try {
    const { items, observacion } = req.body

    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: 'Items recibidos inválidos',
      })
    }

    await recibirDespachoInterno(
      req.params.id,
      req.user!.sucursalId,
      items,
      observacion
    )

    res.json({
      ok: true,
      message: 'Despacho recibido correctamente',
    })
  } catch (error: any) {
    res.status(400).json({
      message: error.message ?? 'Error al recibir despacho',
    })
  }
}

/* =====================================================
   Listar despachos internos
===================================================== */
export async function listarDespachosController(
  req: Request,
  res: Response
) {
  const despachos = await listarDespachosInternos({
    rol: req.user!.rol,
    sucursalId: req.user!.sucursalId,
  })

  res.json(despachos)
}

/* =====================================================
   Obtener despacho por ID
===================================================== */
export async function getDespachoByIdController(
  req: Request,
  res: Response
) {
  const despacho = await DespachoInternoModel.findById(
    req.params.id
  )
    .populate('sucursalOrigenId', 'nombre')
    .populate('sucursalDestinoId', 'nombre')

  if (!despacho) {
    return res
      .status(404)
      .json({ message: 'Despacho no encontrado' })
  }

  res.json(despacho)
}