import { Medicine, Reminder, Supplement, MedicalRecord, DosageRecord, InventoryCheck } from '../types';

export const seedMedicines: Medicine[] = [
  {
    id: '1',
    name: '阿莫西林胶囊',
    specification: '0.5g × 24粒',
    indications: '用于敏感菌所致的呼吸道感染、泌尿生殖道感染',
    dosage: '一次0.5g，每6-8小时1次',
    storageLocation: '客厅药箱',
    expiryDate: '2026-08-15',
    type: 'prescription',
    isPrescription: true,
    initialQuantity: 24,
    currentQuantity: 18,
    contraindications: {
      children: false,
      elderly: false,
      pregnancy: true,
      custom: '青霉素过敏者禁用'
    },
    notes: '饭后服用',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-05-20T00:00:00.000Z'
  },
  {
    id: '2',
    name: '布洛芬缓释胶囊',
    specification: '0.3g × 20粒',
    indications: '用于缓解轻至中度疼痛、发热',
    dosage: '一次1粒，一日2次',
    storageLocation: '卧室床头柜',
    expiryDate: '2026-06-30',
    type: 'otc',
    isPrescription: false,
    initialQuantity: 20,
    currentQuantity: 15,
    contraindications: {
      children: false,
      elderly: true,
      pregnancy: true,
      custom: '胃溃疡患者慎用'
    },
    notes: '退烧药',
    createdAt: '2026-02-15T00:00:00.000Z',
    updatedAt: '2026-05-25T00:00:00.000Z'
  },
  {
    id: '3',
    name: '降压药-硝苯地平控释片',
    specification: '30mg × 14片',
    indications: '高血压、冠心病',
    dosage: '一次1片，一日1次',
    storageLocation: '餐桌抽屉',
    expiryDate: '2027-03-20',
    type: 'prescription',
    isPrescription: true,
    initialQuantity: 14,
    currentQuantity: 7,
    contraindications: {
      children: true,
      elderly: false,
      pregnancy: true,
      custom: ''
    },
    notes: '慢性病长期用药，需每天早上服用',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-05-28T00:00:00.000Z'
  },
  {
    id: '4',
    name: '维生素C咀嚼片',
    specification: '100mg × 60片',
    indications: '用于预防和治疗坏血病',
    dosage: '一次1-2片，一日3次',
    storageLocation: '客厅药箱',
    expiryDate: '2026-05-31',
    type: 'otc',
    isPrescription: false,
    initialQuantity: 60,
    currentQuantity: 5,
    contraindications: {
      children: false,
      elderly: false,
      pregnancy: false,
      custom: ''
    },
    notes: '即将过期，尽快使用',
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-05-29T00:00:00.000Z'
  }
];

export const seedReminders: Reminder[] = [
  {
    id: '1',
    medicineId: '3',
    medicineName: '降压药-硝苯地平控释片',
    time: '08:00',
    frequency: 'daily',
    relationToMeal: 'after',
    isChronic: true,
    startDate: '2026-03-01',
    isActive: true,
    createdAt: '2026-03-01T00:00:00.000Z'
  },
  {
    id: '2',
    medicineId: '2',
    medicineName: '布洛芬缓释胶囊',
    time: '12:00',
    frequency: 'daily',
    relationToMeal: 'after',
    isChronic: false,
    startDate: '2026-05-25',
    endDate: '2026-05-30',
    isActive: true,
    createdAt: '2026-05-25T00:00:00.000Z'
  }
];

export const seedDosageRecords: DosageRecord[] = [
  {
    id: '1',
    medicineId: '3',
    medicineName: '降压药-硝苯地平控释片',
    type: 'prescription',
    dosage: '1片',
    scheduledTime: '08:00',
    actualTime: '08:15',
    status: 'taken',
    createdAt: '2026-05-29T00:00:00.000Z'
  },
  {
    id: '2',
    medicineId: '2',
    medicineName: '布洛芬缓释胶囊',
    type: 'otc',
    dosage: '1粒',
    scheduledTime: '12:00',
    status: 'missed',
    makeupAdvice: '如果距离下一次服药时间超过4小时，可以补服。如果距离下一次服药时间少于4小时，跳过本次。',
    createdAt: '2026-05-29T04:00:00.000Z'
  }
];

export const seedSupplements: Supplement[] = [
  {
    id: '1',
    name: '钙片',
    brand: '品牌A',
    dosage: '每日2片',
    effects: ['补充钙质', '预防骨质疏松'],
    subjectiveFeedback: '服用后感觉骨骼更有力量',
    initialQuantity: 100,
    currentQuantity: 30,
    expiryDate: '2027-06-15',
    interactions: ['与某些抗生素可能有相互作用', '高钙血症患者慎用'],
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-05-20T00:00:00.000Z'
  },
  {
    id: '2',
    name: '鱼油软胶囊',
    brand: '品牌B',
    dosage: '每日1粒',
    effects: ['调节血脂', '保护心血管'],
    subjectiveFeedback: '',
    initialQuantity: 60,
    currentQuantity: 5,
    expiryDate: '2026-07-10',
    interactions: ['与抗凝药同用可能增加出血风险'],
    createdAt: '2026-03-15T00:00:00.000Z',
    updatedAt: '2026-05-25T00:00:00.000Z'
  }
];

export const seedMedicalRecords: MedicalRecord[] = [
  {
    id: '1',
    date: '2026-05-15',
    hospital: '市第一人民医院',
    doctor: '张医生',
    department: '心内科',
    diagnosis: '原发性高血压',
    prescription: '硝苯地平控释片 30mg 每日1次',
    notes: '血压控制良好，继续当前方案',
    nextVisitDate: '2026-06-15',
    createdAt: '2026-05-15T00:00:00.000Z',
    updatedAt: '2026-05-15T00:00:00.000Z'
  },
  {
    id: '2',
    date: '2026-04-20',
    hospital: '社区医院',
    doctor: '李医生',
    department: '全科',
    diagnosis: '上呼吸道感染',
    prescription: '阿莫西林胶囊 0.5g 每8小时1次',
    notes: '注意休息，多喝水',
    createdAt: '2026-04-20T00:00:00.000Z',
    updatedAt: '2026-04-20T00:00:00.000Z'
  }
];

export const seedInventoryChecks: InventoryCheck[] = [
  {
    id: '1',
    checkDate: '2026-04-30',
    medicineCount: 8,
    expiredCount: 1,
    notes: '发现过期感冒药已丢弃',
    createdAt: '2026-04-30T00:00:00.000Z'
  }
];
