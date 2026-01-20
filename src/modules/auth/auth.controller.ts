import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { UsuarioModel } from '../usuario/usuario.model'

/**
 * Login:
 * - Valida credenciales
 * - Firma JWT mínimo (NO meter datos de perfil)
 * - Devuelve User completo al frontend
 */
export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const usuario = await UsuarioModel.findOne({ email, activo: true })
  if (!usuario) {
    return res.status(401).json({ message: 'Credenciales inválidas' })
  }

  const ok = await bcrypt.compare(password, usuario.passwordHash)
  if (!ok) {
    return res.status(401).json({ message: 'Credenciales inválidas' })
  }

  const token = jwt.sign(
    {
      _id: usuario._id,
      rol: usuario.rol,
      sucursalId: usuario.sucursalId,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  )

  // Cookie = única fuente de auth
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // true en prod
  })

  res.json({
    user: {
      _id: usuario._id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      sucursalId: usuario.sucursalId,
    },
  })
}

/**
 * /me
 * Fuente de verdad post-refresh
 * SIEMPRE devuelve User completo
 */
export const meController = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'No autenticado' })
    }

    const usuario = await UsuarioModel.findById(req.user._id)
      .select('_id nombre rol sucursalId')
      .lean()

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json({
      user: usuario,
    })
  } catch (error) {
    console.error('[ME]', error)
    res.status(500).json({ message: 'Error interno' })
  }
}

export const logoutController = (_req: Request, res: Response) => {
  res.clearCookie('token')
  res.json({ ok: true })
}