import { generateId } from '@/utils/generateId';
import type {
  BloodPressureRecord,
  Medication,
  AdherenceRecord,
  SideEffectRecord,
  SaltIntakeRecord,
  ExerciseRecord,
  BodyMeasurementRecord,
  Appointment,
  VisitRecord,
  ExamReport,
} from '@/types';

const today = new Date('2026-06-15');

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function daysAgo(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

function daysLater(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const medicationData: Medication[] = [
  {
    id: generateId(),
    name: '氨氯地平片',
    genericName: 'Amlodipine',
    dosage: '5mg',
    frequency: 'daily',
    startTime: daysAgo(60),
    prescribedBy: '王医生',
    isActive: true,
  },
  {
    id: generateId(),
    name: '缬沙坦胶囊',
    genericName: 'Valsartan',
    dosage: '80mg',
    frequency: 'daily',
    startTime: daysAgo(60),
    prescribedBy: '王医生',
    isActive: true,
  },
  {
    id: generateId(),
    name: '氢氯噻嗪片',
    genericName: 'Hydrochlorothiazide',
    dosage: '12.5mg',
    frequency: 'daily',
    startTime: daysAgo(45),
    prescribedBy: '王医生',
    isActive: true,
  },
  {
    id: generateId(),
    name: '阿司匹林肠溶片',
    genericName: 'Aspirin',
    dosage: '100mg',
    frequency: 'daily',
    startTime: daysAgo(30),
    prescribedBy: '李医生',
    isActive: true,
  },
];

export const bloodPressureData: BloodPressureRecord[] = [];
for (let i = 29; i >= 0; i--) {
  const date = daysAgo(i);
  const morningSystolic = randomInRange(118, 135);
  const morningDiastolic = randomInRange(75, 88);
  const morningPulse = randomInRange(68, 82);
  bloodPressureData.push({
    id: generateId(),
    date,
    timeOfDay: 'morning',
    systolic: morningSystolic,
    diastolic: morningDiastolic,
    pulse: morningPulse,
  });

  if (i % 2 === 0 || i < 10) {
    const eveningSystolic = randomInRange(115, 130);
    const eveningDiastolic = randomInRange(72, 85);
    const eveningPulse = randomInRange(65, 80);
    bloodPressureData.push({
      id: generateId(),
      date,
      timeOfDay: 'evening',
      systolic: eveningSystolic,
      diastolic: eveningDiastolic,
      pulse: eveningPulse,
    });
  }
}

export const adherenceData: AdherenceRecord[] = [];
for (let i = 29; i >= 0; i--) {
  const date = daysAgo(i);
  medicationData.forEach((med) => {
    const random = Math.random();
    let status: AdherenceRecord['status'] = 'taken';
    let takenTimes: string[] | undefined;

    if (random < 0.85) {
      status = 'taken';
      takenTimes = med.frequency === 'twice-daily' ? ['08:00', '20:00'] : ['08:00'];
    } else if (random < 0.93) {
      status = 'partial';
      takenTimes = ['08:00'];
    } else if (random < 0.97) {
      status = 'missed';
    } else {
      status = 'skipped';
    }

    adherenceData.push({
      id: generateId(),
      date,
      medicationId: med.id,
      status,
      takenTimes,
    });
  });
}

export const sideEffectData: SideEffectRecord[] = [
  {
    id: generateId(),
    date: daysAgo(20),
    medicationId: medicationData[0].id,
    symptom: '轻微头痛',
    severity: 'mild',
    note: '服药后约2小时出现，持续约30分钟后缓解',
    resolved: true,
    resolvedDate: daysAgo(18),
    doctorNotified: true,
  },
  {
    id: generateId(),
    date: daysAgo(12),
    medicationId: medicationData[2].id,
    symptom: '尿频',
    severity: 'mild',
    note: '尿量略有增加，无其他不适',
    resolved: true,
    resolvedDate: daysAgo(8),
    doctorNotified: false,
  },
  {
    id: generateId(),
    date: daysAgo(5),
    medicationId: medicationData[1].id,
    symptom: '头晕',
    severity: 'mild',
    note: '早晨起床时偶有轻微头晕',
    resolved: false,
    doctorNotified: false,
  },
];

export const saltIntakeData: SaltIntakeRecord[] = [];
for (let i = 29; i >= 0; i--) {
  const date = daysAgo(i);
  saltIntakeData.push({
    id: generateId(),
    date,
    amountGrams: Math.round((Math.random() * 5 + 3) * 10) / 10,
  });
}

const exerciseTypes: ExerciseRecord['type'][] = ['walking', 'running', 'cycling', 'yoga', 'strength', 'other'];

export const exerciseData: ExerciseRecord[] = [];
for (let i = 29; i >= 0; i--) {
  if (Math.random() > 0.25) {
    const date = daysAgo(i);
    const type = exerciseTypes[randomInRange(0, exerciseTypes.length - 1)];
    const durationMinutes = type === 'walking' ? randomInRange(20, 60) : randomInRange(15, 45);
    const caloriesBurned = Math.round(durationMinutes * (3 + Math.random() * 4));
    exerciseData.push({
      id: generateId(),
      date,
      type,
      durationMinutes,
      caloriesBurned,
    });
  }
}

export const bodyMeasurementData: BodyMeasurementRecord[] = [];
const heights = 172;
for (let i = 25; i >= 0; i -= 5) {
  const date = daysAgo(i);
  const weightKg = 72 - (25 - i) * 0.1;
  const waistCm = 86 - (25 - i) * 0.15;
  const bmi = weightKg / Math.pow(heights / 100, 2);
  bodyMeasurementData.push({
    id: generateId(),
    date,
    weightKg: Math.round(weightKg * 10) / 10,
    heightCm: heights,
    waistCm: Math.round(waistCm * 10) / 10,
    hipCm: 96,
    bmi: Math.round(bmi * 10) / 10,
  });
}

export const appointmentData: Appointment[] = [
  {
    id: generateId(),
    date: daysLater(3),
    time: '09:30',
    doctor: '王医生',
    department: '心内科',
    hospital: '市第一人民医院',
    type: 'follow-up',
    note: '定期复诊，调整用药方案',
    isCompleted: false,
  },
  {
    id: generateId(),
    date: daysLater(17),
    time: '14:00',
    doctor: '李医生',
    department: '心内科',
    hospital: '市第一人民医院',
    type: 'exam',
    note: '定期复查，包括心电图和血生化检查',
    isCompleted: false,
  },
];

export const visitRecordData: VisitRecord[] = [
  {
    id: generateId(),
    date: daysAgo(60),
    doctor: '王医生',
    department: '心内科',
    hospital: '市第一人民医院',
    diagnosis: '原发性高血压2级',
    treatment: '开始服用氨氯地平片5mg每日一次，缬沙坦胶囊80mg每日一次',
    note: '血压控制目标：收缩压<130/80mmHg以下',
  },
  {
    id: generateId(),
    date: daysAgo(45),
    doctor: '王医生',
    department: '心内科',
    hospital: '市第一人民医院',
    diagnosis: '高血压随访',
    treatment: '加用氢氯噻嗪片12.5mg每日一次',
    note: '血压控制仍偏高，调整用药',
  },
  {
    id: generateId(),
    date: daysAgo(30),
    doctor: '李医生',
    department: '心内科',
    hospital: '市第一人民医院',
    diagnosis: '高血压随访',
    treatment: '加用阿司匹林肠溶片100mg每日一次',
    note: '血压控制良好，建议继续维持用药',
  },
];

export const examReportData: ExamReport[] = [
  {
    id: generateId(),
    date: daysAgo(30),
    type: 'blood',
    typeLabel: '血生化检查',
    hospital: '市第一人民医院',
    summary: '各项指标基本正常',
    findings: [
      '总胆固醇：4.8mmol/L（正常）',
      '甘油三酯：1.5mmol/L（正常）',
      '低密度脂蛋白：2.8mmol/L（正常）',
      '高密度脂蛋白：1.2mmol/L（正常）',
      '空腹血糖：5.6mmol/L（正常）',
      '肌酐：78μmol/L（正常）',
      '尿素氮：5.2mmol/L（正常）',
    ],
    isNormal: true,
  },
  {
    id: generateId(),
    date: daysAgo(30),
    type: 'urine',
    typeLabel: '尿常规检查',
    hospital: '市第一人民医院',
    summary: '尿常规正常',
    findings: [
      '尿蛋白：阴性（-）',
      '尿糖：阴性（-）',
      '尿潜血：阴性（-）',
      '白细胞：阴性（-）',
    ],
    isNormal: true,
  },
  {
    id: generateId(),
    date: daysAgo(30),
    type: 'ecg',
    typeLabel: '心电图检查',
    hospital: '市第一人民医院',
    summary: '窦性心律，大致正常心电图',
    findings: [
      '心率：76次/分',
      'P-R间期：0.16秒（正常）',
      'QRS时限：0.08秒（正常）',
      'ST-T未见明显异常',
    ],
    isNormal: true,
  },
  {
    id: generateId(),
    date: daysAgo(90),
    type: 'kidney',
    typeLabel: '肾功能检查',
    hospital: '市第一人民医院',
    summary: '肾功能正常',
    findings: [
      '血肌酐：82μmol/L（正常）',
      '尿素氮：5.6mmol/L（正常）',
      '尿酸：360μmol/L（正常）',
      '估算肾小球滤过率：92ml/min（正常）',
    ],
    isNormal: true,
  },
];
