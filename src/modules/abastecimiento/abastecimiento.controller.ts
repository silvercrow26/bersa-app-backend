import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { AbastecimientoModel } from './abastecimiento.model'
import { registrarIngresoStock } from './abastecimiento.service'

/* ======================================================
   POST /api/abastecimientos/ingreso
   Registra un ingreso de stock (evento + movimientos)
   MODELO 2026
====================================================== */
export const createIngresoStock = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      sucursalDestinoId,
      items,
      observacion,
    } = req.body

    if (!sucursalDestinoId || !items) {
      return res.status(400).json({
        message: 'Faltan datos obligatorios',
      })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Debe ingresar al menos un producto',
      })
    }

    const abastecimiento =
      await registrarIngresoStock({
        sucursalDestinoId: new Types.ObjectId(
          sucursalDestinoId
        ),
        observacion,
        createdBy: new Types.ObjectId(req.user._id),

        // 👇 SNAPSHOT COMPLETO (NO SE DESCARTA NADA)
        items: items.map((item: any) => ({
          productoId: new Types.ObjectId(
            item.productoId
          ),
          cantidad: item.cantidad,

          proveedorId: item.proveedorId
            ? new Types.ObjectId(item.proveedorId)
            : undefined,
          proveedorNombre: item.proveedorNombre,
        })),
      })

    return res.status(201).json({
      message:
        'Ingreso de stock registrado correctamente',
      data: abastecimiento,
    })
  } catch (error: any) {
    return res.status(400).json({
      message:
        error.message ||
        'Error al registrar ingreso de stock',
    })
  }
}

/* ======================================================
   GET /api/abastecimientos
   Listado de eventos de abastecimiento
   MODELO 2026
====================================================== */
export const getAbastecimientos = async (
  req: Request,
  res: Response
) => {
  try {
    const sucursalId =
      req.query.sucursalId as string
    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 10)
    const skip = (page - 1) * limit

    if (!sucursalId) {
      return res.status(400).json({
        message: 'sucursalId es requerido',
      })
    }

    const filter = {
      sucursalDestinoId: new Types.ObjectId(
        sucursalId
      ),
    }

    const [data, total] = await Promise.all([
      AbastecimientoModel.find(filter)
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limit)

        // 👇 SOLO populate necesario
        .populate(
          'items.productoId',
          'nombre unidadBase'
        )
        .populate('createdBy', 'nombre')

        // NO populate proveedor (es snapshot)
        .lean(),

      AbastecimientoModel.countDocuments(filter),
    ])

    return res.json({
      data,
      total,
      page,
      limit,
    })
  } catch (error) {
    return res.status(500).json({
      message:
        'Error al obtener abastecimientos',
    })
  }
}