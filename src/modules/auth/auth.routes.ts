import { Router } from 'express'
import { loginController, meController, logoutController } from './auth.controller'
import { authMiddleware } from './auth.middleware'

export const authRoutes = Router()

// público
authRoutes.post('/api/login', loginController)

// protegido (usa cookie)
authRoutes.get('/api/me', authMiddleware, meController)

// logout (opcionalmente protegido)
authRoutes.post('/api/logout', authMiddleware, logoutController)