import type {
  Patent,
  PatentStatus,
  PatentType,
  StatusRecord,
  AnnuityRecord,
  FileAttachment,
  Trademark,
  Copyright,
  CompetitorPatent,
  InfringementAssessment,
  RiskLevel,
  LicenseAgreement,
  TechnologyTransfer,
  PledgeFinancing,
  PatentValuation,
  ValuationFactor,
  PaymentRecord,
} from '../types';
import { generateId } from './formatters';
import { addYears, getCurrentYear, formatDate } from './dateUtils';
import { generateAnnuitySchedule, checkAnnuityStatus } from './annuityCalc';

const PATENT_NAMES = [
  '基于深度学习的图像识别方法及系统',
  '新能源汽车电池管理系统及控制策略',
  '5G通信信号优化处理装置',
  '智能制造生产线调度优化算法',
  '物联网数据安全加密传输协议',
  '人工智能辅助医疗诊断系统',
  '区块链供应链溯源方法',
  '智能仓储机器人路径规划系统',
  '虚拟现实教学场景构建方法',
  '无人驾驶环境感知与决策系统',
  '大数据用户行为分析平台',
  '云计算资源动态调度方法',
  '边缘计算卸载策略优化',
  '量子加密通信密钥分发协议',
  '生物特征识别多模态融合技术',
  '智能电网负载预测与优化',
  '工业互联网平台架构设计',
  '智能客服自然语言理解算法',
  '智慧城市交通流预测模型',
  '增强现实室内导航系统',
];

const INVENTORS = [
  ['张明', '李华', '王强'],
  ['刘伟', '陈静', '赵磊'],
  ['杨帆', '周杰', '吴敏'],
  ['郑涛', '孙丽', '马超'],
  ['黄鹏', '徐峰', '朱琳'],
  ['胡军', '林燕', '何冰'],
  ['高翔', '罗敏', '梁涛'],
  ['宋晨', '唐亮', '韩雪'],
  ['冯刚', '董浩', '程伟'],
  ['曹军', '袁媛', '邓凯'],
];

const TECHNICAL_FIELDS = [
  '人工智能与机器学习',
  '新能源技术',
  '通信技术',
  '智能制造',
  '物联网',
  '医疗信息技术',
  '区块链技术',
  '机器人技术',
  '虚拟现实/增强现实',
  '自动驾驶',
  '大数据分析',
  '云计算',
  '边缘计算',
  '量子通信',
  '生物识别',
  '智能电网',
  '工业互联网',
  '自然语言处理',
  '智慧城市',
  '导航技术',
];

const IPC_CLASSIFICATIONS = [
  'G06N3/08',
  'G06F17/18',
  'H04W72/12',
  'B25J9/16',
  'H04L29/08',
  'G16H50/20',
  'G06Q10/08',
  'G05D1/02',
  'G06F21/60',
  'G06K9/62',
  'G06F16/90',
  'G06F9/50',
  'H04B10/70',
  'G06V40/10',
  'G06Q50/06',
  'H04L41/14',
  'G06F40/30',
  'G08G1/01',
  'G06T19/00',
  'G01C21/20',
];

const REGIONS = [
  ['CN'],
  ['CN', 'US'],
  ['CN', 'US', 'EP'],
  ['CN', 'US', 'JP'],
  ['CN', 'EP', 'WO'],
  ['CN', 'US', 'EP', 'JP'],
];

const TRADEMARK_NAMES = [
  '智创未来',
  '科盾卫士',
  '云图科技',
  '蓝芯智能',
  '华宇创新',
  '锐智达',
  '恒信科技',
  '博思远',
  '格物致知',
  '明德至善',
  '精工智造',
  '天网智联',
];

const TRADEMARK_CATEGORIES = [
  ['第9类-科学仪器'],
  ['第42类-设计研究'],
  ['第38类-通讯服务'],
  ['第35类-广告销售'],
  ['第9类', '第42类'],
  ['第9类', '第38类'],
  ['第42类', '第35类'],
  ['第9类', '第42类', '第38类'],
];

const COPYRIGHT_WORK_TYPES = [
  '计算机软件',
  '美术作品',
  '文字作品',
  '工程设计图',
  '产品设计图',
  '音乐作品',
];

const COPYRIGHT_NAMES = [
  '智能数据分析平台V1.0',
  '企业级管理系统UI设计',
  '深度学习框架核心算法',
  '物联网设备控制程序',
  '云计算资源调度系统',
  '移动端APP界面设计',
  '区块链智能合约代码',
  '数据可视化图表库',
];

const COMPETITOR_NAMES = [
  '华为技术有限公司',
  '中兴通讯股份有限公司',
  '阿里巴巴集团控股有限公司',
  '腾讯科技(深圳)有限公司',
  '百度在线网络技术(北京)有限公司',
  '小米科技有限责任公司',
  '京东集团',
  '字节跳动有限公司',
  '科大讯飞股份有限公司',
  '海康威视数字技术股份有限公司',
];

const RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function randomDate(startYear: number, endYear: number): string {
  const year = randomInt(startYear, endYear);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function randomApplicationNumber(): string {
  const prefix = randomPick(['CN', 'US', 'EP', 'WO']);
  const year = randomInt(2018, 2024);
  const number = randomInt(100000, 999999);
  const suffix = randomPick(['A', 'B1', 'B2', 'U', 'S']);
  return `${prefix}${year}${number}${suffix}`;
}

function randomRegistrationNumber(prefix: string): string {
  const number = randomInt(1000000, 9999999);
  return `${prefix}${number}`;
}

function createStatusHistory(
  patentType: PatentType,
  applicationDate: string
): { status: PatentStatus; history: StatusRecord[] } {
  const history: StatusRecord[] = [];
  const baseDate = new Date(applicationDate);
  const year = baseDate.getFullYear();

  history.push({
    id: generateId(),
    status: 'APPLICATION',
    date: applicationDate,
    note: '专利申请提交',
  });

  const stages: PatentStatus[] = ['SUBSTANTIVE_EXAMINATION', 'AUTHORIZED', 'MAINTENANCE'];
  const randomIndex = randomInt(0, 3);

  for (let i = 0; i <= randomIndex && i < stages.length; i++) {
    const stage = stages[i];
    const daysToAdd = (i + 1) * randomInt(180, 540);
    const stageDate = new Date(baseDate);
    stageDate.setDate(stageDate.getDate() + daysToAdd);

    if (stageDate.getFullYear() > getCurrentYear()) break;

    history.push({
      id: generateId(),
      status: stage,
      date: formatDate(stageDate),
      note: getStatusNote(stage),
    });
  }

  const currentStatus = history[history.length - 1].status;
  return { status: currentStatus, history };
}

function getStatusNote(status: PatentStatus): string {
  const notes: Record<PatentStatus, string> = {
    APPLICATION: '专利申请提交',
    SUBSTANTIVE_EXAMINATION: '进入实质审查阶段',
    AUTHORIZED: '获得专利授权',
    MAINTENANCE: '进入正常维护阶段',
    ENFORCEMENT: '正在进行维权行动',
    EXPIRED: '专利权已届满',
  };
  return notes[status];
}

function createFileAttachments(count: number): FileAttachment[] {
  const files: FileAttachment[] = [];
  const fileTypes = [
    { name: '专利说明书.pdf', type: 'application/pdf' },
    { name: '权利要求书.pdf', type: 'application/pdf' },
    { name: '说明书附图.pdf', type: 'application/pdf' },
    { name: '审查意见通知书.pdf', type: 'application/pdf' },
    { name: '授权证书.pdf', type: 'application/pdf' },
  ];

  for (let i = 0; i < count; i++) {
    const fileType = fileTypes[i % fileTypes.length];
    files.push({
      id: generateId(),
      name: fileType.name,
      type: fileType.type,
      size: randomInt(100000, 5000000),
      uploadDate: randomDate(2023, 2026),
      url: `/files/${generateId()}/${fileType.name}`,
    });
  }

  return files;
}

function createPaymentRecords(
  totalAmount: number,
  startDate: string,
  count: number
): PaymentRecord[] {
  const records: PaymentRecord[] = [];
  const perPayment = totalAmount / count;
  const baseDate = new Date(startDate);

  for (let i = 0; i < count; i++) {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(dueDate.getMonth() + i * 12);

    const isPaid = dueDate < new Date();
    const paidDate = isPaid
      ? (() => {
          const d = new Date(dueDate);
          d.setDate(d.getDate() - randomInt(1, 15));
          return formatDate(d);
        })()
      : undefined;

    records.push({
      id: generateId(),
      dueDate: formatDate(dueDate),
      amount: Math.round(perPayment * 100) / 100,
      paidDate,
      status: isPaid ? 'PAID' : 'PENDING',
      reference: isPaid ? `PAY-${randomInt(100000, 999999)}` : undefined,
    });
  }

  return records;
}

function createValuationFactors(): ValuationFactor[] {
  const factorDefs = [
    { name: '技术先进性', weight: 0.25, desc: '技术方案的创新程度和领先水平' },
    { name: '市场应用前景', weight: 0.2, desc: '专利技术的商业化潜力和市场规模' },
    { name: '权利稳定性', weight: 0.15, desc: '专利权利要求的稳定性和保护范围' },
    { name: '侵权风险', weight: 0.15, desc: '规避现有专利的程度和诉讼风险' },
    { name: '剩余保护期限', weight: 0.15, desc: '专利剩余有效保护年限' },
    { name: '行业发展趋势', weight: 0.1, desc: '所属技术领域的发展前景' },
  ];

  return factorDefs.map((def) => ({
    name: def.name,
    weight: def.weight,
    score: randomInt(60, 95),
    description: def.desc,
  }));
}

export function generateMockPatents(): Patent[] {
  const patents: Patent[] = [];
  const patentTypes: PatentType[] = ['INVENTION', 'UTILITY_MODEL', 'DESIGN'];
  const count = randomInt(15, 20);

  for (let i = 0; i < count; i++) {
    const applicationDate = randomDate(2018, 2023);
    const patentType = randomPick(patentTypes);
    const { status, history } = createStatusHistory(patentType, applicationDate);
    const yearsSinceApplication = getCurrentYear() - new Date(applicationDate).getFullYear() + 5;
    const annuityRecords = generateAnnuitySchedule(applicationDate, patentType, yearsSinceApplication);

    const updatedRecords = annuityRecords.map((record) => {
      const shouldPay = randomInt(0, 10) > 2;
      if (shouldPay && new Date(record.dueDate) < new Date()) {
        const paidDate = new Date(record.dueDate);
        paidDate.setDate(paidDate.getDate() - randomInt(1, 30));
        return {
          ...record,
          paidDate: formatDate(paidDate),
          paidAmount: record.amount,
          status: checkAnnuityStatus({
            ...record,
            paidDate: formatDate(paidDate),
            paidAmount: record.amount,
            status: 'PAID',
          }),
          paymentProof: `/payments/${generateId()}.pdf`,
        };
      }
      return {
        ...record,
        status: checkAnnuityStatus(record),
      };
    });

    const authorizationDate = history.find((h) => h.status === 'AUTHORIZED')?.date;

    patents.push({
      id: generateId(),
      name: PATENT_NAMES[i % PATENT_NAMES.length],
      applicationNumber: randomApplicationNumber(),
      inventors: randomPick(INVENTORS),
      applicationDate,
      authorizationDate,
      patentType,
      patentScope: randomPick(['中国', '全球', '主要经济体']),
      status,
      statusHistory: history,
      annuityRecords: updatedRecords,
      technicalField: TECHNICAL_FIELDS[i % TECHNICAL_FIELDS.length],
      ipcClassification: IPC_CLASSIFICATIONS[i % IPC_CLASSIFICATIONS.length],
      abstract: `本${patentType === 'INVENTION' ? '发明' : patentType === 'UTILITY_MODEL' ? '实用新型' : '外观设计'}公开了一种${PATENT_NAMES[i % PATENT_NAMES.length]}，属于${TECHNICAL_FIELDS[i % TECHNICAL_FIELDS.length]}技术领域。该技术方案解决了现有技术中存在的效率低、成本高、安全性不足等问题，具有显著的技术进步和实用价值。`,
      claims: '1. 一种权利要求所述的方法，其特征在于...',
      description: '详细描述...',
      files: createFileAttachments(randomInt(2, 5)),
      regions: randomPick(REGIONS),
      createdAt: randomDate(2023, 2025),
      updatedAt: randomDate(2024, 2026),
    });
  }

  return patents;
}

export function generateMockTrademarks(): Trademark[] {
  const trademarks: Trademark[] = [];
  const statuses: Trademark['status'][] = ['APPLIED', 'REGISTERED', 'RENEWED', 'EXPIRED', 'OPPOSED'];
  const count = randomInt(8, 10);

  for (let i = 0; i < count; i++) {
    const applicationDate = randomDate(2019, 2023);
    const baseDate = new Date(applicationDate);
    const registrationDate = new Date(baseDate);
    registrationDate.setMonth(registrationDate.getMonth() + randomInt(6, 18));
    const validFrom = formatDate(registrationDate);
    const validTo = addYears(validFrom, 10);

    trademarks.push({
      id: generateId(),
      name: TRADEMARK_NAMES[i % TRADEMARK_NAMES.length],
      registrationNumber: randomRegistrationNumber('TM'),
      logoImage: `/logos/${TRADEMARK_NAMES[i % TRADEMARK_NAMES.length]}.png`,
      categories: randomPick(TRADEMARK_CATEGORIES),
      applicationDate,
      registrationDate: formatDate(registrationDate),
      validFrom,
      validTo,
      regions: randomPick(REGIONS),
      owner: '本公司',
      status: randomPick(statuses),
      files: createFileAttachments(randomInt(1, 3)),
      createdAt: randomDate(2023, 2025),
    });
  }

  return trademarks;
}

export function generateMockCopyrights(): Copyright[] {
  const copyrights: Copyright[] = [];
  const count = randomInt(6, 8);

  for (let i = 0; i < count; i++) {
    const completionDate = randomDate(2020, 2023);
    const baseDate = new Date(completionDate);
    const registrationDate = new Date(baseDate);
    registrationDate.setMonth(registrationDate.getMonth() + randomInt(1, 6));

    copyrights.push({
      id: generateId(),
      workName: COPYRIGHT_NAMES[i % COPYRIGHT_NAMES.length],
      workType: randomPick(COPYRIGHT_WORK_TYPES),
      completionDate,
      registrationDate: formatDate(registrationDate),
      registrationNumber: randomRegistrationNumber('CR'),
      certificateImage: `/certificates/${generateId()}.png`,
      authors: randomPick(INVENTORS).slice(0, randomInt(1, 3)),
      owner: '本公司',
      description: `${COPYRIGHT_NAMES[i % COPYRIGHT_NAMES.length]}是本公司独立开发完成的原创作品，具有完整的知识产权。`,
      regions: ['CN'],
      files: createFileAttachments(randomInt(1, 2)),
      createdAt: randomDate(2023, 2025),
    });
  }

  return copyrights;
}

export function generateMockCompetitorPatents(): CompetitorPatent[] {
  const competitorPatents: CompetitorPatent[] = [];
  const monitoringStatuses: CompetitorPatent['monitoringStatus'][] = ['MONITORING', 'TRACKING', 'DISMISSED'];
  const count = randomInt(10, 12);

  for (let i = 0; i < count; i++) {
    const applicationDate = randomDate(2020, 2024);
    const baseDate = new Date(applicationDate);
    const publicationDate = new Date(baseDate);
    publicationDate.setMonth(publicationDate.getMonth() + randomInt(6, 18));
    const discoveryDate = new Date(publicationDate);
    discoveryDate.setDate(discoveryDate.getDate() + randomInt(7, 60));

    competitorPatents.push({
      id: generateId(),
      patentName: PATENT_NAMES[(i + 3) % PATENT_NAMES.length],
      applicationNumber: randomApplicationNumber(),
      applicant: COMPETITOR_NAMES[i % COMPETITOR_NAMES.length],
      competitorName: COMPETITOR_NAMES[i % COMPETITOR_NAMES.length],
      applicationDate,
      publicationDate: formatDate(publicationDate),
      technicalField: TECHNICAL_FIELDS[(i + 2) % TECHNICAL_FIELDS.length],
      ipcClassification: IPC_CLASSIFICATIONS[(i + 1) % IPC_CLASSIFICATIONS.length],
      discoveryDate: formatDate(discoveryDate),
      abstract: `该专利涉及${TECHNICAL_FIELDS[(i + 2) % TECHNICAL_FIELDS.length]}领域的技术方案，由${COMPETITOR_NAMES[i % COMPETITOR_NAMES.length]}申请。技术内容与我司相关产品存在一定的技术重叠，需要持续关注。`,
      relevanceScore: randomInt(50, 95) / 100,
      monitoringStatus: randomPick(monitoringStatuses),
      notes: `该专利技术方向与我司${PATENT_NAMES[(i + 5) % PATENT_NAMES.length]}相关，建议持续监控其法律状态和市场应用情况。`,
    });
  }

  return competitorPatents;
}

export function generateMockInfringementAssessments(
  patents: Patent[],
  competitorPatents: CompetitorPatent[]
): InfringementAssessment[] {
  const assessments: InfringementAssessment[] = [];
  const count = randomInt(5, 7);

  for (let i = 0; i < count; i++) {
    const ourPatent = patents[i % patents.length];
    const compPatent = competitorPatents[i % competitorPatents.length];
    const riskLevel = randomPick(RISK_LEVELS);

    assessments.push({
      id: generateId(),
      competitorPatentId: compPatent.id,
      ourPatentId: ourPatent.id,
      assessmentDate: randomDate(2024, 2026),
      riskLevel,
      similarityAnalysis: `经过技术比对，竞品专利${compPatent.patentName}与我司专利${ourPatent.name}在技术方案上存在${riskLevel === 'CRITICAL' ? '高度' : riskLevel === 'HIGH' ? '较高' : riskLevel === 'MEDIUM' ? '一定' : '较低'}的相似性，特别是在权利要求${randomInt(1, 5)}所记载的技术特征方面。`,
      claimComparison: `竞品专利权利要求1与我司专利权利要求${randomInt(1, 3)}相比，在以下技术特征上存在异同：1) 技术目的相同；2) 技术手段存在${riskLevel === 'LOW' ? '显著' : '部分'}差异；3) 技术效果${riskLevel === 'CRITICAL' ? '基本相同' : '存在差异'}。`,
      legalAdvice: `根据当前分析结果，建议${riskLevel === 'CRITICAL' ? '立即启动无效宣告程序，同时准备侵权诉讼应对方案' : riskLevel === 'HIGH' ? '委托专业律师进行深入的法律分析，考虑提出规避设计方案' : riskLevel === 'MEDIUM' ? '持续监控竞品专利的法律状态，评估许可可能性' : '定期复查，暂无 immediate 风险'}。`,
      recommendedActions: [
        '进行更深入的技术比对分析',
        '咨询外部律师获取专业法律意见',
        '评估专利许可或交叉许可可能性',
        '准备规避设计方案',
      ].slice(0, randomInt(2, 4)),
      assessor: '知识产权部-法务专员',
      competitorPatent: compPatent,
      ourPatent: ourPatent,
    });
  }

  return assessments;
}

export function generateMockLicenseAgreements(patents: Patent[]): LicenseAgreement[] {
  const agreements: LicenseAgreement[] = [];
  const licenseTypes: LicenseAgreement['licenseType'][] = ['EXCLUSIVE', 'NON_EXCLUSIVE', 'SOLE'];
  const statuses: LicenseAgreement['status'][] = ['ACTIVE', 'EXPIRED', 'TERMINATED'];
  const count = randomInt(5, 6);

  for (let i = 0; i < count; i++) {
    const effectiveDate = randomDate(2021, 2023);
    const expirationDate = addYears(effectiveDate, randomInt(3, 5));
    const licenseFee = randomInt(500000, 5000000);
    const selectedPatents = patents.slice(i, i + randomInt(1, 3));

    agreements.push({
      id: generateId(),
      agreementNumber: `LIC-${2023 + i}-${String(randomInt(100, 999)).padStart(3, '0')}`,
      patentIds: selectedPatents.map((p) => p.id),
      licensee: COMPETITOR_NAMES[(i + 2) % COMPETITOR_NAMES.length],
      licenseScope: '制造、使用、销售、许诺销售专利产品',
      licenseType: randomPick(licenseTypes),
      territory: ['中国大陆'],
      effectiveDate,
      expirationDate,
      licenseFee,
      paymentTerms: '首付30%，剩余款项按年支付',
      paymentRecords: createPaymentRecords(licenseFee, effectiveDate, randomInt(3, 5)),
      status: randomPick(statuses),
      contractFile: `/contracts/${generateId()}.pdf`,
      notes: `该许可协议涉及${selectedPatents.length}项专利技术，被许可方为行业内重要合作伙伴，协议执行情况良好。`,
      patents: selectedPatents,
    });
  }

  return agreements;
}

export function generateMockTechnologyTransfers(patents: Patent[]): TechnologyTransfer[] {
  const transfers: TechnologyTransfer[] = [];
  const transferTypes: TechnologyTransfer['transferType'][] = ['ASSIGNMENT', 'MERGER', 'SPIN_OFF'];
  const statuses: TechnologyTransfer['status'][] = ['PENDING', 'COMPLETED', 'CANCELLED'];
  const count = randomInt(3, 4);

  for (let i = 0; i < count; i++) {
    const selectedPatents = patents.slice(i * 2, i * 2 + randomInt(2, 4));

    transfers.push({
      id: generateId(),
      transferNumber: `TRF-${2023 + i}-${String(randomInt(100, 999)).padStart(3, '0')}`,
      patentIds: selectedPatents.filter((p) => p).map((p) => p.id),
      transferor: '本公司',
      transferee: COMPETITOR_NAMES[(i + 4) % COMPETITOR_NAMES.length],
      transferType: randomPick(transferTypes),
      transferDate: randomDate(2022, 2025),
      consideration: randomInt(2000000, 20000000),
      status: randomPick(statuses),
      agreementFile: `/agreements/${generateId()}.pdf`,
      notes: `本次技术转让涉及${selectedPatents.filter((p) => p).length}项专利资产，为公司战略调整的重要组成部分，转让所得将用于核心业务领域的研发投入。`,
      patents: selectedPatents.filter((p) => p),
    });
  }

  return transfers;
}

export function generateMockPledgeFinancings(patents: Patent[]): PledgeFinancing[] {
  const financings: PledgeFinancing[] = [];
  const statuses: PledgeFinancing['status'][] = ['ACTIVE', 'MATURED', 'REDEEMED'];
  const count = randomInt(2, 3);

  for (let i = 0; i < count; i++) {
    const startDate = randomDate(2022, 2024);
    const termMonths = randomInt(12, 36);
    const baseDate = new Date(startDate);
    const maturityDate = new Date(baseDate);
    maturityDate.setMonth(maturityDate.getMonth() + termMonths);
    const registrationDate = new Date(baseDate);
    registrationDate.setDate(registrationDate.getDate() + randomInt(7, 30));
    const selectedPatents = patents.slice(i * 3, i * 3 + randomInt(3, 5));

    financings.push({
      id: generateId(),
      financingNumber: `PLG-${2023 + i}-${String(randomInt(100, 999)).padStart(3, '0')}`,
      patentIds: selectedPatents.filter((p) => p).map((p) => p.id),
      pledgee: ['招商银行股份有限公司', '中国工商银行股份有限公司', '中国建设银行股份有限公司'][i % 3],
      financingAmount: randomInt(5000000, 50000000),
      interestRate: randomInt(350, 600) / 100,
      termMonths,
      startDate,
      maturityDate: formatDate(maturityDate),
      registrationDate: formatDate(registrationDate),
      status: randomPick(statuses),
      notes: `本次专利质押融资以${selectedPatents.filter((p) => p).length}项高价值专利为质押物，融资所得资金主要用于新产品研发和市场拓展，目前还款情况正常。`,
      patents: selectedPatents.filter((p) => p),
    });
  }

  return financings;
}

export function generateMockPatentValuations(patents: Patent[]): PatentValuation[] {
  const valuations: PatentValuation[] = [];
  const valuationMethods = ['收益法', '成本法', '市场法', '综合评估法'];
  const count = randomInt(8, 10);

  for (let i = 0; i < count; i++) {
    const patent = patents[i % patents.length];
    const baseValue = randomInt(1000000, 50000000);

    valuations.push({
      id: generateId(),
      patentId: patent.id,
      valuationDate: randomDate(2023, 2026),
      valuationMethod: randomPick(valuationMethods),
      estimatedValue: baseValue,
      currency: 'CNY',
      factors: createValuationFactors(),
      assumptions: '假设技术发展趋势稳定，市场环境无重大变化，专利能够得到有效保护和实施。',
      limitations: '本次评估基于现有信息，未考虑未来技术突破、市场突变等不可预见因素的影响。',
      valuer: ['北京中企华资产评估有限责任公司', '中联资产评估集团有限公司', '北京天健兴业资产评估有限公司'][i % 3],
      patent,
    });
  }

  return valuations;
}

export function generateAllMockData() {
  const patents = generateMockPatents();
  const trademarks = generateMockTrademarks();
  const copyrights = generateMockCopyrights();
  const competitorPatents = generateMockCompetitorPatents();
  const infringementAssessments = generateMockInfringementAssessments(patents, competitorPatents);
  const licenseAgreements = generateMockLicenseAgreements(patents);
  const technologyTransfers = generateMockTechnologyTransfers(patents);
  const pledgeFinancings = generateMockPledgeFinancings(patents);
  const patentValuations = generateMockPatentValuations(patents);

  return {
    patents,
    trademarks,
    copyrights,
    competitorPatents,
    infringementAssessments,
    licenseAgreements,
    technologyTransfers,
    pledgeFinancings,
    patentValuations,
  };
}
