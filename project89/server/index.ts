import express from 'express'
import cors from 'cors'
import winesRouter from './routes/wines'
import bottlesRouter from './routes/bottles'
import tastingRouter from './routes/tasting'
import inventoryRouter from './routes/inventory'
import purchasesRouter from './routes/purchases'
import wishlistRouter from './routes/wishlist'
import promotionsRouter from './routes/promotions'
import recommendationsRouter from './routes/recommendations'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.use('/api/wines', winesRouter)
app.use('/api/bottles', bottlesRouter)
app.use('/api/tasting', tastingRouter)
app.use('/api/inventory', inventoryRouter)
app.use('/api/purchases', purchasesRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/promotions', promotionsRouter)
app.use('/api/recommendations', recommendationsRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
