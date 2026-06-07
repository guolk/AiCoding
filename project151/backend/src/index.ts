import express from 'express';
import cors from 'cors';
import { initDatabase } from './db.js';
import plotsRouter from './routes/plots.js';
import farmingRouter from './routes/farming.js';
import pestsRouter from './routes/pests.js';
import harvestRouter from './routes/harvest.js';
import traceabilityRouter from './routes/traceability.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

async function startServer() {
  await initDatabase();
  console.log('✅ 数据库初始化完成');
}
startServer();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '农业生产管理系统 API 运行正常' });
});

app.use('/api/plots', plotsRouter);
app.use('/api/farming', farmingRouter);
app.use('/api/pests', pestsRouter);
app.use('/api/harvest', harvestRouter);
app.use('/api/traceability', traceabilityRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});
