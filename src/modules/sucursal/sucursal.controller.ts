import { Request, Response } from 'express'
import SucursalModel from './sucursal.model'
import { inicializarStockPorSucursal } from '../stock/stock.service'

/* =====================================================
   Listar sucursales (ADMIN)
===================================================== */
export const getSucursales = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const sucursales = await SucursalModel.find()
    return res.status(200).json(sucursales)
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: 'Error al obtener las sucursales',
        error: error.message,
      })
    }
    return res.status(500).json({
      message: 'Error desconocido al obtener las sucursales',
    })
  }
}

/* =====================================================
   Obtener sucursal por ID (CONTEXTO OPERATIVO)
   👉 usado por useSucursalContext (front)
===================================================== */
export const getSucursalById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const sucursal = await SucursalModel.findById(
      req.params.id
    )

    if (!sucursal || !sucursal.activo) {
      return res
        .status(404)
        .json({ message: 'Sucursal no encontrada' })
    }

    return res.status(200).json({
      id: sucursal._id,
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      esPrincipal: sucursal.esPrincipal,
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: 'Error al obtener la sucursal',
        error: error.message,
      })
    }
    return res.status(500).json({
      message: 'Error desconocido al obtener la sucursal',
    })
  }
}

/* =====================================================
   Obtener sucursal principal (MAIN)
===================================================== */
export const getSucursalPrincipal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const sucursal = await SucursalModel.findOne({
      esPrincipal: true,
      activo: true,
    })

    if (!sucursal) {
      return res.status(404).json({
        message: 'No existe sucursal principal activa',
      })
    }

    return res.status(200).json({
      id: sucursal._id,
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      esPrincipal: true,
    })
  } catch (error: unknown) {
    console.error(
      '[getSucursalPrincipal]',
      error
    )

    if (error instanceof Error) {
      return res.status(500).json({
        message:
          'Error al obtener sucursal principal',
        error: error.message,
      })
    }

    return res.status(500).json({
      message:
        'Error desconocido al obtener sucursal principal',
    })
  }
}

/* =====================================================
   Crear sucursal (ADMIN)
===================================================== */
export const createSucursal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      nombre,
      direccion,
      telefono,
      esPrincipal = false,
    } = req.body

    if (esPrincipal) {
      // Asegura que solo exista UNA principal
      await SucursalModel.updateMany(
        { esPrincipal: true },
        { $set: { esPrincipal: false } }
      )
    }

    const nuevaSucursal = new SucursalModel({
      nombre,
      direccion,
      telefono,
      esPrincipal,
      activo: true,
    })

    await nuevaSucursal.save()

    // Inicializa stock base
    await inicializarStockPorSucursal(
      nuevaSucursal._id
    )

    return res.status(201).json(nuevaSucursal)
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: 'Error al crear la sucursal',
        error: error.message,
      })
    }
    return res.status(500).json({
      message: 'Error desconocido al crear la sucursal',
    })
  }
}

/* =====================================================
   Actualizar sucursal (ADMIN)
===================================================== */
export const updateSucursal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params
    const {
      nombre,
      direccion,
      telefono,
      activo,
      esPrincipal,
    } = req.body

    const sucursal = await SucursalModel.findById(id)

    if (!sucursal) {
      return res
        .status(404)
        .json({ message: 'Sucursal no encontrada' })
    }

    // No permitir desactivar la principal
    if (sucursal.esPrincipal && activo === false) {
      return res.status(400).json({
        message:
          'No se puede desactivar la sucursal principal',
      })
    }

    // Si se marca como principal → desmarcar las otras
    if (esPrincipal === true) {
      await SucursalModel.updateMany(
        { esPrincipal: true },
        { $set: { esPrincipal: false } }
      )
    }

    sucursal.nombre = nombre ?? sucursal.nombre
    sucursal.direccion =
      direccion ?? sucursal.direccion
    sucursal.telefono =
      telefono ?? sucursal.telefono
    sucursal.activo =
      activo ?? sucursal.activo
    sucursal.esPrincipal =
      esPrincipal ?? sucursal.esPrincipal

    await sucursal.save()

    return res.status(200).json(sucursal)
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: 'Error al actualizar la sucursal',
        error: error.message,
      })
    }
    return res.status(500).json({
      message:
        'Error desconocido al actualizar la sucursal',
    })
  }
}

/* =====================================================
   Desactivar sucursal (ADMIN)
   ⚠️ NO se borra de la BD
===================================================== */
export const deleteSucursal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params

    const sucursal = await SucursalModel.findById(id)

    if (!sucursal) {
      return res
        .status(404)
        .json({ message: 'Sucursal no encontrada' })
    }

    if (sucursal.esPrincipal) {
      return res.status(400).json({
        message:
          'No se puede desactivar la sucursal principal',
      })
    }

    if (!sucursal.activo) {
      return res.status(400).json({
        message: 'La sucursal ya está desactivada',
      })
    }

    sucursal.activo = false
    await sucursal.save()

    return res.status(200).json({
      message: 'Sucursal desactivada correctamente',
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: 'Error al desactivar la sucursal',
        error: error.message,
      })
    }
    return res.status(500).json({
      message:
        'Error desconocido al desactivar la sucursal',
    })
  }
}