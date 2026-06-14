import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../data/charity.db');

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file: string) => path.join(__dirname, '../../node_modules/sql.js/dist', file),
  });

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    createTables(db);
    seedData(db);
    saveDatabase();
  }

  return db;
}

export function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function createTables(database: Database): void {
  database.exec(`
    CREATE TABLE institutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      mission TEXT,
      operation_mode TEXT,
      transparency_rating INTEGER CHECK (transparency_rating BETWEEN 1 AND 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donation_date DATE NOT NULL,
      institution_id INTEGER REFERENCES institutions(id),
      amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(100),
      purpose VARCHAR(255),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE donation_receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donation_id INTEGER REFERENCES donations(id),
      file_path VARCHAR(500) NOT NULL,
      file_type VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE annual_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_id INTEGER REFERENCES institutions(id),
      year INTEGER NOT NULL,
      financial_summary TEXT,
      project_outcomes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE credibility_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_id INTEGER REFERENCES institutions(id),
      has_public_finance BOOLEAN DEFAULT 0,
      has_third_party_audit BOOLEAN DEFAULT 0,
      assessment_notes TEXT,
      assessment_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE volunteer_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_date DATE NOT NULL,
      hours DECIMAL(5,2) NOT NULL,
      service_type VARCHAR(100),
      beneficiary_group VARCHAR(255),
      institution_id INTEGER REFERENCES institutions(id),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE item_donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donation_date DATE NOT NULL,
      item_name VARCHAR(255) NOT NULL,
      quantity INTEGER DEFAULT 1,
      condition VARCHAR(50),
      institution_id INTEGER REFERENCES institutions(id),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE online_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_date DATE NOT NULL,
      action_type VARCHAR(100),
      initiative_name VARCHAR(255),
      institution_id INTEGER REFERENCES institutions(id),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE project_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donation_id INTEGER REFERENCES donations(id),
      update_date DATE NOT NULL,
      progress_description TEXT NOT NULL,
      status VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE impact_estimates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donation_id INTEGER REFERENCES donations(id),
      people_helped INTEGER,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedData(database: Database): void {
  database.exec(`
    INSERT INTO institutions (name, mission, operation_mode, transparency_rating) VALUES
    ('中国红十字基金会', '弘扬人道、博爱、奉献的红十字精神，保护人的生命和健康', '通过各地红十字分会开展救灾、救护、救助工作', 4),
    ('壹基金', '尽我所能，人人公益', '专注于灾害救助、儿童关怀与发展、公益支持与创新', 5),
    ('联合国儿童基金会', '保护儿童权利，改善儿童生活', '在全球190多个国家和地区开展工作', 5),
    ('中国青少年发展基金会', '通过资助服务、利益表达和社会倡导，帮助青少年提高能力', '实施希望工程等品牌项目', 4),
    ('自然之友', '致力于环境保护和自然教育', '通过环境教育、政策倡导、实地项目推动环保', 4);

    INSERT INTO donations (donation_date, institution_id, amount, payment_method, purpose, notes) VALUES
    ('2026-01-15', 1, 500.00, '微信支付', '新型冠状病毒疫情防控', '春节前疫情捐款'),
    ('2026-02-20', 2, 1000.00, '支付宝', '乡村儿童教育', '每月定期捐款'),
    ('2026-03-08', 3, 200.00, '银行卡', '儿童疫苗项目', '三八节公益活动'),
    ('2026-04-22', 5, 300.00, '微信支付', '环保项目', '地球日活动'),
    ('2026-05-12', 1, 800.00, '支付宝', '汶川地震纪念捐款', '汶川地震18周年纪念'),
    ('2026-06-01', 4, 600.00, '银行卡', '希望工程', '六一儿童节捐款'),
    ('2026-02-20', 2, 1000.00, '支付宝', '乡村儿童教育', '每月定期捐款'),
    ('2026-03-20', 2, 1000.00, '支付宝', '乡村儿童教育', '每月定期捐款'),
    ('2026-04-20', 2, 1000.00, '支付宝', '乡村儿童教育', '每月定期捐款'),
    ('2026-05-20', 2, 1000.00, '支付宝', '乡村儿童教育', '每月定期捐款');

    INSERT INTO annual_reports (institution_id, year, financial_summary, project_outcomes) VALUES
    (2, 2025, '2025年度总收入12.5亿元，其中灾害救助占35%，儿童关怀占40%，公益支持占25%。', '全年帮助受灾群众230万人次，资助乡村儿童15万名，培训乡村教师5000名。'),
    (3, 2025, '2025年度全球筹款82亿美元，中国区筹款3.2亿元人民币。', '在华开展项目惠及儿童约1200万人次，包括疫苗接种、营养改善、教育支持等。'),
    (1, 2025, '2025年度总收入45亿元，救灾支出占60%，救护占20%，救助占20%。', '累计开展应急救援230次，培训急救员500万人次，救助困难群众800万人次。');

    INSERT INTO credibility_assessments (institution_id, has_public_finance, has_third_party_audit, assessment_notes, assessment_date) VALUES
    (1, 1, 1, '财务透明度较高，定期发布审计报告', '2026-01-10'),
    (2, 1, 1, '第三方机构普华永道审计，财务完全公开透明', '2026-02-15'),
    (3, 1, 1, '联合国体系下的机构，审计严格规范', '2026-01-20'),
    (4, 1, 1, '年度报告详细，有独立审计', '2026-03-05'),
    (5, 1, 0, '财务公开但暂无第三方审计', '2026-02-28');

    INSERT INTO volunteer_records (service_date, hours, service_type, beneficiary_group, institution_id, notes) VALUES
    ('2026-01-20', 4.0, '物资整理', '受灾群众', 1, '参与救灾物资分拣打包'),
    ('2026-02-14', 6.0, '支教', '乡村儿童', 4, '线上英语支教课程'),
    ('2026-03-12', 3.0, '环保活动', '社区居民', 5, '植树节植树活动'),
    ('2026-04-02', 5.0, '关怀探访', '自闭症儿童', 2, '星星雨自闭症中心探访'),
    ('2026-05-04', 8.0, '公益跑', '公益组织', 1, '五四青年公益跑志愿者'),
    ('2026-06-10', 4.0, '社区服务', '社区老人', 1, '端午节社区敬老活动');

    INSERT INTO item_donations (donation_date, item_name, quantity, condition, institution_id, notes) VALUES
    ('2026-01-25', '冬季棉被', 10, '全新', 1, '给受灾地区的温暖包'),
    ('2026-03-01', '儿童书籍', 50, '九成新', 4, '乡村小学图书馆建设'),
    ('2026-04-15', '运动服装', 30, '全新', 2, '乡村儿童运动会服装'),
    ('2026-05-20', '文具套装', 100, '全新', 3, '六一儿童节礼物'),
    ('2026-06-05', '环保袋', 200, '全新', 5, '世界环境日宣传活动');

    INSERT INTO online_actions (action_date, action_type, initiative_name, institution_id, notes) VALUES
    ('2026-01-01', '网络签名', '新年公益承诺', 1, '参与新年公益承诺活动'),
    ('2026-02-14', '在线捐赠', '爱在情人节', 2, '线上爱心加倍活动'),
    ('2026-03-22', '知识问答', '世界水日环保知识竞赛', 5, '答题赢取公益基金'),
    ('2026-04-22', '社交媒体传播', '地球日一小时', 5, '朋友圈分享环保承诺'),
    ('2026-05-12', '网络悼念', '汶川地震纪念', 1, '点亮蜡烛悼念遇难者'),
    ('2026-06-01', '在线祝福', '六一儿童节祝福墙', 4, '给乡村儿童写祝福语');

    INSERT INTO project_progress (donation_id, update_date, progress_description, status) VALUES
    (2, '2026-03-01', '捐款已到账，正在采购教学物资', '进行中'),
    (2, '2026-03-15', '物资已采购完成，运往云南山区小学', '进行中'),
    (2, '2026-04-01', '物资已送达学校，200名学生受益', '已完成'),
    (1, '2026-01-20', '捐款已汇入疫情防控专用账户', '已完成'),
    (6, '2026-06-10', '资助10名贫困学生一年学费', '进行中');

    INSERT INTO impact_estimates (donation_id, people_helped, description) VALUES
    (2, 200, '资助乡村小学200名学生的教学物资，包括书籍、文具、体育用品'),
    (1, 50, '为50个家庭提供防疫物资，包括口罩、消毒液、体温计'),
    (3, 100, '为100名儿童提供疫苗接种费用，保护儿童健康'),
    (4, 500, '支持环保项目，预计减少碳排放，惠及社区500居民'),
    (6, 10, '资助10名贫困学生完成一年的学业');
  `);
}

export function getDb(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
