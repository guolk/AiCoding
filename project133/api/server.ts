import app from './app.js';
import { initDb } from './db/jsonDb.js';
import { seedData } from './db/seedData.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, './data');

function checkAndSeedData() {
  initDb();
  
  const templateFile = path.join(DATA_DIR, 'templates.json');
  if (!fs.existsSync(templateFile)) {
    console.log('初始化数据库并加载示例数据...');
    seedData();
    console.log('示例数据加载完成！');
  } else {
    console.log('数据库已存在，跳过初始化。');
  }
}

const PORT = process.env.PORT || 3001;

checkAndSeedData();

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
