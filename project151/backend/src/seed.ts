import { initDatabase, runQuery } from './db.js';
import { v4 as uuidv4 } from 'uuid';

async function seedData() {
  await initDatabase();

  await runQuery('DELETE FROM traceability_codes');
  await runQuery('DELETE FROM harvest_records');
  await runQuery('DELETE FROM control_measures');
  await runQuery('DELETE FROM pest_disease_records');
  await runQuery('DELETE FROM pest_diseases');
  await runQuery('DELETE FROM farming_operations');
  await runQuery('DELETE FROM machinery');
  await runQuery('DELETE FROM pesticides');
  await runQuery('DELETE FROM soil_tests');
  await runQuery('DELETE FROM planting_records');
  await runQuery('DELETE FROM plots');

  const plot1Id = uuidv4();
  const plot2Id = uuidv4();
  const plot3Id = uuidv4();
  
  await runQuery(`
    INSERT INTO plots (id, plot_number, area, soil_type, previous_crop, irrigation_method, location, created_at, updated_at)
    VALUES 
      (?, 'A-001', 15.5, '壤土', '小麦', '滴灌', '东区1号地块', ?, ?),
      (?, 'A-002', 20.0, '沙壤土', '玉米', '喷灌', '东区2号地块', ?, ?),
      (?, 'B-001', 12.8, '粘壤土', '水稻', '漫灌', '西区1号地块', ?, ?)
  `, [
    plot1Id, new Date().toISOString(), new Date().toISOString(),
    plot2Id, new Date().toISOString(), new Date().toISOString(),
    plot3Id, new Date().toISOString(), new Date().toISOString()
  ]);
  
  const planting1Id = uuidv4();
  const planting2Id = uuidv4();
  const planting3Id = uuidv4();
  const planting4Id = uuidv4();
  
  await runQuery(`
    INSERT INTO planting_records (id, plot_id, crop_variety, sowing_date, harvest_date, yield, year, notes)
    VALUES 
      (?, ?, '西红柿-粉丽人', '2025-03-15', '2025-07-20', 45000, 2025, '春季大棚种植'),
      (?, ?, '黄瓜-津优1号', '2025-04-01', '2025-08-15', 60000, 2025, '露天种植'),
      (?, ?, '草莓-红颜', '2024-09-10', '2025-05-20', 8000, 2024, '温室大棚'),
      (?, ?, '西红柿-粉丽人', '2024-03-20', '2024-07-25', 42000, 2024, '2024年春季种植')
  `, [
    planting1Id, plot1Id,
    planting2Id, plot2Id,
    planting3Id, plot3Id,
    planting4Id, plot1Id
  ]);
  
  await runQuery(`
    INSERT INTO soil_tests (id, plot_id, test_date, ph, organic_matter, total_nitrogen, available_phosphorus, available_potassium, testing_agency, notes)
    VALUES 
      (?, ?, '2025-02-10', 6.8, 25.5, 1.2, 25.0, 180.0, '县农业技术推广中心', '基肥施用前检测'),
      (?, ?, '2025-02-15', 7.2, 30.0, 1.5, 30.0, 200.0, '县农业技术推广中心', '肥力良好'),
      (?, ?, '2025-02-20', 6.5, 28.0, 1.0, 22.0, 160.0, '县农业技术推广中心', '需要补充钾肥')
  `, [
    uuidv4(), plot1Id,
    uuidv4(), plot2Id,
    uuidv4(), plot3Id
  ]);
  
  const pest1Id = uuidv4();
  const pest2Id = uuidv4();
  const fert1Id = uuidv4();
  const fert2Id = uuidv4();
  
  await runQuery(`
    INSERT INTO pesticides (id, name, brand, active_ingredient, purchase_date, batch_number, type, quantity, unit, notes)
    VALUES 
      (?, '吡虫啉', '拜耳', '吡虫啉 20%', '2025-01-10', 'B202501001', 'pesticide', 50, 'kg', '蚜虫防治'),
      (?, '百菌清', '先正达', '百菌清 75%', '2025-01-15', 'S202501002', 'pesticide', 30, 'kg', '广谱杀菌剂'),
      (?, '复合肥15-15-15', '中化', 'NPK 15-15-15', '2025-01-05', 'F202501001', 'fertilizer', 500, 'kg', '基肥用'),
      (?, '尿素', '中海油', 'N ≥ 46%', '2025-01-08', 'F202501003', 'fertilizer', 300, 'kg', '追肥用')
  `, [
    pest1Id, pest2Id, fert1Id, fert2Id
  ]);
  
  const mach1Id = uuidv4();
  const mach2Id = uuidv4();
  
  await runQuery(`
    INSERT INTO machinery (id, name, model, serial_number, purchase_date, status, notes)
    VALUES 
      (?, '东方红拖拉机', 'LX804', 'SN2023001', '2023-05-10', 'available', '80马力四驱'),
      (?, '久保田插秧机', 'SPV-6CMD', 'SN2024005', '2024-03-15', 'available', '高速乘坐式')
  `, [mach1Id, mach2Id]);
  
  await runQuery(`
    INSERT INTO farming_operations (id, plot_id, operation_type, operation_date, operation_area, pesticide_id, pesticide_quantity, fertilizer_id, fertilizer_quantity, machinery_id, operation_hours, fuel_consumption, operator, cost, notes)
    VALUES 
      (?, ?, '整地', '2025-03-01', 15.5, NULL, NULL, ?, 300, ?, 8, 40, '张三', 1200, '春耕整地'),
      (?, ?, '基肥施用', '2025-03-10', 15.5, NULL, NULL, ?, 200, NULL, NULL, NULL, '李四', 1500, '复合肥基施'),
      (?, ?, '播种', '2025-03-15', 15.5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '王五', 300, '人工移栽'),
      (?, ?, '病虫害防治', '2025-04-20', 15.5, ?, 2.5, NULL, NULL, NULL, NULL, NULL, '赵六', 500, '防治蚜虫'),
      (?, ?, '追肥', '2025-05-10', 15.5, NULL, NULL, ?, 100, NULL, NULL, NULL, '李四', 800, '尿素追施')
  `, [
    uuidv4(), plot1Id, fert1Id, mach1Id,
    uuidv4(), plot1Id, fert1Id,
    uuidv4(), plot1Id,
    uuidv4(), plot1Id, pest1Id,
    uuidv4(), plot1Id, fert2Id
  ]);
  
  const pestDisease1Id = uuidv4();
  const pestDisease2Id = uuidv4();
  
  await runQuery(`
    INSERT INTO pest_diseases (id, name, type, symptoms, common_season, prevention_methods)
    VALUES 
      (?, '蚜虫', '虫害', '叶片卷曲、发黄,分泌蜜露', '春季-夏季', '合理密植、保护天敌、吡虫啉喷雾'),
      (?, '白粉病', '病害', '叶片出现白色粉状物,后期变黄枯死', '夏季-秋季', '通风降湿、百菌清预防、三唑酮治疗')
  `, [pestDisease1Id, pestDisease2Id]);
  
  const pestRecord1Id = uuidv4();
  
  await runQuery(`
    INSERT INTO pest_disease_records (id, plot_id, pest_disease_id, discovery_date, symptoms, affected_area, severity, photos, status, notes)
    VALUES 
      (?, ?, ?, '2025-04-18', '叶片背面发现大量蚜虫,部分叶片卷曲', 8.5, '中等', NULL, 'treated', '发现于西红柿叶片背面'),
      (?, ?, ?, '2025-07-05', '叶片出现白色粉状斑点,逐渐扩大', 3.0, '轻微', NULL, 'monitoring', '白粉病初期症状')
  `, [
    pestRecord1Id, plot1Id, pestDisease1Id,
    uuidv4(), plot2Id, pestDisease2Id
  ]);
  
  await runQuery(`
    INSERT INTO control_measures (id, pest_record_id, measure_type, measure_date, pesticide_id, quantity, description, operator, effect, notes)
    VALUES 
      (?, ?, '化学防治', '2025-04-20', ?, 2.5, '吡虫啉2000倍液喷雾', '赵六', 'good', '2025-04-27复查')
  `, [uuidv4(), pestRecord1Id, pest1Id]);
  
  const harvest1Id = uuidv4();
  const harvest2Id = uuidv4();
  
  await runQuery(`
    INSERT INTO harvest_records (id, plot_id, planting_record_id, harvest_date, yield, quality_grade, unit_price, total_revenue, notes)
    VALUES 
      (?, ?, ?, '2025-07-20', 45000, 'grade1', 3.5, 157500, '品质优良,市场反响好'),
      (?, ?, ?, '2025-08-15', 60000, 'grade2', 2.8, 168000, '产量高,外观稍逊')
  `, [
    harvest1Id, plot1Id, planting1Id,
    harvest2Id, plot2Id, planting2Id
  ]);
  
  await runQuery(`
    INSERT INTO traceability_codes (id, code, harvest_record_id, plot_id, generated_at, batch_number, product_info)
    VALUES 
      (?, 'AGRI-2025A001', ?, ?, ?, 'BATCH-2025-001', ?),
      (?, 'AGRI-2025A002', ?, ?, ?, 'BATCH-2025-002', ?)
  `, [
    uuidv4(), harvest1Id, plot1Id, new Date().toISOString(), JSON.stringify({ product_name: '西红柿-粉丽人', description: '绿色认证，无农药残留' }),
    uuidv4(), harvest2Id, plot2Id, new Date().toISOString(), JSON.stringify({ product_name: '黄瓜-津优1号', description: '无公害农产品' })
  ]);
  
  console.log('✅ 示例数据插入完成');
  console.log(`  - 地块: 3个`);
  console.log(`  - 种植记录: 4条`);
  console.log(`  - 土壤检测: 3条`);
  console.log(`  - 农药化肥: 4种`);
  console.log(`  - 农机: 2台`);
  console.log(`  - 农事操作: 5条`);
  console.log(`  - 病虫害目录: 2种`);
  console.log(`  - 病虫害记录: 2条`);
  console.log(`  - 防治措施: 1条`);
  console.log(`  - 收获记录: 2条`);
  console.log(`  - 追溯码: 2个`);
}

seedData();
