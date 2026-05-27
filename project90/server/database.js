const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'printmanager.db');

function initDB() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database');
    }
  });

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS printers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      model TEXT,
      bed_size TEXT,
      nozzle_diameter REAL DEFAULT 0.4,
      max_nozzle_temp REAL DEFAULT 260,
      max_bed_temp REAL DEFAULT 120,
      total_print_hours REAL DEFAULT 0,
      purchase_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS filaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      type TEXT NOT NULL,
      color TEXT NOT NULL,
      color_hex TEXT,
      diameter REAL DEFAULT 1.75,
      initial_weight REAL DEFAULT 1000,
      current_weight REAL DEFAULT 1000,
      price REAL,
      purchase_date TEXT,
      purchase_link TEXT,
      adhesion_rating INTEGER DEFAULT 3,
      strength_rating INTEGER DEFAULT 3,
      warping_rating INTEGER DEFAULT 3,
      quality_rating INTEGER DEFAULT 3,
      review TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS print_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      stl_source TEXT,
      stl_files TEXT,
      printer_id INTEGER,
      filament_id INTEGER,
      filament_used REAL,
      print_duration REAL,
      layer_height REAL,
      infill_percentage REAL,
      nozzle_temp REAL,
      bed_temp REAL,
      print_speed REAL,
      retraction_distance REAL,
      support_enabled INTEGER DEFAULT 0,
      status TEXT DEFAULT 'completed',
      success_rate REAL DEFAULT 100,
      satisfaction_rating INTEGER DEFAULT 5,
      photo_paths TEXT,
      notes TEXT,
      print_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (printer_id) REFERENCES printers(id),
      FOREIGN KEY (filament_id) REFERENCES filaments(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS failure_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      failure_type TEXT NOT NULL,
      description TEXT,
      root_cause TEXT,
      solution TEXT,
      resolved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES print_projects(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS maintenance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      printer_id INTEGER NOT NULL,
      maintenance_type TEXT NOT NULL,
      description TEXT,
      parts_replaced TEXT,
      cost REAL DEFAULT 0,
      performed_at TEXT NOT NULL,
      print_hours_at_time REAL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS maintenance_milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      printer_id INTEGER NOT NULL,
      milestone_name TEXT NOT NULL,
      interval_hours REAL NOT NULL,
      last_completed_hours REAL DEFAULT 0,
      next_due_hours REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS troubleshooting_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      printer_id INTEGER,
      title TEXT NOT NULL,
      problem_description TEXT,
      troubleshooting_steps TEXT,
      solution TEXT,
      status TEXT DEFAULT 'open',
      occurred_at TEXT,
      resolved_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS slice_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      filament_type TEXT,
      model_type TEXT,
      description TEXT,
      layer_height REAL,
      nozzle_temp REAL,
      bed_temp REAL,
      print_speed REAL,
      wall_speed REAL,
      infill_speed REAL,
      travel_speed REAL,
      wall_thickness REAL,
      wall_line_count INTEGER,
      top_layers INTEGER,
      bottom_layers INTEGER,
      infill_pattern TEXT,
      infill_density REAL,
      retraction_enable INTEGER DEFAULT 1,
      retraction_distance REAL,
      retraction_speed REAL,
      retraction_retract_speed REAL,
      support_enable INTEGER DEFAULT 0,
      support_type TEXT,
      support_density REAL,
      cooling_enable INTEGER DEFAULT 1,
      fan_speed REAL,
      brim_enable INTEGER DEFAULT 0,
      brim_width REAL,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS cost_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      electricity_rate REAL DEFAULT 0.6,
      printer_power REAL DEFAULT 300,
      printer_lifespan_hours REAL DEFAULT 5000,
      printer_cost REAL DEFAULT 2000,
      labor_cost_per_hour REAL DEFAULT 50,
      markup_percentage REAL DEFAULT 50,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.get("SELECT COUNT(*) as count FROM cost_settings", (err, row) => {
      if (row.count === 0) {
        db.run(`INSERT INTO cost_settings 
          (electricity_rate, printer_power, printer_lifespan_hours, printer_cost, labor_cost_per_hour, markup_percentage)
          VALUES (0.6, 300, 5000, 2000, 50, 50)`);
      }
    });

    db.get("SELECT COUNT(*) as count FROM printers", (err, row) => {
      if (row.count === 0) {
        const stmt = db.prepare(`INSERT INTO printers (name, model, bed_size, nozzle_diameter, max_nozzle_temp, max_bed_temp, total_print_hours, purchase_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        stmt.run('Ender 3 V2 #1', 'Creality Ender 3 V2', '220x220x250', 0.4, 260, 100, 320, '2023-06-15', '主力打印机，安装了BLTouch');
        stmt.run('Ender 3 S1 Pro', 'Creality Ender 3 S1 Pro', '220x220x270', 0.4, 300, 110, 156, '2024-01-20', '全金属挤出机，带LED灯');
        stmt.run('Prusa MK4', 'Prusa i3 MK4', '250x210x220', 0.4, 300, 120, 89, '2024-03-10', '高端打印机，打印质量好');
        stmt.finalize();
      }
    });

    db.get("SELECT COUNT(*) as count FROM filaments", (err, row) => {
      if (row.count === 0) {
        const stmt = db.prepare(`INSERT INTO filaments (brand, model, type, color, color_hex, diameter, initial_weight, current_weight, price, purchase_date, adhesion_rating, strength_rating, warping_rating, quality_rating, review, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        stmt.run('Creality', 'Hyper PLA', 'PLA', '白色', '#FFFFFF', 1.75, 1000, 756, 45, '2024-04-01', 4, 4, 5, 5, '打印质量很好，几乎无毛边，适合高精度打印', 'active');
        stmt.run('eSun', 'PLA+', 'PLA', '黑色', '#1a1a1a', 1.75, 1000, 234, 38, '2024-03-15', 4, 5, 4, 4, '强度不错，适合功能件打印', 'active');
        stmt.run('Prusa', 'PETG', 'PETG', '透明红', '#ff4444', 1.75, 1000, 890, 65, '2024-04-10', 3, 5, 3, 4, '韧性好，适合需要弯曲的零件', 'active');
        stmt.run('Creality', 'ABS', 'ABS', '灰色', '#888888', 1.75, 1000, 1000, 55, '2024-05-01', 4, 5, 2, 4, '需要封闭机箱打印，耐高温', 'active');
        stmt.run('eSun', 'Flexible TPU', 'TPU', '蓝色', '#4488ff', 1.75, 500, 156, 80, '2024-02-20', 3, 5, 5, 4, '95A硬度，打印轮子和减震件很好', 'active');
        stmt.run('Polymaker', 'PolyLite PLA', 'PLA', '绿色', '#22aa22', 1.75, 1000, 56, 52, '2024-01-10', 5, 4, 4, 5, '非常优质的PLA，性价比高', 'empty');
        stmt.finalize();
      }
    });

    db.get("SELECT COUNT(*) as count FROM print_projects", (err, row) => {
      if (row.count === 0) {
        const stmt = db.prepare(`INSERT INTO print_projects (name, stl_source, printer_id, filament_id, filament_used, print_duration, layer_height, infill_percentage, nozzle_temp, bed_temp, print_speed, retraction_distance, support_enabled, status, success_rate, satisfaction_rating, notes, print_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        stmt.run('桌面手机支架', 'Thingiverse - thing:4829157', 1, 1, 28.5, 125, 0.2, 20, 205, 60, 60, 2, 0, 'completed', 100, 5, '非常实用的支架，打印效果完美', '2024-05-01');
        stmt.run('Raspberry Pi 4外壳', '自制 - Fusion 360', 1, 2, 45.2, 180, 0.2, 30, 210, 65, 50, 2, 1, 'completed', 95, 4, '需要支撑，拆除后效果不错', '2024-05-03');
        stmt.run('柔性手机壳', 'Cults3D', 2, 5, 35.8, 240, 0.15, 100, 220, 50, 30, 4, 0, 'completed', 100, 5, 'TPU打印需要慢速度，效果很完美', '2024-05-05');
        stmt.run('齿轮组 - 功能测试', '自制', 3, 3, 12.3, 68, 0.15, 100, 240, 80, 40, 1.5, 0, 'completed', 100, 4, 'PETG打印齿轮耐磨性很好', '2024-05-07');
        stmt.run('桌面收纳盒', 'MyMiniFactory', 1, 6, 89.5, 320, 0.28, 15, 200, 60, 80, 2, 0, 'completed', 100, 5, '快速打印，大层高节省时间', '2024-05-08');
        stmt.run('ABS外壳原型', '客户定制', 2, 4, 78.6, 285, 0.2, 25, 245, 100, 50, 2.5, 1, 'failed', 60, 2, '翘边严重，需要更好的床粘附', '2024-05-10');
        stmt.run('龙摆件 - 装饰件', 'Thingiverse', 3, 1, 56.8, 420, 0.12, 20, 205, 60, 40, 1, 1, 'completed', 100, 5, '高细节打印，支撑去除后很完美', '2024-05-12');
        stmt.run('键盘键帽套装', '自制 - Blender', 1, 2, 22.5, 156, 0.16, 100, 210, 65, 35, 2, 0, 'printing', 100, 5, '正在打印中...', '2024-05-15');
        stmt.finalize();
      }
    });

    db.get("SELECT COUNT(*) as count FROM failure_records", (err, row) => {
      if (row.count === 0) {
        const stmt = db.prepare(`INSERT INTO failure_records (project_id, failure_type, description, root_cause, solution, resolved) VALUES (?, ?, ?, ?, ?, ?)`);
        stmt.run(6, 'warping', '打印件四角严重翘边，导致打印失败', 'ABS材料冷却收缩严重，热床温度不足', '提高热床温度至110°C，使用发胶增加粘附，添加边缘(brim)', 1);
        stmt.run(6, 'layer_shift', '打印到一半时出现层错位', '打印速度过快，X轴电机丢步', '降低打印速度至40mm/s，检查皮带张力', 1);
        stmt.finalize();
      }
    });

    db.get("SELECT COUNT(*) as count FROM maintenance_records", (err, row) => {
      if (row.count === 0) {
        const stmt = db.prepare(`INSERT INTO maintenance_records (printer_id, maintenance_type, description, parts_replaced, cost, performed_at, print_hours_at_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
        stmt.run(1, '喷嘴更换', '更换磨损的黄铜喷嘴，打印质量下降', '0.4mm黄铜喷嘴', 15, '2024-04-15', 280, '更换后打印质量明显改善');
        stmt.run(1, '热床调平', '自动调平后手动微调四角', '', 0, '2024-04-20', 295, 'BLTouch工作正常');
        stmt.run(1, '皮带紧张度调整', 'Y轴皮带松弛，出现层纹', '', 0, '2024-05-02', 310, '调整后层纹明显减少');
        stmt.run(2, '风扇检查', '清理散热风扇灰尘', '', 0, '2024-05-05', 140, '风扇运转正常');
        stmt.finalize();
      }
    });

    db.get("SELECT COUNT(*) as count FROM maintenance_milestones", (err, row) => {
      if (row.count === 0) {
        const stmt = db.prepare(`INSERT INTO maintenance_milestones (printer_id, milestone_name, interval_hours, last_completed_hours, next_due_hours) VALUES (?, ?, ?, ?, ?)`);
        stmt.run(1, '风扇检查清洁', 500, 320, 820);
        stmt.run(1, '喷嘴更换', 200, 280, 480);
        stmt.run(1, '热床调平', 100, 320, 420);
        stmt.run(1, '皮带张力检查', 300, 310, 610);
        stmt.run(2, '风扇检查清洁', 500, 150, 650);
        stmt.run(2, '全面润滑保养', 1000, 0, 1000);
        stmt.finalize();
      }
    });

    db.get("SELECT COUNT(*) as count FROM troubleshooting_logs", (err, row) => {
      if (row.count === 0) {
        const stmt = db.prepare(`INSERT INTO troubleshooting_logs (printer_id, title, problem_description, troubleshooting_steps, solution, status, occurred_at, resolved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
        stmt.run(1, '第一层粘附问题', '打印件第一层总是翘边，特别是大尺寸模型', '1. 清洁热床表面 2. 调整Z轴偏移 3. 提高热床温度 4. 检查调平', '使用95%酒精清洁热床，将Z轴偏移调整为-0.05mm', 'resolved', '2024-04-10', '2024-04-11');
        stmt.run(2, '挤出机异响', '打印时挤出机发出咔咔声，挤出不均匀', '1. 检查耗材是否打结 2. 清洁挤出齿轮 3. 调整挤出机张力', '清洁挤出齿轮上的PLA碎屑，重新调整弹簧张力', 'resolved', '2024-04-25', '2024-04-26');
        stmt.run(3, '偶尔层错位', '高速打印时偶尔出现X轴层错位', '1. 降低打印速度 2. 检查电机电流 3. 检查皮带', '待排查中，临时降低打印速度至50mm/s', 'open', '2024-05-08', null);
        stmt.finalize();
      }
    });

    db.get("SELECT COUNT(*) as count FROM slice_profiles", (err, row) => {
      if (row.count === 0) {
        const stmt = db.prepare(`INSERT INTO slice_profiles (name, filament_type, model_type, description, layer_height, nozzle_temp, bed_temp, print_speed, wall_speed, infill_speed, travel_speed, wall_thickness, wall_line_count, top_layers, bottom_layers, infill_pattern, infill_density, retraction_enable, retraction_distance, retraction_speed, retraction_retract_speed, support_enable, support_type, support_density, cooling_enable, fan_speed, brim_enable, brim_width, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        stmt.run('PLA 标准质量', 'PLA', '通用', '适用于大多数PLA打印的平衡配置', 0.2, 205, 60, 60, 40, 80, 120, 1.2, 3, 3, 3, 'Grid', 20, 1, 2, 40, 40, 0, 'None', 15, 1, 100, 0, 5, 1);
        stmt.run('PLA 高质量细层', 'PLA', '高精度', '精细零件和装饰件专用', 0.12, 200, 60, 40, 30, 60, 100, 1.2, 3, 4, 4, 'Gyroid', 25, 1, 1, 35, 35, 0, 'None', 15, 1, 100, 0, 5, 0);
        stmt.run('PLA 快速草稿', 'PLA', '快速打印', '用于原型验证，快速打印', 0.28, 210, 60, 80, 60, 100, 150, 1.2, 2, 2, 2, 'Lines', 10, 1, 2, 50, 50, 0, 'None', 15, 1, 100, 1, 5, 0);
        stmt.run('PETG 标准配置', 'PETG', '通用', 'PETG通用配置，注重层间粘合', 0.2, 240, 80, 50, 30, 70, 100, 1.2, 3, 4, 4, 'Cubic', 20, 1, 1.5, 35, 35, 0, 'None', 15, 1, 70, 0, 5, 0);
        stmt.run('PETG 功能件', 'PETG', '功能件', '高强度PETG功能件配置', 0.2, 245, 85, 40, 25, 60, 80, 1.6, 4, 5, 5, 'Cubic', 50, 1, 1.5, 30, 30, 0, 'None', 15, 0, 50, 1, 8, 0);
        stmt.run('ABS 封闭打印', 'ABS', '功能件', '需要封闭机箱打印，适合工程零件', 0.2, 250, 100, 45, 35, 60, 100, 1.4, 3, 4, 4, 'Grid', 30, 1, 2.5, 40, 40, 1, 'Normal', 20, 0, 0, 1, 10, 0);
        stmt.run('TPU 柔性件', 'TPU', '功能件', '柔性TPU材料专用配置', 0.2, 220, 50, 25, 15, 50, 80, 1.2, 3, 3, 3, 'Gyroid', 100, 1, 4, 15, 15, 0, 'None', 15, 1, 100, 1, 5, 0);
        stmt.finalize();
      }
    });
  });

  return db;
}

module.exports = initDB;