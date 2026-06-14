// 微生物菌株管理系统 - Mock种子数据
// 包含菌株、传代、表型、培养基、培养、实验、储存、核查、销毁完整示例数据

import type {
  Strain,
  Passage,
  Phenotype,
  Medium,
  Culture,
  Experiment,
  ExperimentRepeat,
  Control,
  Storage,
  AuditLog,
  Disposal,
  UUID,
} from '../types';

// 简易UUID生成器（v4格式）
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ==================== 1. 菌株数据（10株典型菌株） ====================
export const seedStrains: Strain[] = [
  {
    id: generateUUID(),
    code: 'ESC-001',
    name: '大肠杆菌',
    source: 'ATCC 25922 标准株',
    taxonomy: '变形菌门/γ-变形菌纲/肠杆菌目/肠杆菌科/埃希氏菌属/大肠杆菌',
    cultureConditions: '37℃，pH 7.0-7.4，好氧',
    safetyLevel: 2,
    createdAt: '2025-01-15',
    operator: '张研究员',
  },
  {
    id: generateUUID(),
    code: 'BSU-002',
    name: '枯草芽孢杆菌',
    source: 'CICC 10073 标准株',
    taxonomy: '厚壁菌门/芽孢杆菌纲/芽孢杆菌目/芽孢杆菌科/芽孢杆菌属/枯草芽孢杆菌',
    cultureConditions: '37℃，pH 7.0-7.2，好氧',
    safetyLevel: 1,
    createdAt: '2025-01-16',
    operator: '李实验员',
  },
  {
    id: generateUUID(),
    code: 'SAU-003',
    name: '金黄色葡萄球菌',
    source: 'ATCC 25923 标准株',
    taxonomy: '厚壁菌门/芽孢杆菌纲/葡萄球菌目/葡萄球菌科/葡萄球菌属/金黄色葡萄球菌',
    cultureConditions: '37℃，pH 7.4，好氧',
    safetyLevel: 2,
    createdAt: '2025-01-20',
    operator: '张研究员',
  },
  {
    id: generateUUID(),
    code: 'SCE-004',
    name: '酿酒酵母',
    source: 'CGMCC 2.1528 模式菌株',
    taxonomy: '子囊菌门/酵母纲/酵母目/酵母科/酵母属/酿酒酵母',
    cultureConditions: '30℃，pH 5.5-6.0，兼性厌氧',
    safetyLevel: 1,
    createdAt: '2025-02-01',
    operator: '王工程师',
  },
  {
    id: generateUUID(),
    code: 'PAE-005',
    name: '铜绿假单胞菌',
    source: 'ATCC 27853 标准株',
    taxonomy: '变形菌门/γ-变形菌纲/假单胞菌目/假单胞菌科/假单胞菌属/铜绿假单胞菌',
    cultureConditions: '37℃，pH 7.0-7.4，好氧',
    safetyLevel: 2,
    createdAt: '2025-02-05',
    operator: '李实验员',
  },
  {
    id: generateUUID(),
    code: 'CAL-006',
    name: '白色念珠菌',
    source: 'ATCC 10231 标准株',
    taxonomy: '子囊菌门/酵母纲/酵母目/酵母科/念珠菌属/白色念珠菌',
    cultureConditions: '37℃，pH 5.6-6.0，兼性厌氧',
    safetyLevel: 2,
    createdAt: '2025-02-10',
    operator: '赵技术员',
  },
  {
    id: generateUUID(),
    code: 'ANI-007',
    name: '黑曲霉',
    source: 'CICC 2477 标准株',
    taxonomy: '子囊菌门/散囊菌纲/散囊菌目/发菌科/曲霉属/黑曲霉',
    cultureConditions: '28℃，pH 5.0-6.0，好氧',
    safetyLevel: 1,
    createdAt: '2025-02-15',
    operator: '王工程师',
  },
  {
    id: generateUUID(),
    code: 'STY-008',
    name: '鼠伤寒沙门氏菌',
    source: 'ATCC 14028 标准株',
    taxonomy: '变形菌门/γ-变形菌纲/肠杆菌目/肠杆菌科/沙门氏菌属/鼠伤寒沙门氏菌',
    cultureConditions: '37℃，pH 7.0-7.4，好氧',
    safetyLevel: 3,
    createdAt: '2025-02-20',
    operator: '张研究员',
  },
  {
    id: generateUUID(),
    code: 'KPN-009',
    name: '肺炎克雷伯菌',
    source: 'ATCC 13883 标准株',
    taxonomy: '变形菌门/γ-变形菌纲/肠杆菌目/肠杆菌科/克雷伯菌属/肺炎克雷伯菌',
    cultureConditions: '37℃，pH 7.0-7.4，兼性厌氧',
    safetyLevel: 2,
    createdAt: '2025-03-01',
    operator: '赵技术员',
  },
  {
    id: generateUUID(),
    code: 'SEP-010',
    name: '表皮葡萄球菌',
    source: 'ATCC 12228 标准株',
    taxonomy: '厚壁菌门/芽孢杆菌纲/葡萄球菌目/葡萄球菌科/葡萄球菌属/表皮葡萄球菌',
    cultureConditions: '37℃，pH 7.0-7.4，好氧',
    safetyLevel: 1,
    createdAt: '2025-03-05',
    operator: '李实验员',
  },
];

// ==================== 2. 传代记录（每株2-3条） ====================
export const seedPassages: Passage[] = [
  // 大肠杆菌 - 3条
  { id: generateUUID(), strainId: seedStrains[0].id, passageDate: '2025-02-01', generation: 2, operator: '张研究员', notes: '活化培养，生长状态良好' },
  { id: generateUUID(), strainId: seedStrains[0].id, passageDate: '2025-03-15', generation: 3, operator: '李实验员', notes: '制备感受态细胞前传代' },
  { id: generateUUID(), strainId: seedStrains[0].id, passageDate: '2025-05-10', generation: 4, operator: '张研究员', notes: '长期储存复苏后传代验证' },
  // 枯草芽孢杆菌 - 2条
  { id: generateUUID(), strainId: seedStrains[1].id, passageDate: '2025-02-05', generation: 2, operator: '李实验员', notes: '产芽孢诱导前传代' },
  { id: generateUUID(), strainId: seedStrains[1].id, passageDate: '2025-04-20', generation: 3, operator: '王工程师', notes: '蛋白酶表达实验用' },
  // 金黄色葡萄球菌 - 3条
  { id: generateUUID(), strainId: seedStrains[2].id, passageDate: '2025-02-10', generation: 2, operator: '张研究员', notes: '溶血试验前活化' },
  { id: generateUUID(), strainId: seedStrains[2].id, passageDate: '2025-03-25', generation: 3, operator: '赵技术员', notes: '耐药性检测用菌' },
  { id: generateUUID(), strainId: seedStrains[2].id, passageDate: '2025-05-15', generation: 4, operator: '张研究员', notes: '生物膜形成实验' },
  // 酿酒酵母 - 2条
  { id: generateUUID(), strainId: seedStrains[3].id, passageDate: '2025-02-15', generation: 2, operator: '王工程师', notes: '表达载体转化前活化' },
  { id: generateUUID(), strainId: seedStrains[3].id, passageDate: '2025-04-10', generation: 3, operator: '李实验员', notes: '发酵实验种子液制备' },
  // 铜绿假单胞菌 - 3条
  { id: generateUUID(), strainId: seedStrains[4].id, passageDate: '2025-02-20', generation: 2, operator: '李实验员', notes: '绿脓素产生验证' },
  { id: generateUUID(), strainId: seedStrains[4].id, passageDate: '2025-04-01', generation: 3, operator: '赵技术员', notes: '群体感应研究实验' },
  { id: generateUUID(), strainId: seedStrains[4].id, passageDate: '2025-05-20', generation: 4, operator: '张研究员', notes: '抗生素敏感性测试' },
  // 白色念珠菌 - 2条
  { id: generateUUID(), strainId: seedStrains[5].id, passageDate: '2025-02-25', generation: 2, operator: '赵技术员', notes: '菌丝形成诱导实验' },
  { id: generateUUID(), strainId: seedStrains[5].id, passageDate: '2025-04-15', generation: 3, operator: '王工程师', notes: '抗真菌药物筛选' },
  // 黑曲霉 - 2条
  { id: generateUUID(), strainId: seedStrains[6].id, passageDate: '2025-03-01', generation: 2, operator: '王工程师', notes: '产孢培养' },
  { id: generateUUID(), strainId: seedStrains[6].id, passageDate: '2025-05-01', generation: 3, operator: '李实验员', notes: '柠檬酸发酵实验' },
  // 鼠伤寒沙门氏菌 - 3条
  { id: generateUUID(), strainId: seedStrains[7].id, passageDate: '2025-03-05', generation: 2, operator: '张研究员', notes: 'BSL-2实验室操作' },
  { id: generateUUID(), strainId: seedStrains[7].id, passageDate: '2025-04-20', generation: 3, operator: '张研究员', notes: '毒力基因表达检测' },
  { id: generateUUID(), strainId: seedStrains[7].id, passageDate: '2025-06-01', generation: 4, operator: '赵技术员', notes: '细胞侵袭实验用菌' },
  // 肺炎克雷伯菌 - 2条
  { id: generateUUID(), strainId: seedStrains[8].id, passageDate: '2025-03-10', generation: 2, operator: '赵技术员', notes: '荚膜染色观察' },
  { id: generateUUID(), strainId: seedStrains[8].id, passageDate: '2025-05-10', generation: 3, operator: '张研究员', notes: '碳青霉烯酶检测' },
  // 表皮葡萄球菌 - 2条
  { id: generateUUID(), strainId: seedStrains[9].id, passageDate: '2025-03-15', generation: 2, operator: '李实验员', notes: '皮肤共生菌研究' },
  { id: generateUUID(), strainId: seedStrains[9].id, passageDate: '2025-05-25', generation: 3, operator: '王工程师', notes: '生物膜相关感染模型' },
];

// ==================== 3. 表型特征（每株对应1条） ====================
export const seedPhenotypes: Phenotype[] = [
  // 大肠杆菌
  {
    id: generateUUID(), strainId: seedStrains[0].id,
    colonyMorphology: '圆形，边缘整齐，表面光滑湿润，微凸起，直径2-3mm',
    gramStain: '阴性', motility: '有', size: '0.5×1-3μm', shape: '短杆状',
    color: '乳白色/半透明', otherFeatures: '产酸产气，IMViC试验++--，不产H2S',
  },
  // 枯草芽孢杆菌
  {
    id: generateUUID(), strainId: seedStrains[1].id,
    colonyMorphology: '不规则圆形，表面粗糙有褶皱，干燥不透明，边缘呈波纹状',
    gramStain: '阳性', motility: '有', size: '0.7-0.8×2-3μm', shape: '杆状',
    color: '米白色/淡褐色', otherFeatures: '产芽孢（椭圆形，中生），产蛋白酶和淀粉酶',
  },
  // 金黄色葡萄球菌
  {
    id: generateUUID(), strainId: seedStrains[2].id,
    colonyMorphology: '圆形，边缘整齐，表面光滑湿润，凸起，直径1-2mm',
    gramStain: '阳性', motility: '无', size: '0.5-1.5μm', shape: '球状，葡萄串状排列',
    color: '金黄色', otherFeatures: '溶血阳性（β溶血），血浆凝固酶阳性，耐盐',
  },
  // 酿酒酵母
  {
    id: generateUUID(), strainId: seedStrains[3].id,
    colonyMorphology: '圆形，边缘整齐，表面光滑有光泽，凸起，奶油状',
    gramStain: '不适用（真菌）', motility: '无', size: '5-10×5-20μm', shape: '球形/椭圆形',
    color: '乳白色', otherFeatures: '出芽繁殖，产子囊孢子，可发酵糖类产乙醇',
  },
  // 铜绿假单胞菌
  {
    id: generateUUID(), strainId: seedStrains[4].id,
    colonyMorphology: '不规则圆形，边缘不整齐，扁平，可见金属光泽，有特殊生姜气味',
    gramStain: '阴性', motility: '有（端生单鞭毛）', size: '0.5-0.8×1.5-3.0μm', shape: '直杆状',
    color: '蓝绿色/黄绿色', otherFeatures: '产绿脓素和荧光素，氧化酶阳性，产水溶性色素',
  },
  // 白色念珠菌
  {
    id: generateUUID(), strainId: seedStrains[5].id,
    colonyMorphology: '圆形，边缘整齐，表面光滑，奶油样质地，直径1-3mm',
    gramStain: '不适用（真菌）', motility: '无', size: '3-6×6-10μm', shape: '卵形/球形',
    color: '乳白色', otherFeatures: '可形成假菌丝和厚膜孢子，37℃血清诱导形成芽管',
  },
  // 黑曲霉
  {
    id: generateUUID(), strainId: seedStrains[6].id,
    colonyMorphology: '菌落生长快，先为白色棉絮状，后转为黑色，表面呈颗粒状',
    gramStain: '不适用（真菌）', motility: '无', size: '分生孢子3-5μm，菌丝有隔', shape: '有隔菌丝+分生孢子头',
    color: '黑色（反面无色/淡黄色）', otherFeatures: '产黄曲霉毒素阴性，产柠檬酸，分生孢子头球形放射状',
  },
  // 鼠伤寒沙门氏菌
  {
    id: generateUUID(), strainId: seedStrains[7].id,
    colonyMorphology: '圆形，边缘整齐，表面光滑，半透明，直径1-2mm',
    gramStain: '阴性', motility: '有（周生鞭毛）', size: '0.5-1.0×1-3μm', shape: '杆状',
    color: '无色/半透明', otherFeatures: '产H2S（黑色中心菌落），不发酵乳糖，赖氨酸脱羧酶阳性',
  },
  // 肺炎克雷伯菌
  {
    id: generateUUID(), strainId: seedStrains[8].id,
    colonyMorphology: '圆形，边缘整齐，表面光滑粘稠，凸起，有拉丝现象',
    gramStain: '阴性', motility: '无', size: '0.5-0.8×1-2μm', shape: '短粗杆状，成双排列',
    color: '灰白色/粘液状', otherFeatures: '有明显荚膜，产ESBL风险高，鸟氨酸脱羧酶阴性',
  },
  // 表皮葡萄球菌
  {
    id: generateUUID(), strainId:seedStrains[9].id,
    colonyMorphology: '圆形，边缘整齐，表面光滑，凸起，直径0.5-1mm',
    gramStain: '阳性', motility: '无', size: '0.5-1.0μm', shape: '球状，葡萄串状排列',
    color: '白色/柠檬色', otherFeatures: '凝固酶阴性，不溶血或弱溶血，常见皮肤污染菌',
  },
];

// ==================== 4. 培养基配方（6种） ====================
export const seedMedia: Medium[] = [
  {
    id: generateUUID(),
    name: 'LB培养基',
    formula: '胰蛋白胨10g/L，酵母提取物5g/L，氯化钠10g/L，琼脂15g/L（固体）',
    sterilizationMethod: '121℃高压蒸汽灭菌20分钟',
    phValue: 7.2,
    createdAt: '2025-01-10',
  },
  {
    id: generateUUID(),
    name: 'TSA培养基（胰蛋白胨大豆琼脂）',
    formula: '胰蛋白胨15g/L，大豆蛋白胨5g/L，氯化钠5g/L，琼脂15g/L',
    sterilizationMethod: '121℃高压蒸汽灭菌15分钟',
    phValue: 7.3,
    createdAt: '2025-01-10',
  },
  {
    id: generateUUID(),
    name: 'PDA培养基（马铃薯葡萄糖琼脂）',
    formula: '马铃薯浸出液200g/L，葡萄糖20g/L，琼脂15g/L，自然pH',
    sterilizationMethod: '115℃高压蒸汽灭菌20分钟',
    phValue: 5.6,
    createdAt: '2025-01-12',
  },
  {
    id: generateUUID(),
    name: 'NB培养基（营养肉汤）',
    formula: '蛋白胨10g/L，牛肉膏3g/L，氯化钠5g/L，pH 7.2±0.2',
    sterilizationMethod: '121℃高压蒸汽灭菌15分钟',
    phValue: 7.2,
    createdAt: '2025-01-12',
  },
  {
    id: generateUUID(),
    name: 'YPD培养基（酵母膏蛋白胨葡萄糖）',
    formula: '酵母提取物10g/L，蛋白胨20g/L，葡萄糖20g/L，琼脂20g/L（固体）',
    sterilizationMethod: '115℃高压蒸汽灭菌15分钟，葡萄糖单独过滤除菌后加入',
    phValue: 6.0,
    createdAt: '2025-01-15',
  },
  {
    id: generateUUID(),
    name: 'SA培养基（沙氏葡萄糖琼脂）',
    formula: '葡萄糖40g/L，蛋白胨10g/L，琼脂15g/L',
    sterilizationMethod: '115℃高压蒸汽灭菌15分钟',
    phValue: 5.6,
    createdAt: '2025-01-15',
  },
];

// ==================== 5. 培养记录（12条） ====================
export const seedCultures: Culture[] = [
  // 大肠杆菌在LB
  { id: generateUUID(), strainId: seedStrains[0].id, mediumId: seedMedia[0].id, inoculumVolume: 0.5, temperature: 37, durationHours: 16, aeration: '好氧', growthRate: '快', morphologyObservation: '浑浊均匀，无絮状物', densityOd600: 1.85, notes: '标准过夜培养，用于质粒提取' },
  // 大肠杆菌在TSA平板
  { id: generateUUID(), strainId: seedStrains[0].id, mediumId: seedMedia[1].id, inoculumVolume: 0.1, temperature: 37, durationHours: 24, aeration: '好氧', growthRate: '快', morphologyObservation: '典型大肠杆菌菌落形态', densityOd600: 0, notes: '分离纯化单菌落' },
  // 枯草芽孢杆菌在NB
  { id: generateUUID(), strainId: seedStrains[1].id, mediumId: seedMedia[3].id, inoculumVolume: 1.0, temperature: 37, durationHours: 48, aeration: '好氧', growthRate: '中', morphologyObservation: '有芽孢形成迹象，培养液稍浑浊', densityOd600: 2.10, notes: '产孢诱导培养' },
  // 金黄色葡萄球菌在TSA
  { id: generateUUID(), strainId: seedStrains[2].id, mediumId: seedMedia[1].id, inoculumVolume: 0.2, temperature: 37, durationHours: 24, aeration: '好氧', growthRate: '中', morphologyObservation: '典型金黄色菌落', densityOd600: 0, notes: '菌落特征观察' },
  // 金黄色葡萄球菌在LB
  { id: generateUUID(), strainId: seedStrains[2].id, mediumId: seedMedia[0].id, inoculumVolume: 0.5, temperature: 37, durationHours: 18, aeration: '好氧', growthRate: '中', morphologyObservation: '均匀浑浊生长', densityOd600: 1.45, notes: '制备菌悬液' },
  // 酿酒酵母在YPD
  { id: generateUUID(), strainId: seedStrains[3].id, mediumId: seedMedia[4].id, inoculumVolume: 1.0, temperature: 30, durationHours: 24, aeration: '好氧', growthRate: '中', morphologyObservation: '菌体沉淀，轻摇可分散', densityOd600: 3.20, notes: '感受态细胞制备' },
  // 铜绿假单胞菌在LB
  { id: generateUUID(), strainId: seedStrains[4].id, mediumId: seedMedia[0].id, inoculumVolume: 0.5, temperature: 37, durationHours: 24, aeration: '好氧', growthRate: '快', morphologyObservation: '培养液呈黄绿色，有生姜味', densityOd600: 2.55, notes: '绿脓素产生验证' },
  // 白色念珠菌在YPD
  { id: generateUUID(), strainId: seedStrains[5].id, mediumId: seedMedia[4].id, inoculumVolume: 0.5, temperature: 37, durationHours: 24, aeration: '兼性厌氧', growthRate: '中', morphologyObservation: '酵母样生长，有沉淀', densityOd600: 2.80, notes: '菌丝诱导前种子液' },
  // 白色念珠菌在SA
  { id: generateUUID(), strainId: seedStrains[5].id, mediumId: seedMedia[5].id, inoculumVolume: 0.1, temperature: 28, durationHours: 48, aeration: '好氧', growthRate: '慢', morphologyObservation: '典型酵母样菌落', densityOd600: 0, notes: '分离培养' },
  // 黑曲霉在PDA
  { id: generateUUID(), strainId: seedStrains[6].id, mediumId: seedMedia[2].id, inoculumVolume: 0.5, temperature: 28, durationHours: 72, aeration: '好氧', growthRate: '慢', morphologyObservation: '白色菌丝转为黑色孢子', densityOd600: 0, notes: '产孢培养，收获分生孢子' },
  // 鼠伤寒沙门氏菌在NB
  { id: generateUUID(), strainId: seedStrains[7].id, mediumId: seedMedia[3].id, inoculumVolume: 0.5, temperature: 37, durationHours: 18, aeration: '好氧', growthRate: '快', morphologyObservation: '均匀浑浊', densityOd600: 1.70, notes: 'BSL-2环境下操作' },
  // 肺炎克雷伯菌在LB
  { id: generateUUID(), strainId: seedStrains[8].id, mediumId: seedMedia[0].id, inoculumVolume: 0.5, temperature: 37, durationHours: 16, aeration: '兼性厌氧', growthRate: '快', morphologyObservation: '粘液状生长，液膜明显', densityOd600: 2.00, notes: '荚膜检测前培养' },
];

// ==================== 6. 实验记录（5个完整实验） ====================
export const seedExperiments: Experiment[] = [
  // 实验1：大肠杆菌生长曲线测定
  {
    id: generateUUID(), strainId: seedStrains[0].id,
    title: '大肠杆菌BL21在LB培养基中的生长曲线测定',
    purpose: '测定大肠杆菌在标准培养条件下的生长动力学参数，确定对数生长期和稳定期',
    protocol: '1. 取过夜培养物按1:100转接至100mL新鲜LB液体培养基；2. 37℃ 200rpm振荡培养；3. 每1小时取样，测定OD600值；4. 共测定12小时；5. 以时间为横坐标，OD600为纵坐标绘制生长曲线',
    data: '0h:0.02,1h:0.05,2h:0.12,3h:0.35,4h:0.85,5h:1.45,6h:1.92,7h:2.20,8h:2.40,9h:2.45,10h:2.48,11h:2.45,12h:2.42',
    conclusion: '大肠杆菌延滞期约1小时，对数生长期2-6小时，世代时间约21分钟，7小时后进入稳定期，最大OD600约2.48',
    status: '已完成', date: '2025-03-01', operator: '张研究员',
  },
  // 实验2：金黄色葡萄球菌溶血试验
  {
    id: generateUUID(), strainId: seedStrains[2].id,
    title: '金黄色葡萄球菌ATCC25923溶血活性检测',
    purpose: '验证金黄色葡萄球菌标准株的β溶血特性，用于实验室质量控制',
    protocol: '1. 无菌制备5%脱纤维绵羊血琼脂平板；2. 取新鲜培养的菌落分区划线接种；3. 37℃培养24小时；4. 观察菌落周围溶血环类型和直径',
    data: '菌落周围出现明显透明溶血环，溶血环直径2-3mm，溶血类型判定为β溶血（完全溶血），重复3次结果一致',
    conclusion: '金黄色葡萄球菌ATCC25923表现典型β溶血特性，符合标准菌株预期，可作为溶血试验质控菌株',
    status: '已完成', date: '2025-03-15', operator: '李实验员',
  },
  // 实验3：酿酒酵母乙醇发酵
  {
    id: generateUUID(), strainId: seedStrains[3].id,
    title: '酿酒酵母在不同葡萄糖浓度下的乙醇发酵效率比较',
    purpose: '评估酿酒酵母在高糖浓度下的发酵能力，为工业发酵工艺优化提供依据',
    protocol: '1. 设置5%、10%、15%、20%四个葡萄糖浓度组的YPD培养基；2. 按5%接种量接入种子液；3. 30℃静置发酵72小时；4. 每24小时取样测定还原糖含量和乙醇浓度',
    data: '5%组：24h糖耗98%乙醇2.1%；48h糖耗100%乙醇2.4%；72h乙醇2.3%。10%组：24h糖耗75%乙醇4.5%；48h糖耗99%乙醇5.8%；72h乙醇5.7%。15%组：24h糖耗52%乙醇6.2%；48h糖耗90%乙醇8.1%；72h糖耗98%乙醇8.5%。20%组：24h糖耗35%乙醇7.0%；48h糖耗72%乙醇10.2%；72h糖耗88%乙醇11.3%',
    conclusion: '10%葡萄糖组发酵效率最高，15%组最终乙醇浓度可达8.5%，20%高糖组发酵不完全但乙醇浓度最高达11.3%，建议工业发酵采用15%初始糖浓度',
    status: '已完成', date: '2025-04-10', operator: '王工程师',
  },
  // 实验4：枯草芽孢杆菌蛋白酶活性测定
  {
    id: generateUUID(), strainId: seedStrains[1].id,
    title: '枯草芽孢杆菌液体发酵产蛋白酶活性动态监测',
    purpose: '优化枯草芽孢杆菌产蛋白酶的发酵时间，确定最佳收获时间点',
    protocol: '1. 种子液接种至产酶培养基（含1%酪蛋白）；2. 37℃ 180rpm培养72小时；3. 每12小时取样，4℃ 8000rpm离心10分钟取上清；4. Folin-酚法测定蛋白酶活力（U/mL）',
    data: '12h:15U/mL,24h:68U/mL,36h:142U/mL,48h:215U/mL,60h:268U/mL,72h:275U/mL,84h:270U/mL,96h:258U/mL。菌体浓度OD600：12h:0.8,24h:2.1,36h:3.5,48h:4.2,60h:4.5,72h:4.3',
    conclusion: '蛋白酶活性在60-72小时达到峰值，最高活力约275U/mL，72小时后酶活力开始下降，建议工业生产在发酵66小时左右收获',
    status: '已完成', date: '2025-04-25', operator: '张研究员',
  },
  // 实验5：铜绿假单胞菌抗生素敏感性测试
  {
    id: generateUUID(), strainId: seedStrains[4].id,
    title: '铜绿假单胞菌ATCC27853对10种常用抗生素的药敏试验',
    purpose: '建立铜绿假单胞菌标准株的药敏谱，用于临床药敏试验的质量控制',
    protocol: '1. CLSI标准纸片扩散法（K-B法）；2. MH琼脂平板，菌液浓度0.5麦氏浊度；3. 贴10种抗生素纸片：哌拉西林、头孢他啶、亚胺培南、美罗培南、阿米卡星、环丙沙星、左氧氟沙星、妥布霉素、头孢吡肟、氨曲南；4. 35℃培养16-18小时测量抑菌圈直径',
    data: '哌拉西林:24mm(S),头孢他啶:28mm(S),亚胺培南:32mm(S),美罗培南:35mm(S),阿米卡星:22mm(S),环丙沙星:30mm(S),左氧氟沙星:32mm(S),妥布霉素:20mm(S),头孢吡肟:28mm(S),氨曲南:26mm(S)。全部抑菌圈在CLSI质控范围内',
    conclusion: '铜绿假单胞菌ATCC27853对测试的10种抗生素全部敏感，抑菌圈直径均符合CLSI质控标准，可作为药敏试验的质控菌株使用',
    status: '已完成', date: '2025-05-10', operator: '赵技术员',
  },
];

// ==================== 7. 实验重复性记录（每个实验2-3次重复） ====================
export const seedRepeats: ExperimentRepeat[] = [
  // 实验1重复
  { id: generateUUID(), experimentId: seedExperiments[0].id, repeatNo: 1, dataSummary: '重复1：对数期2-6h，最大OD=2.45，世代时间22min', consistencyScore: 96, date: '2025-03-02' },
  { id: generateUUID(), experimentId: seedExperiments[0].id, repeatNo: 2, dataSummary: '重复2：对数期2-6h，最大OD=2.50，世代时间20min', consistencyScore: 98, date: '2025-03-03' },
  { id: generateUUID(), experimentId: seedExperiments[0].id, repeatNo: 3, dataSummary: '重复3：对数期2-6h，最大OD=2.47，世代时间21min', consistencyScore: 97, date: '2025-03-04' },
  // 实验2重复
  { id: generateUUID(), experimentId: seedExperiments[1].id, repeatNo: 1, dataSummary: '溶血环直径2.5mm，β溶血阳性', consistencyScore: 99, date: '2025-03-16' },
  { id: generateUUID(), experimentId: seedExperiments[1].id, repeatNo: 2, dataSummary: '溶血环直径2.2mm，β溶血阳性', consistencyScore: 98, date: '2025-03-17' },
  // 实验3重复
  { id: generateUUID(), experimentId: seedExperiments[2].id, repeatNo: 1, dataSummary: '10%糖组：24h糖耗76%，48h糖耗100%，72h乙醇5.9%', consistencyScore: 95, date: '2025-04-11' },
  { id: generateUUID(), experimentId: seedExperiments[2].id, repeatNo: 2, dataSummary: '15%糖组：24h糖耗51%，48h糖耗91%，72h乙醇8.4%', consistencyScore: 94, date: '2025-04-12' },
  { id: generateUUID(), experimentId: seedExperiments[2].id, repeatNo: 3, dataSummary: '20%糖组：24h糖耗36%，48h糖耗73%，72h乙醇11.5%', consistencyScore: 93, date: '2025-04-13' },
  // 实验4重复
  { id: generateUUID(), experimentId: seedExperiments[3].id, repeatNo: 1, dataSummary: '60h酶活265U/mL，72h酶活272U/mL', consistencyScore: 97, date: '2025-04-26' },
  { id: generateUUID(), experimentId: seedExperiments[3].id, repeatNo: 2, dataSummary: '60h酶活270U/mL，72h酶活278U/mL', consistencyScore: 98, date: '2025-04-27' },
  // 实验5重复
  { id: generateUUID(), experimentId: seedExperiments[4].id, repeatNo: 1, dataSummary: '全部抑菌圈直径在CLSI允许范围内，偏差<2mm', consistencyScore: 99, date: '2025-05-11' },
  { id: generateUUID(), experimentId: seedExperiments[4].id, repeatNo: 2, dataSummary: '全部10种抗生素抑菌圈均符合质控要求', consistencyScore: 100, date: '2025-05-12' },
  { id: generateUUID(), experimentId: seedExperiments[4].id, repeatNo: 3, dataSummary: '重复性良好，RSD<5%，符合实验室质控标准', consistencyScore: 99, date: '2025-05-13' },
];

// ==================== 8. 对照组记录（每个实验含对照组） ====================
export const seedControls: Control[] = [
  // 实验1对照
  { id: generateUUID(), experimentId: seedExperiments[0].id, type: '空白对照', setup: '未接种大肠杆菌的无菌LB培养基，相同培养条件', result: 'OD600始终保持在0.02以下，培养基无浑浊，无菌生长' },
  { id: generateUUID(), experimentId: seedExperiments[0].id, type: '阴性对照', setup: '接种已知不生长的条件（4℃静置培养）', result: '12小时内OD600无明显增加，确认温度为生长限制因子' },
  // 实验2对照
  { id: generateUUID(), experimentId: seedExperiments[1].id, type: '阳性对照', setup: '金黄色葡萄球菌标准质控株ATCC25923同步培养', result: '典型β溶血，溶血环直径2-3mm，结果与预期一致' },
  { id: generateUUID(), experimentId: seedExperiments[1].id, type: '阴性对照', setup: '大肠埃希菌ATCC25922接种血平板', result: '无明显溶血环（γ溶血），结果符合预期' },
  // 实验3对照
  { id: generateUUID(), experimentId: seedExperiments[2].id, type: '空白对照', setup: '未接种酵母的YPD培养基，各糖浓度梯度', result: '糖含量和乙醇浓度无变化，排除非生物因素干扰' },
  { id: generateUUID(), experimentId: seedExperiments[2].id, type: '阳性对照', setup: '工业面包酵母同步发酵10%糖浓度', result: '48h糖耗100%，乙醇5.5%，与实验株效率相当' },
  // 实验4对照
  { id: generateUUID(), experimentId: seedExperiments[3].id, type: '空白对照', setup: '未接种的产酶培养基，相同处理步骤', result: '酪蛋白降解活性为0，排除培养基本底影响' },
  { id: generateUUID(), experimentId: seedExperiments[3].id, type: '阳性对照', setup: '蛋白酶K标准品（1mg/mL）同步测定', result: '标准曲线R²=0.998，测定方法可靠' },
  // 实验5对照
  { id: generateUUID(), experimentId: seedExperiments[4].id, type: '质控对照', setup: '金黄色葡萄球菌ATCC25923同步测定青霉素G纸片', result: '抑菌圈直径26mm，在CLSI质控范围（24-30mm）内' },
  { id: generateUUID(), experimentId: seedExperiments[4].id, type: '空白对照', setup: 'MH平板贴空白无菌纸片', result: '无抑菌圈，排除纸片或溶剂的抑菌作用' },
];

// ==================== 9. 储存位置（2台冰箱×3个冻存盒×25格 = 150个位置） ====================
// 前10个位置分配给10株菌株，其余为空位
const generateStorageData = (): Storage[] => {
  const storages: Storage[] = [];
  const fridgeCodes = ['FRIDGE-A', 'FRIDGE-B'];
  const boxCodes = ['BOX-01', 'BOX-02', 'BOX-03'];
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5];
  let idx = 0;
  for (const fridge of fridgeCodes) {
    for (const box of boxCodes) {
      for (const row of rows) {
        for (const col of cols) {
          const position = `${row}${col}`;
          // 前10个位置分配菌株（FRIDGE-A/BOX-01前10格）
          let strainId: UUID | null = null;
          let status = '空';
          if (fridge === 'FRIDGE-A' && box === 'BOX-01' && idx < 10) {
            strainId = seedStrains[idx].id;
            status = '正常';
          }
          storages.push({
            id: generateUUID(),
            strainId,
            fridgeCode: fridge,
            boxCode: box,
            position,
            status,
          });
          idx++;
        }
      }
    }
  }
  return storages;
};

export const seedStorages: Storage[] = generateStorageData();

// ==================== 10. 核查记录（8条） ====================
// 为前8个有菌株的储存位置创建核查记录
export const seedAudits: AuditLog[] = [
  { id: generateUUID(), storageId: seedStorages[0].id, auditDate: '2025-06-01', viability: '良好', needsRefresh: false, operator: '张研究员' },
  { id: generateUUID(), storageId: seedStorages[1].id, auditDate: '2025-06-01', viability: '良好', needsRefresh: false, operator: '张研究员' },
  { id: generateUUID(), storageId: seedStorages[2].id, auditDate: '2025-06-02', viability: '良好', needsRefresh: false, operator: '李实验员' },
  { id: generateUUID(), storageId: seedStorages[3].id, auditDate: '2025-06-02', viability: '一般', needsRefresh: true, operator: '李实验员' },
  { id: generateUUID(), storageId: seedStorages[4].id, auditDate: '2025-06-03', viability: '良好', needsRefresh: false, operator: '王工程师' },
  { id: generateUUID(), storageId: seedStorages[5].id, auditDate: '2025-06-03', viability: '良好', needsRefresh: false, operator: '王工程师' },
  { id: generateUUID(), storageId: seedStorages[6].id, auditDate: '2025-06-04', viability: '较差', needsRefresh: true, operator: '赵技术员' },
  { id: generateUUID(), storageId: seedStorages[7].id, auditDate: '2025-06-04', viability: '良好', needsRefresh: false, operator: '赵技术员' },
];

// ==================== 11. 销毁记录（3条） ====================
export const seedDisposals: Disposal[] = [
  {
    id: generateUUID(),
    strainId: seedStrains[7].id,
    reason: '该批次菌株污染，经过验证为杂菌污染，无挽救价值，申请高温高压灭菌后销毁',
    operator: '张研究员',
    approver: '实验室主任-刘教授',
    date: '2025-04-15',
  },
  {
    id: generateUUID(),
    strainId: seedStrains[3].id,
    reason: '项目结束，该实验用工程菌株按生物安全规范要求销毁，避免流出',
    operator: '王工程师',
    approver: '实验室主任-刘教授',
    date: '2025-05-20',
  },
  {
    id: generateUUID(),
    strainId: seedStrains[5].id,
    reason: '菌株保存超过5年，活性检测为较差，已重新制备新批次，旧株按规定销毁',
    operator: '李实验员',
    approver: '实验室主任-刘教授',
    date: '2025-06-05',
  },
];
