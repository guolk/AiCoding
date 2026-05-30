import { generateId } from './dateUtils';

export interface BaseRecord {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'id_card' | 'passport' | 'driver_license' | 'social_security' | 'bank_card' | 'other';

export interface Document extends BaseRecord {
  type: DocumentType;
  number: string;
  name: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  photoUrl?: string;
  notes?: string;
  reminderDays: number;
  memberId?: string;
}

export type LegalType = 'property_contract' | 'labor_contract' | 'insurance_contract' | 'other';

export interface KeyClause {
  id: string;
  title: string;
  content: string;
  highlighted: boolean;
}

export interface LegalDocument extends BaseRecord {
  type: LegalType;
  title: string;
  partyA: string;
  partyB: string;
  signDate: string;
  effectiveDate: string;
  expiryDate: string;
  contractAmount: string;
  keyClauses: KeyClause[];
  reminderDays: number;
  scanFileUrl?: string;
  notes?: string;
}

export interface FamilyMember extends BaseRecord {
  name: string;
  relationship: string;
  birthDate: string;
  avatar?: string;
}

export type FamilyRecordType = 'property_certificate' | 'vehicle_registration' | 'education_certificate' | 'will' | 'power_of_attorney' | 'other';

export interface FamilyRecord extends BaseRecord {
  type: FamilyRecordType;
  title: string;
  memberId?: string;
  issueDate: string;
  expiryDate?: string;
  issuingAuthority: string;
  fileUrl?: string;
  notes?: string;
  reminderDays: number;
}

export interface BankAccount extends BaseRecord {
  bankName: string;
  accountNumber: string;
  branch: string;
  accountType: string;
  memberId?: string;
  notes?: string;
}

export interface InsurancePolicy extends BaseRecord {
  insuranceCompany: string;
  policyNumber: string;
  policyType: string;
  coverageAmount: string;
  startDate: string;
  expiryDate: string;
  beneficiary: string;
  emergencyPhone: string;
  memberId?: string;
  notes?: string;
  reminderDays: number;
}

export interface InvestmentAccount extends BaseRecord {
  institution: string;
  accountNumber: string;
  accountType: string;
  memberId?: string;
  notes?: string;
}

export interface EmergencyContact extends BaseRecord {
  name: string;
  relationship: string;
  phone: string;
  address?: string;
  priority: number;
}

export interface UserSettings {
  defaultReminderDays: number;
  notifyOnWarning: boolean;
  notifyOnDanger: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

const now = new Date();
const userId = 'user_001';

function futureDate(days: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function pastDate(days: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export const mockUser: User = {
  id: userId,
  email: 'demo@example.com',
  name: '张三',
};

export const mockDocuments: Document[] = [
  {
    id: generateId(),
    userId,
    createdAt: pastDate(365),
    updatedAt: pastDate(30),
    type: 'id_card',
    number: '110101199001011234',
    name: '张三',
    issueDate: '2020-01-15',
    expiryDate: futureDate(365),
    issuingAuthority: '北京市公安局',
    notes: '第二代居民身份证',
    reminderDays: 90,
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(200),
    updatedAt: pastDate(100),
    type: 'passport',
    number: 'E12345678',
    name: '张三',
    issueDate: '2022-05-20',
    expiryDate: futureDate(450),
    issuingAuthority: '国家移民管理局',
    notes: '普通护照，有效期10年',
    reminderDays: 180,
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(150),
    updatedAt: pastDate(20),
    type: 'driver_license',
    number: '110101199001011234',
    name: '张三',
    issueDate: '2018-03-10',
    expiryDate: futureDate(20),
    issuingAuthority: '北京市公安局交通管理局',
    notes: 'C1准驾车型，需年审',
    reminderDays: 60,
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(500),
    updatedAt: pastDate(200),
    type: 'social_security',
    number: '110101199001011234',
    name: '张三',
    issueDate: '2015-08-01',
    expiryDate: futureDate(730),
    issuingAuthority: '北京市人力资源和社会保障局',
    notes: '职工社会保障卡',
    reminderDays: 90,
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(100),
    updatedAt: pastDate(10),
    type: 'bank_card',
    number: '6222021234567890123',
    name: '张三',
    issueDate: '2023-01-05',
    expiryDate: futureDate(900),
    issuingAuthority: '中国工商银行',
    notes: '储蓄卡，工资卡',
    reminderDays: 90,
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(10),
    updatedAt: pastDate(5),
    type: 'id_card',
    number: '110101199502022345',
    name: '李四',
    issueDate: '2021-06-20',
    expiryDate: pastDate(15),
    issuingAuthority: '上海市公安局',
    notes: '已过期，需要补办',
    reminderDays: 30,
    memberId: 'member_002',
  },
];

export const mockLegalDocuments: LegalDocument[] = [
  {
    id: generateId(),
    userId,
    createdAt: pastDate(400),
    updatedAt: pastDate(50),
    type: 'property_contract',
    title: '房屋买卖合同',
    partyA: '张三',
    partyB: '北京房地产开发有限公司',
    signDate: '2022-03-15',
    effectiveDate: '2022-04-01',
    expiryDate: futureDate(720),
    contractAmount: '3,500,000',
    keyClauses: [
      {
        id: generateId(),
        title: '付款方式',
        content: '首付30%，剩余70%银行按揭贷款，分30年等额本息还款',
        highlighted: true,
      },
      {
        id: generateId(),
        title: '交付时间',
        content: '开发商应于2024年12月31日前完成房屋交付',
        highlighted: false,
      },
      {
        id: generateId(),
        title: '违约责任',
        content: '逾期交房每日违约金为房款的万分之二',
        highlighted: true,
      },
    ],
    reminderDays: 90,
    notes: '朝阳区望京小区1号楼2单元301室',
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(180),
    updatedAt: pastDate(30),
    type: 'labor_contract',
    title: '劳动合同',
    partyA: '张三',
    partyB: '北京科技有限公司',
    signDate: '2023-01-01',
    effectiveDate: '2023-01-01',
    expiryDate: futureDate(210),
    contractAmount: '25,000/月',
    keyClauses: [
      {
        id: generateId(),
        title: '试用期',
        content: '试用期3个月，试用期工资为转正工资的80%',
        highlighted: false,
      },
      {
        id: generateId(),
        title: '工作时间',
        content: '标准工时制，双休，加班按劳动法规定支付加班费',
        highlighted: true,
      },
    ],
    reminderDays: 60,
    notes: '技术总监岗位',
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(600),
    updatedAt: pastDate(100),
    type: 'insurance_contract',
    title: '车辆保险合同',
    partyA: '张三',
    partyB: '中国平安财产保险股份有限公司',
    signDate: '2023-06-15',
    effectiveDate: '2023-06-20',
    expiryDate: futureDate(15),
    contractAmount: '5,200/年',
    keyClauses: [
      {
        id: generateId(),
        title: '保险金额',
        content: '第三者责任险200万，车损险15万，车上人员责任险各5万',
        highlighted: true,
      },
    ],
    reminderDays: 30,
    notes: '京A12345 特斯拉Model 3',
  },
];

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: 'member_001',
    userId,
    createdAt: pastDate(500),
    updatedAt: pastDate(100),
    name: '张三',
    relationship: '本人',
    birthDate: '1990-01-01',
    avatar: '',
  },
  {
    id: 'member_002',
    userId,
    createdAt: pastDate(400),
    updatedAt: pastDate(50),
    name: '李四',
    relationship: '配偶',
    birthDate: '1995-02-02',
    avatar: '',
  },
  {
    id: 'member_003',
    userId,
    createdAt: pastDate(300),
    updatedAt: pastDate(30),
    name: '张小宝',
    relationship: '子女',
    birthDate: '2020-05-10',
    avatar: '',
  },
  {
    id: 'member_004',
    userId,
    createdAt: pastDate(350),
    updatedAt: pastDate(80),
    name: '张大爷',
    relationship: '父亲',
    birthDate: '1965-08-15',
    avatar: '',
  },
];

export const mockFamilyRecords: FamilyRecord[] = [
  {
    id: generateId(),
    userId,
    createdAt: pastDate(500),
    updatedAt: pastDate(200),
    type: 'property_certificate',
    title: '房屋所有权证',
    issueDate: '2022-05-20',
    issuingAuthority: '北京市规划和自然资源委员会',
    notes: '朝阳区望京小区1号楼2单元301室，建筑面积89.5平方米',
    reminderDays: 0,
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(300),
    updatedAt: pastDate(50),
    type: 'vehicle_registration',
    title: '机动车登记证书',
    issueDate: '2021-08-10',
    issuingAuthority: '北京市公安局交通管理局',
    notes: '特斯拉Model 3，车牌号京A12345',
    reminderDays: 0,
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(600),
    updatedAt: pastDate(300),
    type: 'education_certificate',
    title: '本科毕业证书',
    memberId: 'member_001',
    issueDate: '2012-06-30',
    issuingAuthority: '清华大学',
    notes: '计算机科学与技术专业，学士学位',
    reminderDays: 0,
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(450),
    updatedAt: pastDate(150),
    type: 'will',
    title: '自书遗嘱',
    issueDate: '2023-01-01',
    expiryDate: futureDate(1825),
    issuingAuthority: '北京市公证处',
    notes: '遗嘱公证，指定配偶李四为主要遗产继承人',
    reminderDays: 0,
  },
];

export const mockBankAccounts: BankAccount[] = [
  {
    id: generateId(),
    userId,
    createdAt: pastDate(500),
    updatedAt: pastDate(100),
    bankName: '中国工商银行',
    accountNumber: '6222021234567890123',
    branch: '北京望京支行',
    accountType: '储蓄卡',
    notes: '工资卡，日常使用',
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(300),
    updatedAt: pastDate(50),
    bankName: '中国建设银行',
    accountNumber: '6217009876543210987',
    branch: '北京朝阳支行',
    accountType: '储蓄卡',
    notes: '还房贷专用账户',
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(200),
    updatedAt: pastDate(20),
    bankName: '招商银行',
    accountNumber: '6225881112223334444',
    branch: '北京国贸支行',
    accountType: '信用卡',
    notes: '金卡，额度10万',
    memberId: 'member_002',
  },
];

export const mockInsurancePolicies: InsurancePolicy[] = [
  {
    id: generateId(),
    userId,
    createdAt: pastDate(400),
    updatedAt: pastDate(100),
    insuranceCompany: '中国平安人寿保险',
    policyNumber: 'P20220101000001',
    policyType: '重疾险',
    coverageAmount: '500,000',
    startDate: '2022-01-01',
    expiryDate: futureDate(1095),
    beneficiary: '李四',
    emergencyPhone: '95511',
    notes: '终身重疾险，年交8000元',
    reminderDays: 90,
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(200),
    updatedAt: pastDate(50),
    insuranceCompany: '中国人寿保险',
    policyNumber: 'C20230101000002',
    policyType: '医疗险',
    coverageAmount: '2,000,000',
    startDate: '2023-01-01',
    expiryDate: futureDate(60),
    beneficiary: '法定受益人',
    emergencyPhone: '95519',
    notes: '百万医疗险，年交365元',
    reminderDays: 30,
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(100),
    updatedAt: pastDate(20),
    insuranceCompany: '中国人民保险',
    policyNumber: 'V20230601000003',
    policyType: '车辆保险',
    coverageAmount: '2,250,000',
    startDate: '2023-06-20',
    expiryDate: futureDate(20),
    beneficiary: '张三',
    emergencyPhone: '95518',
    notes: '交强险+商业险，保额225万',
    reminderDays: 30,
    memberId: 'member_001',
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(150),
    updatedAt: pastDate(10),
    insuranceCompany: '友邦保险',
    policyNumber: 'L20220501000004',
    policyType: '教育金保险',
    coverageAmount: '500,000',
    startDate: '2022-05-01',
    expiryDate: futureDate(1825),
    beneficiary: '张小宝',
    emergencyPhone: '400-820-3588',
    notes: '子女教育金，年交2万元，交10年',
    reminderDays: 90,
    memberId: 'member_003',
  },
];

export const mockInvestments: InvestmentAccount[] = [
  {
    id: generateId(),
    userId,
    createdAt: pastDate(600),
    updatedAt: pastDate(100),
    institution: '中信证券',
    accountNumber: '800000123456',
    accountType: '股票账户',
    notes: 'A股账户，主要投资蓝筹股',
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(400),
    updatedAt: pastDate(50),
    institution: '天天基金',
    accountNumber: '20230101123456',
    accountType: '基金账户',
    notes: '指数基金定投，每月2000元',
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(200),
    updatedAt: pastDate(20),
    institution: '陆金所',
    accountNumber: 'L20220601987654',
    accountType: '理财产品',
    notes: '稳健型理财，年化收益率约4%',
    memberId: 'member_002',
  },
];

export const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: generateId(),
    userId,
    createdAt: pastDate(500),
    updatedAt: pastDate(100),
    name: '李四',
    relationship: '配偶',
    phone: '13812345678',
    address: '北京市朝阳区望京小区1号楼2单元301室',
    priority: 1,
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(450),
    updatedAt: pastDate(80),
    name: '张大爷',
    relationship: '父亲',
    phone: '13698765432',
    address: '北京市海淀区中关村小区5号楼3单元102室',
    priority: 2,
  },
  {
    id: generateId(),
    userId,
    createdAt: pastDate(300),
    updatedAt: pastDate(30),
    name: '王律师',
    relationship: '私人律师',
    phone: '13511112222',
    address: '北京市朝阳区建国门外大街甲6号SK大厦15层',
    priority: 3,
  },
];

export const mockSettings: UserSettings = {
  defaultReminderDays: 90,
  notifyOnWarning: true,
  notifyOnDanger: true,
};

export interface MockData {
  user: User;
  documents: Document[];
  legalDocuments: LegalDocument[];
  familyMembers: FamilyMember[];
  familyRecords: FamilyRecord[];
  bankAccounts: BankAccount[];
  insurancePolicies: InsurancePolicy[];
  investments: InvestmentAccount[];
  emergencyContacts: EmergencyContact[];
  settings: UserSettings;
}

export const mockData: MockData = {
  user: mockUser,
  documents: mockDocuments,
  legalDocuments: mockLegalDocuments,
  familyMembers: mockFamilyMembers,
  familyRecords: mockFamilyRecords,
  bankAccounts: mockBankAccounts,
  insurancePolicies: mockInsurancePolicies,
  investments: mockInvestments,
  emergencyContacts: mockEmergencyContacts,
  settings: mockSettings,
};
