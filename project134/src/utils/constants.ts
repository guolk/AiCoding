export const STAGE_OPTIONS = [
  { value: 'idea', label: '创意阶段', color: 'bg-blue-100 text-blue-800' },
  { value: 'validation', label: '验证阶段', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'development', label: '产品开发', color: 'bg-purple-100 text-purple-800' },
  { value: 'launch', label: '上市阶段', color: 'bg-orange-100 text-orange-800' },
  { value: 'growth', label: '增长阶段', color: 'bg-green-100 text-green-800' },
];

export const MILESTONE_STATUS_OPTIONS = [
  { value: 'pending', label: '待开始', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: '进行中', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: '已完成', color: 'bg-green-100 text-green-800' },
  { value: 'delayed', label: '已延期', color: 'bg-red-100 text-red-800' },
];

export const INTEREST_LEVEL_OPTIONS = [
  { value: 'high', label: '高', color: 'bg-red-100 text-red-800' },
  { value: 'medium', label: '中', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: '低', color: 'bg-gray-100 text-gray-800' },
];

export const FOLLOW_STATUS_OPTIONS = [
  { value: 'contacted', label: '已接触', color: 'bg-blue-100 text-blue-800' },
  { value: 'meeting', label: '会面中', color: 'bg-purple-100 text-purple-800' },
  { value: 'negotiating', label: '谈判中', color: 'bg-orange-100 text-orange-800' },
  { value: 'invested', label: '已投资', color: 'bg-green-100 text-green-800' },
  { value: 'lost', label: '已流失', color: 'bg-gray-100 text-gray-800' },
];

export const PROVIDER_CATEGORY_OPTIONS = [
  { value: 'legal', label: '法律服务', icon: 'Scale' },
  { value: 'finance', label: '财务服务', icon: 'Calculator' },
  { value: 'brand', label: '品牌服务', icon: 'Palette' },
  { value: 'technology', label: '技术服务', icon: 'Code' },
];

export const ACTIVITY_TYPE_OPTIONS = [
  { value: 'roadshow', label: '路演活动', color: 'bg-amber-100 text-amber-800' },
  { value: 'training', label: '培训活动', color: 'bg-blue-100 text-blue-800' },
  { value: 'exchange', label: '交流活动', color: 'bg-emerald-100 text-emerald-800' },
];

export const ACTIVITY_STATUS_OPTIONS = [
  { value: 'upcoming', label: '即将开始', color: 'bg-blue-100 text-blue-800' },
  { value: 'ongoing', label: '进行中', color: 'bg-amber-100 text-amber-800' },
  { value: 'completed', label: '已结束', color: 'bg-green-100 text-green-800' },
];

export const PARTICIPANT_STATUS_OPTIONS = [
  { value: 'registered', label: '已报名', color: 'bg-blue-100 text-blue-800' },
  { value: 'signed_in', label: '已签到', color: 'bg-green-100 text-green-800' },
  { value: 'absent', label: '未出席', color: 'bg-gray-100 text-gray-800' },
];

export const DATAROOM_STATUS_OPTIONS = [
  { value: 'pending', label: '待收集', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: '收集中', color: 'bg-amber-100 text-amber-800' },
  { value: 'completed', label: '已完成', color: 'bg-green-100 text-green-800' },
];

export const DATAROOM_CATEGORY_OPTIONS = [
  { value: 'company', label: '公司基本文件' },
  { value: 'finance', label: '财务文件' },
  { value: 'legal', label: '法律文件' },
  { value: 'contracts', label: '业务合同' },
  { value: 'ip', label: '知识产权' },
  { value: 'hr', label: '人力资源' },
  { value: 'tech', label: '技术文档' },
  { value: 'marketing', label: '市场资料' },
];

export const TRACK_OPTIONS = [
  '人工智能',
  '生物医药',
  '新能源',
  '新材料',
  '互联网',
  '消费升级',
  '企业服务',
  '金融科技',
  '教育科技',
  '其他',
];

export const BUSINESS_CANVAS_FIELDS = [
  { key: 'customers', label: '客户细分', description: '我们的目标客户群体是谁？' },
  { key: 'valueProposition', label: '价值主张', description: '我们为客户创造什么价值？' },
  { key: 'channels', label: '渠道通路', description: '如何触达目标客户？' },
  { key: 'customerRelationships', label: '客户关系', description: '如何建立和维护客户关系？' },
  { key: 'revenueStreams', label: '收入来源', description: '通过什么方式获得收入？' },
  { key: 'keyResources', label: '核心资源', description: '需要哪些关键资源？' },
  { key: 'keyActivities', label: '关键业务', description: '需要开展哪些关键活动？' },
  { key: 'keyPartnerships', label: '重要合作', description: '需要哪些重要合作伙伴？' },
  { key: 'costStructure', label: '成本结构', description: '主要成本有哪些？' },
];
