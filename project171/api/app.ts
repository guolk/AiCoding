/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import institutionsRoutes from './routes/institutions.js'
import donationsRoutes from './routes/donations.js'
import volunteerRoutes from './routes/volunteer.js'
import itemsRoutes from './routes/items.js'
import onlineActionsRoutes from './routes/online-actions.js'
import progressRoutes from './routes/progress.js'
import impactRoutes from './routes/impact.js'
import reportRoutes from './routes/report.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/institutions', institutionsRoutes)
app.use('/api/donations', donationsRoutes)
app.use('/api/volunteer', volunteerRoutes)
app.use('/api/items', itemsRoutes)
app.use('/api/online-actions', onlineActionsRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/impact', impactRoutes)
app.use('/api/report', reportRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
