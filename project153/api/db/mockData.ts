import { getDb, saveDatabase } from './index.js';

export function initMockData(): void {
  const db = getDb();
  
  const result = db.exec('SELECT COUNT(*) as count FROM relics')[0];
  const count = result?.values[0]?.[0] as number;
  
  if (count > 0) {
    console.log('Mock data already exists, skipping initialization');
    return;
  }
  
  console.log('Initializing mock data...');
  
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString();
  
  db.run(`
    INSERT INTO relics (id, name, category, era, material, decoration, inscription, 
      excavate_location, current_location, relic_number,
      dimension_height, dimension_width, dimension_length, dimension_diameter, dimension_weight, dimension_unit,
      created_at, updated_at)
    VALUES 
      ('relic-001', '司母戊鼎', '青铜器', '商代晚期', '青铜', '饕餮纹、云雷纹', '司母戊三字铭文', 
       '河南安阳武官村', '中国国家博物馆', 'GB001', 133, 110, 79, null, 832.84, 'cm', ?, ?),
      ('relic-002', '四羊方尊', '青铜器', '商代晚期', '青铜', '四羊装饰、蕉叶纹', '无铭文', 
       '湖南宁乡县', '中国国家博物馆', 'GB002', 58.3, null, null, 34.5, 34.5, 'cm', ?, ?),
      ('relic-003', '莲鹤方壶', '青铜器', '春秋时期', '青铜', '莲瓣、立鹤、龙形耳', '无铭文', 
       '河南新郑李家楼', '故宫博物院', 'GB003', 126, 30.5, 54, null, 64.28, 'cm', ?, ?),
      ('relic-004', '越王勾践剑', '青铜器', '春秋晚期', '青铜', '菱形暗格纹、鸟篆铭文', '越王勾践自作用剑', 
       '湖北江陵望山楚墓', '湖北省博物馆', 'GB004', 55.7, null, null, 4.6, 0.875, 'cm', ?, ?),
      ('relic-005', '汝窑天青釉洗', '瓷器', '北宋', '瓷', '素面无纹', '无铭文', 
       '清宫旧藏', '台北故宫博物院', 'GB005', 3.5, null, null, 13.8, null, 'cm', ?, ?)
  `, [now, now, yesterday, yesterday, yesterday, yesterday, twoDaysAgo, twoDaysAgo, twoDaysAgo, twoDaysAgo]);
  
  const photoTypes = ['front', 'side', 'detail', 'rubbing'];
  const photoCaptions = ['正面视图', '侧面视图', '局部细节', '铭文拓片'];
  
  const relicIds = ['relic-001', 'relic-002', 'relic-003', 'relic-004', 'relic-005'];
  let photoId = 1;
  
  relicIds.forEach((relicId, idx) => {
    const photosToAdd = idx === 0 ? 4 : 2;
    for (let i = 0; i < photosToAdd; i++) {
      const type = photoTypes[i % 4];
      const caption = photoCaptions[i % 4];
      const prompt = encodeURIComponent(`ancient Chinese ${type === 'rubbing' ? 'rubbing' : 'artifact'} photography, ${type} view, museum quality, ${idx < 2 ? 'bronze' : idx < 4 ? 'bronze sword' : 'porcelain'} artifact, plain background`);
      const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square`;
      
      db.run(`
        INSERT INTO relic_photos (id, relic_id, type, url, caption, upload_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [`photo-${photoId++}`, relicId, type, imageUrl, caption, now]);
    }
  });
  
  db.run(`
    INSERT INTO research_notes (id, relic_id, title, content, personal_insights, tags, created_at, updated_at)
    VALUES 
      ('note-001', 'relic-001', '司母戊鼎铸造工艺研究', 
       '本文通过对司母戊鼎的合金成分分析和铸造痕迹观察，探讨商代晚期青铜铸造的技术水平。',
       '结合考古发掘资料，我认为司母戊鼎采用了分铸法与浑铸法相结合的工艺，这代表了商代青铜铸造的最高水平。鼎身的饕餮纹布局严谨，显示出当时工匠已掌握成熟的图案设计能力。',
       '["铸造工艺","商代","青铜器"]', ?, ?),
      ('note-002', 'relic-002', '四羊方尊的造型艺术研究',
       '四羊方尊以其独特的四羊装饰著称于世，是商代青铜艺术的巅峰之作。',
       '四羊方尊的羊角采用预先铸造后嵌入的方法，这种分铸技术在商代晚期达到了很高的水平。羊的形象写实生动，反映了商代对动物造型的高度把握能力。',
       '["造型艺术","分铸工艺","商代"]', ?, ?),
      ('note-003', 'relic-004', '越王勾践剑不锈之谜',
       '越王勾践剑出土时依然锋利如新，其防锈技术一直是学界研究的焦点。',
       '通过电子探针分析，剑表面含有较高的铬元素，这可能是经过特殊的表面处理。但也有学者认为是墓葬环境造成的自然现象，这一问题仍需更多证据来定论。',
       '["防锈技术","冶金史","春秋时期"]', ?, ?)
  `, [yesterday, yesterday, twoDaysAgo, twoDaysAgo, twoDaysAgo, twoDaysAgo]);
  
  db.run(`
    INSERT INTO "references" (id, note_id, title, author, publication, year, page, excerpt, doi)
    VALUES 
      ('ref-001', 'note-001', '商周青铜器铸造工艺研究', '李济', '考古学报', 1955, '第3期第15-28页', 
       '商代青铜铸造已达到相当高的水平，分铸技术的应用是其重要标志。', null),
      ('ref-002', 'note-001', '司母戊鼎的合金成分分析', '苏秉琦', '文物', 1976, '第7期第3-9页',
       '经分析，司母戊鼎含铜84.77%、锡11.64%、铅2.79%，符合周礼考工记的记载。', '10.1234/abc'),
      ('ref-003', 'note-002', '中国青铜艺术史', '张光直', '联经出版', 1983, '第112-118页',
       '四羊方尊代表了商代青铜铸造与艺术的完美结合。', null),
      ('ref-004', 'note-003', '越王勾践剑表面分析报告', '北京钢铁学院', '文物', 1978, '第2期第45-50页',
       '剑表面检测到铬元素，可能经过人工氧化处理。', null)
  `);
  
  db.run(`
    INSERT INTO viewpoints (id, note_id, scholar, aspect, content, evidence, confidence)
    VALUES 
      ('vp-001', 'note-001', '李济', 'dating', '司母戊鼎铸造于商王武丁时期', 
       '根据铭文\"司母戊\"推断为武丁配偶妇井的祭器', 'high'),
      ('vp-002', 'note-001', '郭沫若', 'dating', '可能铸造于商王祖庚或祖甲时期', 
       '从字体风格看略晚于武丁时期', 'medium'),
      ('vp-003', 'note-001', '张光直', 'usage', '用于祭祀祖先的礼器', 
       '铭文内容和出土地点均支持此说', 'high'),
      ('vp-004', 'note-003', '北京钢铁学院', 'origin', '采用了人工铬化处理技术',
       '表面检测到铬元素分布', 'medium'),
      ('vp-005', 'note-003', '复旦大学', 'origin', '是墓葬环境造成的自然现象',
       '实验室模拟土壤环境可产生类似效果', 'medium')
  `);
  
  db.run(`
    INSERT INTO type_analysis (id, name, type, description, relic_ids, analysis_data, created_at)
    VALUES 
      ('analysis-001', '商代青铜礼器型制演变', 'evolution', 
       '分析从商代早期到晚期青铜礼器的型制变化规律',
       '["relic-001","relic-002"]',
       '{"periods":[{"name":"商代早期","features":"器形薄小,纹饰简单"},{"name":"商代中期","features":"器形增大,纹饰繁复"},{"name":"商代晚期","features":"器形厚重,铭文出现"}]}',
       ?),
      ('analysis-002', '商周青铜器与瓷器比较研究', 'comparison',
       '比较青铜器与瓷器在礼器功能上的异同',
       '["relic-001","relic-005"]',
       '{"criteria":["material","purpose","symbolism","production"],"comparisons":[{"aspect":"材质","bronze":"铜锡铅合金","porcelain":"高岭土烧制"}]}',
       ?)
  `, [yesterday, yesterday]);
  
  db.run(`
    INSERT INTO materials (id, type, title, description, file_path, metadata, created_at)
    VALUES 
      ('mat-001', 'pdf', '安阳殷墟发掘报告(1928-1937)', '中央研究院历史语言研究所发表的殷墟发掘报告',
       '/uploads/reports/anyang_report.pdf',
       '{"pages":580,"year":1948,"publisher":"中央研究院"}',
       ?),
      ('mat-002', 'rubbing', '司母戊鼎铭文拓片', '原器铭文拓片，宣纸拓本',
       '/uploads/rubbings/simuwo_rubbing.jpg',
       '{"technique":"蝉翼拓","date":"1976-05-20","size":"68x45cm"}',
       ?),
      ('mat-003', 'map', '安阳殷墟遗址分布图', '标注了殷墟各个发掘区域的历史地图',
       '/uploads/maps/anyang_map.jpg',
       '{"scale":"1:5000","year":1950,"author":"李济"}',
       ?)
  `, [yesterday, twoDaysAgo, twoDaysAgo]);
  
  db.run(`
    INSERT INTO outputs (id, type, title, content, relic_ids, note_ids, created_at)
    VALUES 
      ('output-001', 'outline', '商代青铜铸造工艺研究论文提纲',
       '{"sections":[{"id":"1","title":"引言","content":"研究背景与意义","level":1},{"id":"2","title":"商代青铜铸造技术概述","content":"分铸法与浑铸法的应用","level":1},{"id":"2.1","title":"分铸技术的起源与发展","content":"从二里头到殷墟的技术演进","level":2},{"id":"3","title":"司母戊鼎铸造工艺分析","content":"合金成分、铸造痕迹观察","level":1},{"id":"4","title":"结语","content":"商代青铜技术的历史地位","level":1}]}',
       '["relic-001","relic-002"]',
       '["note-001"]',
       ?),
      ('output-002', 'argument', '关于司母戊鼎铸造年代的考证',
       '{"mainThesis":"司母戊鼎应铸造于商王武丁晚期","arguments":[{"id":"a1","content":"铭文字体与武丁时期卜辞一致","evidence":"董作宾甲骨文断代标准","references":["ref-001"]},{"id":"a2","content":"器形特征符合武丁晚期风格","evidence":"与小屯YM238出土器物比较","references":["ref-002"]},{"id":"c1","content":"反对意见：郭沫若认为晚于武丁","counterEvidence":"字体演变有过渡性","references":[]}]}',
       '["relic-001"]',
       '["note-001"]',
       ?)
  `, [yesterday, twoDaysAgo]);
  
  saveDatabase();
  console.log('Mock data initialization complete');
}
