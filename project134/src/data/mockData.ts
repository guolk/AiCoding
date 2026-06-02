import type { Project, Mentor, Investor, ServiceProvider, Activity, DataRoomItem } from '../types';

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: '智云AI助手',
    track: '人工智能',
    contact: '张明 13800138001',
    joinDate: '2024-01-15',
    stage: 'development',
    description: '基于大语言模型的企业级智能助手，提供智能客服、文档分析、知识管理等功能。',
    founders: '张明、李华、王芳',
    foundingTeam: [
      { id: 't1', name: '张明', role: 'CEO' },
      { id: 't2', name: '李华', role: 'CTO' },
      { id: 't3', name: '王芳', role: 'COO' },
    ],
    businessCanvas: {
      customers: '中小企业、互联网公司、政府机构',
      valueProposition: '提升工作效率，降低人力成本，提供7x24小时智能服务',
      channels: '官网推广、合作伙伴渠道、行业展会、内容营销',
      customerRelationships: 'SaaS订阅模式、专属客户成功经理、社区运营',
      revenueStreams: '订阅费用、定制开发服务费、API调用费用',
      keyResources: 'AI算法团队、云计算资源、行业知识库、技术专利',
      keyActivities: '算法研发、产品迭代、客户服务、市场推广',
      keyPartnerships: '云服务厂商、行业解决方案提供商、AI模型供应商',
      costStructure: '研发成本、云服务费用、市场营销费用、人力成本',
    },
    milestones: [
      { id: 'm1', projectId: 'p1', title: '产品原型完成', description: '完成MVP版本开发', targetDate: '2024-02-28', status: 'completed', completedDate: '2024-02-25' },
      { id: 'm2', projectId: 'p1', title: '种子轮融资', description: '完成500万种子轮融资', targetDate: '2024-04-30', status: 'completed', completedDate: '2024-04-20' },
      { id: 'm3', projectId: 'p1', title: '产品正式上线', description: '1.0版本正式发布', targetDate: '2024-06-30', status: 'in_progress' },
      { id: 'm4', projectId: 'p1', title: '首个付费用户', description: '签约第一个付费企业客户', targetDate: '2024-07-31', status: 'pending' },
      { id: 'm5', projectId: 'p1', title: '月收入10万', description: '月度经常性收入达到10万元', targetDate: '2024-10-31', status: 'pending' },
    ],
    kpiRecords: [
      { id: 'k1', projectId: 'p1', date: '2024-05-01', userCount: 120, revenue: 0, financingProgress: 100 },
      { id: 'k2', projectId: 'p1', date: '2024-05-15', userCount: 250, revenue: 0, financingProgress: 100 },
      { id: 'k3', projectId: 'p1', date: '2024-06-01', userCount: 380, revenue: 0, financingProgress: 100 },
      { id: 'k4', projectId: 'p1', date: '2024-06-15', userCount: 520, revenue: 35000, financingProgress: 100 },
    ],
  },
  {
    id: 'p2',
    name: '绿能新材料',
    track: '新能源',
    contact: '陈强 13900139002',
    joinDate: '2024-02-20',
    stage: 'validation',
    description: '新型高效储能材料研发商，专注于下一代电池材料的技术创新和产业化。',
    founders: '陈强、刘伟',
    foundingTeam: [
      { id: 't4', name: '陈强', role: 'CEO' },
      { id: 't5', name: '刘伟', role: '技术总监' },
    ],
    businessCanvas: {
      customers: '新能源车企、电池制造商、储能电站运营商',
      valueProposition: '更高能量密度、更长循环寿命、更低制造成本',
      channels: '行业展会、技术研讨会、定向客户拜访',
      customerRelationships: '深度技术合作、定制化开发服务',
      revenueStreams: '材料销售、技术授权、联合开发分成',
      keyResources: '核心技术专利、研发实验室、核心技术团队',
      keyActivities: '材料研发、中试生产、客户验证、专利布局',
      keyPartnerships: '电池厂商、科研院校、设备供应商',
      costStructure: '研发投入、实验设备、原材料采购、人力成本',
    },
    milestones: [
      { id: 'm6', projectId: 'p2', title: '实验室样品完成', description: '第一代材料样品研制成功', targetDate: '2024-03-31', status: 'completed', completedDate: '2024-03-28' },
      { id: 'm7', projectId: 'p2', title: '客户验证测试', description: '通过头部客户实验室测试', targetDate: '2024-06-30', status: 'in_progress' },
      { id: 'm8', projectId: 'p2', title: '中试线建设', description: '完成小规模量产线建设', targetDate: '2024-12-31', status: 'pending' },
    ],
    kpiRecords: [
      { id: 'k5', projectId: 'p2', date: '2024-05-01', userCount: 0, revenue: 0, financingProgress: 30 },
      { id: 'k6', projectId: 'p2', date: '2024-06-01', userCount: 0, revenue: 0, financingProgress: 50 },
    ],
  },
  {
    id: 'p3',
    name: '精准医疗诊断',
    track: '生物医药',
    contact: '林医生 13700137003',
    joinDate: '2024-03-10',
    stage: 'idea',
    description: '基于基因测序和AI算法的精准医疗诊断平台，为患者提供个性化诊疗方案。',
    founders: '林晓、赵亮',
    foundingTeam: [
      { id: 't6', name: '林晓', role: 'CEO/首席医学官' },
      { id: 't7', name: '赵亮', role: '算法负责人' },
    ],
    businessCanvas: {
      customers: '三甲医院、体检中心、药企、保险公司',
      valueProposition: '更准确的早期诊断、个性化治疗方案、降低医疗成本',
      channels: '医院渠道、学术推广、医保对接',
      customerRelationships: '临床合作、学术共建、长期服务协议',
      revenueStreams: '检测服务费、数据分析费、软件授权费',
      keyResources: '医学数据库、AI算法、医学专家团队、医疗器械资质',
      keyActivities: '算法训练、临床验证、注册申报、市场推广',
      keyPartnerships: '三甲医院、测序公司、医疗器械厂商',
      costStructure: '研发成本、临床实验费用、认证费用、人力成本',
    },
    milestones: [
      { id: 'm9', projectId: 'p3', title: '算法模型开发', description: '完成核心诊断算法开发', targetDate: '2024-05-31', status: 'in_progress' },
      { id: 'm10', projectId: 'p3', title: '临床伦理审批', description: '通过临床研究伦理审查', targetDate: '2024-08-31', status: 'pending' },
    ],
    kpiRecords: [
      { id: 'k7', projectId: 'p3', date: '2024-05-01', userCount: 0, revenue: 0, financingProgress: 20 },
    ],
  },
];

export const mockMentors: Mentor[] = [
  {
    id: 'mentor1',
    name: '王教授',
    expertise: ['人工智能', '技术战略', '产品规划'],
    contact: 'wang@example.com | 13800000001',
    serviceRecords: [
      { id: 'sr1', date: '2024-04-15', projectId: 'p1', content: '产品架构设计指导' },
      { id: 'sr2', date: '2024-05-20', projectId: 'p1', content: '融资路演辅导' },
    ],
  },
  {
    id: 'mentor2',
    name: '李总',
    expertise: ['企业管理', '市场营销', '团队建设'],
    contact: 'li@example.com | 13800000002',
    serviceRecords: [
      { id: 'sr3', date: '2024-03-10', projectId: 'p2', content: '公司战略规划' },
      { id: 'sr4', date: '2024-04-25', projectId: 'p3', content: '商业模式梳理' },
    ],
  },
  {
    id: 'mentor3',
    name: '张律师',
    expertise: ['股权设计', '融资法务', '知识产权'],
    contact: 'zhang@example.com | 13800000003',
    serviceRecords: [
      { id: 'sr5', date: '2024-02-20', projectId: 'p1', content: '公司注册法律咨询' },
    ],
  },
];

export const mockInvestors: Investor[] = [
  {
    id: 'inv1',
    name: '刘总',
    institution: '红杉资本',
    interestLevel: 'high',
    followStatus: 'meeting',
    contact: 'liu@sequoia.com | 13900000001',
    projects: ['p1', 'p2'],
  },
  {
    id: 'inv2',
    name: '陈经理',
    institution: '深创投',
    interestLevel: 'medium',
    followStatus: 'contacted',
    contact: 'chen@szvc.com | 13900000002',
    projects: ['p1'],
  },
  {
    id: 'inv3',
    name: '王总',
    institution: '经纬创投',
    interestLevel: 'high',
    followStatus: 'negotiating',
    contact: 'wang@matrixpartners.com | 13900000003',
    projects: ['p2'],
  },
];

export const mockProviders: ServiceProvider[] = [
  {
    id: 'prov1',
    category: 'legal',
    name: '锦天城律师事务所',
    contact: 'legal@jingtian.com | 010-88888888',
    description: '专注于公司法、投融资、知识产权等法律服务',
  },
  {
    id: 'prov2',
    category: 'finance',
    name: '普华永道会计师事务所',
    contact: 'finance@pwc.com | 010-66666666',
    description: '提供审计、税务、咨询等全方位专业服务',
  },
  {
    id: 'prov3',
    category: 'brand',
    name: '奥美广告',
    contact: 'brand@ogilvy.com | 010-77777777',
    description: '品牌策略、创意设计、整合营销传播服务',
  },
  {
    id: 'prov4',
    category: 'technology',
    name: '阿里云',
    contact: 'cloud@aliyun.com | 95187',
    description: '云计算、大数据、人工智能等技术服务',
  },
];

export const mockActivities: Activity[] = [
  {
    id: 'act1',
    type: 'roadshow',
    name: '2024夏季创业项目路演',
    date: '2024-07-15',
    location: '创新大厦A座3楼路演厅',
    description: '精选10个优质创业项目进行路演，邀请20+投资机构现场对接。',
    status: 'upcoming',
    participants: [
      { projectId: 'p1', checkedIn: true, checkInTime: '09:30', status: 'signed_in' },
      { projectId: 'p2', checkedIn: true, checkInTime: '09:28', status: 'signed_in' },
      { projectId: 'p3', checkedIn: false, status: 'registered' },
    ],
    feedbacks: [],
  },
  {
    id: 'act2',
    type: 'training',
    name: '创业融资实战培训',
    date: '2024-06-28',
    location: '孵化器B201培训室',
    description: '资深投资人分享融资技巧，包括BP撰写、估值谈判、股权设计等内容。',
    status: 'completed',
    participants: [
      { projectId: 'p1', checkedIn: true, checkInTime: '14:00', status: 'signed_in' },
      { projectId: 'p2', checkedIn: false, status: 'absent' },
      { projectId: 'p3', checkedIn: true, checkInTime: '13:55', status: 'signed_in' },
    ],
    feedbacks: [
      { id: 'f1', projectId: 'p1', rating: 5, comment: '内容非常实用，干货满满', date: '2024-06-28' },
      { id: 'f2', projectId: 'p3', rating: 4, comment: '希望能有更多案例分享', date: '2024-06-28' },
    ],
  },
  {
    id: 'act3',
    type: 'exchange',
    name: '创业者下午茶交流',
    date: '2024-07-05',
    location: '创业咖啡区',
    description: '轻松的交流环境，促进创业者之间的经验分享和资源对接。',
    status: 'completed',
    participants: [
      { projectId: 'p1', checkedIn: true, checkInTime: '15:30', status: 'signed_in' },
      { projectId: 'p2', checkedIn: true, checkInTime: '15:40', status: 'signed_in' },
      { projectId: 'p3', checkedIn: true, checkInTime: '15:25', status: 'signed_in' },
    ],
    feedbacks: [
      { id: 'f3', projectId: 'p1', rating: 4, comment: '认识了很多同行朋友', date: '2024-07-05' },
    ],
  },
];

export const mockDataRoomItems: DataRoomItem[] = [
  { id: 'dr1', projectId: 'p1', category: 'company', name: '营业执照', description: '公司营业执照正本扫描件', status: 'completed', uploadDate: '2024-01-20' },
  { id: 'dr2', projectId: 'p1', category: 'company', name: '公司章程', description: '最新修订的公司章程', status: 'completed', uploadDate: '2024-01-20' },
  { id: 'dr3', projectId: 'p1', category: 'company', name: '股东名册', description: '全体股东及持股比例', status: 'in_progress', uploadDate: '2024-06-10' },
  { id: 'dr4', projectId: 'p1', category: 'finance', name: '近三年财务报表', description: '经审计的年度财务报表', status: 'pending' },
  { id: 'dr5', projectId: 'p1', category: 'finance', name: '月度财务报告', description: '最近12个月的月度财务数据', status: 'in_progress', uploadDate: '2024-06-15' },
  { id: 'dr6', projectId: 'p1', category: 'legal', name: '核心团队劳动合同', description: '核心成员的劳动合同及保密协议', status: 'completed', uploadDate: '2024-02-01' },
  { id: 'dr7', projectId: 'p1', category: 'ip', name: '商标注册证', description: '品牌商标注册证书', status: 'pending' },
  { id: 'dr8', projectId: 'p1', category: 'ip', name: '软件著作权', description: '核心产品的软件著作权', status: 'completed', uploadDate: '2024-03-15' },
  { id: 'dr9', projectId: 'p1', category: 'contracts', name: '主要客户合同', description: 'Top 5客户的服务合同', status: 'in_progress', uploadDate: '2024-06-20' },
  { id: 'dr10', projectId: 'p1', category: 'tech', name: '技术架构说明', description: '系统整体架构设计文档', status: 'completed', uploadDate: '2024-05-10' },
  { id: 'dr11', projectId: 'p2', category: 'company', name: '营业执照', description: '公司营业执照正本扫描件', status: 'completed', uploadDate: '2024-02-25' },
  { id: 'dr12', projectId: 'p2', category: 'company', name: '公司章程', description: '最新修订的公司章程', status: 'completed', uploadDate: '2024-02-25' },
  { id: 'dr13', projectId: 'p2', category: 'ip', name: '专利申请文件', description: '核心技术专利申请材料', status: 'in_progress', uploadDate: '2024-05-20' },
  { id: 'dr14', projectId: 'p2', category: 'finance', name: '研发投入明细', description: '最近一年的研发费用明细', status: 'pending' },
  { id: 'dr15', projectId: 'p3', category: 'company', name: '营业执照', description: '公司营业执照正本扫描件', status: 'in_progress', uploadDate: '2024-03-15' },
  { id: 'dr16', projectId: 'p3', category: 'legal', name: '医疗资质证书', description: '医疗机构执业许可证', status: 'pending' },
];
