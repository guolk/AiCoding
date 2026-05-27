import { User, Project, Milestone, Task, LabRecord, Literature, ReadingProgress, ReadingReport, Achievement, Meeting, Discussion, Activity } from '../types';

export const mockUsers: User[] = [
  { id: 1, email: 'admin@lab.com', name: '张教授', role: 'admin', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 2, email: 'leader@lab.com', name: '李组长', role: 'leader', created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' },
  { id: 3, email: 'wang@lab.com', name: '王研究员', role: 'member', created_at: '2024-01-03T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' },
  { id: 4, email: 'chen@lab.com', name: '陈博士', role: 'member', created_at: '2024-01-04T00:00:00Z', updated_at: '2024-01-04T00:00:00Z' },
  { id: 5, email: 'liu@lab.com', name: '刘同学', role: 'member', created_at: '2024-01-05T00:00:00Z', updated_at: '2024-01-05T00:00:00Z' },
];

export const mockProjects: Project[] = [
  { id: 1, name: '新型半导体材料研究', description: '探索新型二维材料在半导体器件中的应用', status: 'in_progress', created_by: 1, created_at: '2024-03-01T00:00:00Z', updated_at: '2024-05-20T10:00:00Z' },
  { id: 2, name: '生物传感器开发', description: '基于纳米技术的高灵敏度生物传感器', status: 'in_progress', created_by: 2, created_at: '2024-04-15T00:00:00Z', updated_at: '2024-05-25T14:00:00Z' },
  { id: 3, name: '人工智能药物筛选', description: '利用机器学习加速药物发现过程', status: 'proposed', created_by: 1, created_at: '2024-05-01T00:00:00Z', updated_at: '2024-05-01T00:00:00Z' },
  { id: 4, name: '新能源电池研究', description: '高能量密度锂电池材料研发', status: 'completed', created_by: 2, created_at: '2023-06-01T00:00:00Z', updated_at: '2024-03-15T00:00:00Z' },
  { id: 5, name: '量子计算算法研究', description: '量子纠错码和量子算法优化', status: 'published', created_by: 1, created_at: '2023-01-01T00:00:00Z', updated_at: '2024-02-01T00:00:00Z' },
];

export const mockMilestones: Milestone[] = [
  { id: 1, project_id: 1, name: '实验设计完成', description: '确定实验方案和参数', target_date: '2024-03-31', status: 'completed', created_at: '2024-03-01T00:00:00Z' },
  { id: 2, project_id: 1, name: '材料合成', description: '合成目标材料并表征', target_date: '2024-05-31', status: 'in_progress', created_at: '2024-03-01T00:00:00Z' },
  { id: 3, project_id: 1, name: '器件制备', description: '制备测试器件', target_date: '2024-07-31', status: 'pending', created_at: '2024-03-01T00:00:00Z' },
  { id: 4, project_id: 1, name: '性能测试', description: '完成器件性能测试', target_date: '2024-09-30', status: 'pending', created_at: '2024-03-01T00:00:00Z' },
  { id: 5, project_id: 2, name: '传感器原型', description: '完成第一代原型设计', target_date: '2024-06-30', status: 'in_progress', created_at: '2024-04-15T00:00:00Z' },
];

export const mockTasks: Task[] = [
  { id: 1, project_id: 1, milestone_id: 2, title: '合成MoS2材料', description: '采用化学气相沉积法合成', assignee_id: 3, priority: 'high', status: 'in_progress', due_date: '2024-05-30', created_at: '2024-03-10T00:00:00Z', updated_at: '2024-05-20T09:00:00Z' },
  { id: 2, project_id: 1, milestone_id: 2, title: '材料表征分析', description: 'XRD和TEM表征', assignee_id: 4, priority: 'medium', status: 'todo', due_date: '2024-06-15', created_at: '2024-03-10T00:00:00Z', updated_at: '2024-03-10T00:00:00Z' },
  { id: 3, project_id: 2, milestone_id: 5, title: '电路设计', description: '设计传感器读出电路', assignee_id: 5, priority: 'high', status: 'done', due_date: '2024-05-20', created_at: '2024-04-20T00:00:00Z', updated_at: '2024-05-18T16:00:00Z' },
  { id: 4, project_id: 2, milestone_id: 5, title: '纳米材料制备', description: '合成金纳米颗粒', assignee_id: 3, priority: 'medium', status: 'in_progress', due_date: '2024-06-10', created_at: '2024-04-20T00:00:00Z', updated_at: '2024-05-22T10:00:00Z' },
  { id: 5, project_id: 1, milestone_id: 3, title: '光刻工艺', description: '光刻制备电极图案', assignee_id: 4, priority: 'medium', status: 'todo', due_date: '2024-08-15', created_at: '2024-03-10T00:00:00Z', updated_at: '2024-03-10T00:00:00Z' },
];

export const mockLabRecords: LabRecord[] = [
  {
    id: 1,
    user_id: 3,
    project_id: 1,
    experiment_date: '2024-05-20',
    purpose: '研究生长温度对MoS2薄膜质量的影响',
    method: '采用CVD方法，在不同温度下生长MoS2薄膜',
    results: '在850°C时获得最佳质量的薄膜，XRD显示(002)峰强',
    conclusion: '生长温度是影响MoS2质量的关键因素，最佳温度为850°C',
    conditions: {
      reagents: [
        { name: 'MoO3粉末', batch: 'M20240301', supplier: 'Sigma-Aldrich' },
        { name: '硫粉', batch: 'S20240215', supplier: '国药集团' },
      ],
      instruments: [
        { name: '管式炉', model: 'OTF-1200X', settings: '升温速率10°C/min，保温2小时' },
      ],
      environment: { temperature: 25, humidity: 45, lighting: '自然光' },
    },
    created_at: '2024-05-20T18:00:00Z',
    updated_at: '2024-05-20T18:00:00Z',
  },
  {
    id: 2,
    user_id: 4,
    project_id: 2,
    experiment_date: '2024-05-25',
    purpose: '测试传感器响应时间',
    method: '使用电化学工作站测试传感器对葡萄糖的响应',
    results: '响应时间小于5秒，检测限达到1μM',
    conclusion: '传感器性能达到预期目标，可用于下一步实验',
    conditions: {
      reagents: [
        { name: '葡萄糖标准溶液', batch: 'G20240501', supplier: 'Alfa Aesar' },
        { name: 'PBS缓冲液', batch: 'P20240420', supplier: '实验室自制' },
      ],
      instruments: [
        { name: '电化学工作站', model: 'CHI660E', settings: '三电极体系，扫描速率50mV/s' },
      ],
      environment: { temperature: 22, humidity: 50, lighting: '实验室灯光' },
    },
    created_at: '2024-05-25T16:30:00Z',
    updated_at: '2024-05-25T16:30:00Z',
  },
];

export const mockLiterature: Literature[] = [
  { id: 1, title: 'Two-dimensional transition metal dichalcogenides for electronics', authors: 'Wang, X. et al.', journal: 'Nature Materials', year: 2023, doi: '10.1038/s41563-023-01523-4', url: 'https://doi.org/10.1038/s41563-023-01523-4', added_by: 2, created_at: '2024-05-01T00:00:00Z' },
  { id: 2, title: 'High-sensitivity biosensors based on nanomaterials', authors: 'Chen, L. et al.', journal: 'ACS Nano', year: 2024, doi: '10.1021/acsnano.3c08972', url: 'https://doi.org/10.1021/acsnano.3c08972', added_by: 3, created_at: '2024-05-10T00:00:00Z' },
  { id: 3, title: 'Machine learning in drug discovery', authors: 'Zhang, Y. et al.', journal: 'Cell Reports Methods', year: 2023, doi: '10.1016/j.crmeth.2023.100652', url: 'https://doi.org/10.1016/j.crmeth.2023.100652', added_by: 1, created_at: '2024-05-15T00:00:00Z' },
  { id: 4, title: 'Quantum error correction with topological codes', authors: 'Liu, Q. et al.', journal: 'Physical Review Letters', year: 2024, doi: '10.1103/PhysRevLett.132.030602', url: 'https://doi.org/10.1103/PhysRevLett.132.030602', added_by: 4, created_at: '2024-05-18T00:00:00Z' },
];

export const mockReadingProgress: ReadingProgress[] = [
  { id: 1, literature_id: 1, user_id: 3, status: 'reading', progress: 60, recommended: true, created_at: '2024-05-05T00:00:00Z', updated_at: '2024-05-20T10:00:00Z' },
  { id: 2, literature_id: 1, user_id: 4, status: 'finished', progress: 100, recommended: true, created_at: '2024-05-05T00:00:00Z', updated_at: '2024-05-15T14:00:00Z' },
  { id: 3, literature_id: 2, user_id: 5, status: 'reading', progress: 40, recommended: false, created_at: '2024-05-12T00:00:00Z', updated_at: '2024-05-22T09:00:00Z' },
  { id: 4, literature_id: 3, user_id: 2, status: 'unread', progress: 0, recommended: false, created_at: '2024-05-16T00:00:00Z', updated_at: '2024-05-16T00:00:00Z' },
];

export const mockReadingReports: ReadingReport[] = [
  {
    id: 1,
    literature_id: 1,
    user_id: 4,
    summary: '本文综述了二维过渡金属硫化物在电子器件中的最新进展',
    key_points: ['MoS2具有优异的电子性能', 'CVD生长方法成熟', '器件应用前景广阔'],
    comments: '推荐组内成员阅读，对我们的项目有很好的参考价值',
    created_at: '2024-05-15T15:00:00Z',
  },
];

export const mockAchievements: Achievement[] = [
  {
    id: 1,
    project_id: 5,
    title: 'Topological Quantum Error Correction',
    type: 'paper',
    status: 'published',
    details: 'Physical Review Letters, 2024',
    versions: [
      { version_number: 1, file_name: 'draft_v1.pdf', file_path: '/uploads/papers/draft_v1.pdf', created_at: '2023-11-01T00:00:00Z' },
      { version_number: 2, file_name: 'revision_v1.pdf', file_path: '/uploads/papers/revision_v1.pdf', created_at: '2023-12-15T00:00:00Z' },
      { version_number: 3, file_name: 'final.pdf', file_path: '/uploads/papers/final.pdf', created_at: '2024-01-20T00:00:00Z' },
    ],
    created_by: 1,
    created_at: '2023-10-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 2,
    project_id: 1,
    title: 'Novel CVD Growth Method for MoS2',
    type: 'paper',
    status: 'reviewing',
    details: 'Submitted to Nature Communications',
    versions: [
      { version_number: 1, file_name: 'submission.pdf', file_path: '/uploads/papers/submission.pdf', created_at: '2024-04-01T00:00:00Z' },
    ],
    created_by: 3,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-04-15T00:00:00Z',
  },
  {
    id: 3,
    project_id: 2,
    title: 'Biosensor Patent Application',
    type: 'patent',
    status: 'submitted',
    details: '中国发明专利申请',
    versions: [],
    created_by: 2,
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2024-05-01T00:00:00Z',
  },
];

export const mockMeetings: Meeting[] = [
  {
    id: 1,
    title: '周例会 - 5月第3周',
    date: '2024-05-20',
    time: '14:00',
    location: '会议室A',
    minutes: '1. 王研究员汇报MoS2材料合成进展\n2. 陈博士汇报传感器测试结果\n3. 讨论下一步工作计划',
    hosted_by: 1,
    action_items: [
      { id: 1, meeting_id: 1, description: '完成MoS2表征报告', assignee_id: 4, due_date: '2024-05-27', status: 'pending', created_at: '2024-05-20T16:00:00Z' },
      { id: 2, meeting_id: 1, description: '准备专利申请材料', assignee_id: 2, due_date: '2024-06-01', status: 'pending', created_at: '2024-05-20T16:00:00Z' },
    ],
    created_at: '2024-05-20T16:00:00Z',
  },
  {
    id: 2,
    title: '项目进度评审会',
    date: '2024-05-13',
    time: '10:00',
    location: '会议室B',
    minutes: '1. 各项目负责人汇报进度\n2. 讨论资源分配问题\n3. 确定下一阶段目标',
    hosted_by: 1,
    action_items: [
      { id: 3, meeting_id: 2, description: '更新项目甘特图', assignee_id: 5, due_date: '2024-05-18', status: 'completed', created_at: '2024-05-13T12:00:00Z' },
    ],
    created_at: '2024-05-13T12:00:00Z',
  },
];

export const mockDiscussions: Discussion[] = [
  {
    id: 1,
    title: '关于MoS2生长条件的讨论',
    content: '大家好，最近在做MoS2生长实验，发现不同批次的硫粉对生长结果影响很大。有没有同学遇到类似问题？',
    tags: ['材料合成', 'MoS2'],
    created_by: 3,
    project_id: 1,
    replies: [
      { id: 1, content: '是的，我之前也遇到过，建议使用纯度更高的硫粉', created_by: 4, created_at: '2024-05-21T09:30:00Z' },
      { id: 2, content: '同意，另外管式炉的密封性也很重要', created_by: 5, created_at: '2024-05-21T10:15:00Z' },
    ],
    created_at: '2024-05-21T09:00:00Z',
    updated_at: '2024-05-21T10:15:00Z',
  },
  {
    id: 2,
    title: '文献分享：最新传感器研究进展',
    content: '分享一篇刚发表的关于纳米传感器的综述，对我们的生物传感器项目很有参考价值',
    tags: ['文献分享', '传感器'],
    created_by: 4,
    project_id: 2,
    replies: [
      { id: 3, content: '谢谢分享！这篇文章的检测限数据很有参考意义', created_by: 2, created_at: '2024-05-22T14:00:00Z' },
    ],
    created_at: '2024-05-22T13:30:00Z',
    updated_at: '2024-05-22T14:00:00Z',
  },
];

export const mockActivities: Activity[] = [
  { id: 1, type: 'task', user_id: 3, content: '更新任务「合成MoS2材料」状态为进行中', created_at: '2024-05-20T09:00:00Z' },
  { id: 2, type: 'lab_record', user_id: 3, content: '创建实验记录「生长温度影响研究」', created_at: '2024-05-20T18:00:00Z' },
  { id: 3, type: 'literature', user_id: 4, content: '添加文献「High-sensitivity biosensors...」', created_at: '2024-05-20T10:00:00Z' },
  { id: 4, type: 'meeting', user_id: 1, content: '创建组会「周例会 - 5月第3周」', created_at: '2024-05-20T16:00:00Z' },
  { id: 5, type: 'discussion', user_id: 3, content: '发起讨论「关于MoS2生长条件的讨论」', created_at: '2024-05-21T09:00:00Z' },
];
