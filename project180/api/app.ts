/**
 * 辩论队管理系统 API 服务器
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
import dashboardRoutes from './routes/dashboard.js'
import topicsRoutes from './routes/topics.js'
import argumentsRoutes from './routes/arguments.js'
import matchesRoutes from './routes/matches.js'
import membersRoutes from './routes/members.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/dashboard', dashboardRoutes)
app.use('/api/topics', topicsRoutes)
app.use('/api/arguments', argumentsRoutes)
app.use('/api/matches', matchesRoutes)
app.use('/api/members', membersRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, _next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: '辩论队管理系统 API 运行正常',
    })
  },
)

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', error)
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
  })
})

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API 路径不存在',
  })
})

export default app
