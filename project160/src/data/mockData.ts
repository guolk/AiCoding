import type {
  Facility,
  InspectionRecord,
  MaintenanceRecord,
  Hazard,
  EmergencyPlan,
  TeamMember,
  DrillRecord,
  TrainingRecord,
  OnboardingTraining,
  Question,
} from '@/types';

export const mockFacilities: Facility[] = [
  { id: 'f1', type: 'extinguisher', name: 'ABC干粉灭火器-01', location: 'A栋1层大厅', code: 'MHQ-A1-001', manufactureDate: '2024-03-15', expiryDate: '2026-03-15', status: 'normal', lastInspectionDate: '2026-05-20' },
  { id: 'f2', type: 'extinguisher', name: 'ABC干粉灭火器-02', location: 'A栋2层走廊', code: 'MHQ-A2-002', manufactureDate: '2024-03-15', expiryDate: '2026-03-15', status: 'normal', lastInspectionDate: '2026-05-20' },
  { id: 'f3', type: 'extinguisher', name: 'CO2灭火器-01', location: 'B栋机房', code: 'MHQ-B1-003', manufactureDate: '2023-06-10', expiryDate: '2025-06-10', status: 'expired', lastInspectionDate: '2026-04-10' },
  { id: 'f4', type: 'hydrant', name: '室内消火栓-01', location: 'A栋1层东侧', code: 'XHS-A1-001', manufactureDate: '2022-01-20', expiryDate: '2032-01-20', status: 'normal', lastInspectionDate: '2026-06-01' },
  { id: 'f5', type: 'hydrant', name: '室内消火栓-02', location: 'A栋2层西侧', code: 'XHS-A2-002', manufactureDate: '2022-01-20', expiryDate: '2032-01-20', status: 'abnormal', lastInspectionDate: '2026-06-01' },
  { id: 'f6', type: 'smoke_alarm', name: '烟感报警器-01', location: 'A栋1层大厅', code: 'YG-A1-001', manufactureDate: '2024-08-05', expiryDate: '2027-08-05', status: 'normal', lastInspectionDate: '2026-05-25' },
  { id: 'f7', type: 'smoke_alarm', name: '烟感报警器-02', location: 'B栋仓库', code: 'YG-B1-002', manufactureDate: '2023-12-01', expiryDate: '2026-12-01', status: 'inspecting', lastInspectionDate: '2026-06-05' },
  { id: 'f8', type: 'emergency_light', name: '应急照明灯-01', location: 'A栋1层安全出口', code: 'YJZM-A1-001', manufactureDate: '2024-05-20', expiryDate: '2027-05-20', status: 'normal', lastInspectionDate: '2026-05-15' },
  { id: 'f9', type: 'emergency_light', name: '应急照明灯-02', location: 'A栋2层楼梯间', code: 'YJZM-A2-002', manufactureDate: '2024-05-20', expiryDate: '2027-05-20', status: 'normal', lastInspectionDate: '2026-05-15' },
  { id: 'f10', type: 'exit_sign', name: '安全出口标志-01', location: 'A栋1层西门', code: 'AQCK-A1-001', manufactureDate: '2024-09-10', expiryDate: '2029-09-10', status: 'normal', lastInspectionDate: '2026-06-02' },
  { id: 'f11', type: 'exit_sign', name: '安全出口标志-02', location: 'B栋1层东门', code: 'AQCK-B1-002', manufactureDate: '2024-09-10', expiryDate: '2029-09-10', status: 'normal', lastInspectionDate: '2026-06-02' },
  { id: 'f12', type: 'extinguisher', name: 'ABC干粉灭火器-03', location: 'C栋3层办公室', code: 'MHQ-C3-004', manufactureDate: '2025-01-08', expiryDate: '2027-01-08', status: 'normal', lastInspectionDate: '2026-05-30' },
];

export const mockInspections: InspectionRecord[] = [
  { id: 'i1', facilityId: 'f1', facilityName: 'ABC干粉灭火器-01', inspectionDate: '2026-05-20', inspector: '张伟', status: 'normal', issues: '' },
  { id: 'i2', facilityId: 'f2', facilityName: 'ABC干粉灭火器-02', inspectionDate: '2026-05-20', inspector: '张伟', status: 'normal', issues: '' },
  { id: 'i3', facilityId: 'f3', facilityName: 'CO2灭火器-01', inspectionDate: '2026-04-10', inspector: '李明', status: 'abnormal', issues: '灭火器压力表指针低于绿色区域，需更换' },
  { id: 'i4', facilityId: 'f4', facilityName: '室内消火栓-01', inspectionDate: '2026-06-01', inspector: '王强', status: 'normal', issues: '' },
  { id: 'i5', facilityId: 'f5', facilityName: '室内消火栓-02', inspectionDate: '2026-06-01', inspector: '王强', status: 'abnormal', issues: '水带接口有锈蚀，需更换水带' },
  { id: 'i6', facilityId: 'f6', facilityName: '烟感报警器-01', inspectionDate: '2026-05-25', inspector: '赵磊', status: 'normal', issues: '' },
  { id: 'i7', facilityId: 'f8', facilityName: '应急照明灯-01', inspectionDate: '2026-05-15', inspector: '陈刚', status: 'normal', issues: '' },
  { id: 'i8', facilityId: 'f10', facilityName: '安全出口标志-01', inspectionDate: '2026-06-02', inspector: '赵磊', status: 'normal', issues: '' },
];

export const mockMaintenance: MaintenanceRecord[] = [
  { id: 'm1', facilityId: 'f3', facilityName: 'CO2灭火器-01', type: '灭火器更换', maintenanceDate: '2026-04-15', maintainer: '消防设备公司', parts: 'CO2灭火器整机', cost: 280, description: '原灭火器过期，更换新设备' },
  { id: 'm2', facilityId: 'f5', facilityName: '室内消火栓-02', type: '消防水带更换', maintenanceDate: '2026-06-03', maintainer: '维修部-刘工', parts: '25m消防水带×1', cost: 350, description: '水带接口锈蚀，更换新水带' },
  { id: 'm3', facilityId: 'f1', facilityName: 'ABC干粉灭火器-01', type: '药剂更换', maintenanceDate: '2025-09-10', maintainer: '消防设备公司', parts: 'ABC干粉药剂4kg', cost: 120, description: '定期药剂更换' },
  { id: 'm4', facilityId: 'f4', facilityName: '室内消火栓-01', type: '阀门维护', maintenanceDate: '2025-12-05', maintainer: '维修部-刘工', parts: '阀门密封圈', cost: 80, description: '阀门密封圈老化更换' },
];

export const mockHazards: Hazard[] = [
  { id: 'h1', description: 'A栋2层消防通道堆放杂物，影响疏散', discoveryDate: '2026-05-10', level: 'A', responsiblePerson: '周建国', deadline: '2026-05-17', status: 'completed', rectificationResult: '已清理通道杂物，设置禁止堆放标识', completionDate: '2026-05-15', location: 'A栋2层' },
  { id: 'h2', description: 'B栋仓库烟感报警器灵敏度降低', discoveryDate: '2026-05-18', level: 'A', responsiblePerson: '赵磊', deadline: '2026-05-25', status: 'completed', rectificationResult: '已更换烟感报警器探头', completionDate: '2026-05-23', location: 'B栋仓库' },
  { id: 'h3', description: 'C栋3层灭火器过期未及时更换', discoveryDate: '2026-06-01', level: 'B', responsiblePerson: '李明', deadline: '2026-06-15', status: 'in_progress', rectificationResult: '', completionDate: '', location: 'C栋3层' },
  { id: 'h4', description: 'A栋1层应急照明灯亮度不足', discoveryDate: '2026-06-02', level: 'B', responsiblePerson: '陈刚', deadline: '2026-06-16', status: 'pending', rectificationResult: '', completionDate: '', location: 'A栋1层' },
  { id: 'h5', description: 'B栋1层安全出口标识损坏', discoveryDate: '2026-06-03', level: 'B', responsiblePerson: '王强', deadline: '2026-06-10', status: 'overdue', rectificationResult: '', completionDate: '', location: 'B栋1层' },
  { id: 'h6', description: 'A栋地下车库消防水压不足', discoveryDate: '2026-05-28', level: 'A', responsiblePerson: '周建国', deadline: '2026-06-05', status: 'in_progress', rectificationResult: '', completionDate: '', location: 'A栋地下车库' },
  { id: 'h7', description: 'C栋1层消火栓箱门无法正常关闭', discoveryDate: '2026-06-05', level: 'B', responsiblePerson: '刘工', deadline: '2026-06-20', status: 'pending', rectificationResult: '', completionDate: '', location: 'C栋1层' },
  { id: 'h8', description: 'A栋3层疏散楼梯间防火门闭门器失效', discoveryDate: '2026-05-25', level: 'A', responsiblePerson: '周建国', deadline: '2026-06-01', status: 'completed', rectificationResult: '已更换闭门器', completionDate: '2026-05-30', location: 'A栋3层' },
];

export const mockPlans: EmergencyPlan[] = [
  {
    id: 'p1',
    scenarioType: '办公室火灾',
    title: '办公室火灾应急预案',
    createDate: '2026-01-15',
    version: 'V2.0',
    status: 'active',
    steps: [
      { order: 1, phase: '发现火情', action: '发现火情立即报告', responsible: '现场人员', description: '发现火情后第一时间拨打内部报警电话，通知消防控制室' },
      { order: 2, phase: '报警', action: '拨打119报警', responsible: '消防控制室值班员', description: '说明着火地点、火势大小、被困人员情况等' },
      { order: 3, phase: '疏散', action: '组织人员疏散', responsible: '疏散引导组', description: '按预定疏散路线引导人员有序撤离，确认各房间无人遗留' },
      { order: 4, phase: '初期扑救', action: '使用灭火器初期扑救', responsible: '灭火行动组', description: '火势较小时使用灭火器扑救，控制火势蔓延' },
      { order: 5, phase: '配合救援', action: '配合消防救援', responsible: '通讯联络组', description: '引导消防车辆进入，提供建筑内部信息' },
    ],
  },
  {
    id: 'p2',
    scenarioType: '仓库火灾',
    title: '仓库火灾应急预案',
    createDate: '2026-02-20',
    version: 'V1.5',
    status: 'active',
    steps: [
      { order: 1, phase: '发现火情', action: '仓库火情发现与报告', responsible: '仓库管理员', description: '发现仓库冒烟或明火，立即触发火灾报警器' },
      { order: 2, phase: '报警', action: '紧急报警并通知', responsible: '消防控制室', description: '拨打119，通知安全管理部门和仓库负责人' },
      { order: 3, phase: '疏散', action: '紧急疏散仓库人员', responsible: '疏散引导组', description: '确保仓库内所有人员撤离，清点人数' },
      { order: 4, phase: '初期扑救', action: '隔离火源初期灭火', responsible: '灭火行动组', description: '切断电源，使用灭火器和消火栓控制火势' },
    ],
  },
  {
    id: 'p3',
    scenarioType: '电气火灾',
    title: '电气火灾应急预案',
    createDate: '2026-03-10',
    version: 'V1.0',
    status: 'draft',
    steps: [
      { order: 1, phase: '发现火情', action: '发现电气设备冒烟着火', responsible: '现场人员', description: '发现电气设备异常立即断电并报告' },
      { order: 2, phase: '报警', action: '紧急报警', responsible: '值班人员', description: '拨打119报警，说明是电气火灾' },
      { order: 3, phase: '疏散', action: '疏散附近人员', responsible: '疏散引导组', description: '远离带电设备，从安全通道撤离' },
      { order: 4, phase: '初期扑救', action: '使用CO2灭火器扑救', responsible: '灭火行动组', description: '严禁用水灭火，使用CO2或干粉灭火器' },
    ],
  },
];

export const mockTeamMembers: TeamMember[] = [
  { id: 't1', name: '周建国', role: '总指挥', responsibility: '全面指挥应急处置工作，协调各方资源', phone: '138-0001-0001', group: '指挥组' },
  { id: 't2', name: '王强', role: '副总指挥', responsibility: '协助总指挥，负责现场指挥调度', phone: '138-0001-0002', group: '指挥组' },
  { id: 't3', name: '张伟', role: '灭火行动组长', responsibility: '带领灭火行动组进行初期火灾扑救', phone: '138-0001-0003', group: '灭火行动组' },
  { id: 't4', name: '李明', role: '灭火行动组员', responsibility: '使用灭火器、消火栓进行灭火', phone: '138-0001-0004', group: '灭火行动组' },
  { id: 't5', name: '赵磊', role: '疏散引导组长', responsibility: '组织人员按预案路线有序疏散', phone: '138-0001-0005', group: '疏散引导组' },
  { id: 't6', name: '陈刚', role: '疏散引导组员', responsibility: '引导人员疏散，确认无人员遗留', phone: '138-0001-0006', group: '疏散引导组' },
  { id: 't7', name: '刘芳', role: '通讯联络组长', responsibility: '负责内外通讯联络，传递信息', phone: '138-0001-0007', group: '通讯联络组' },
  { id: 't8', name: '孙丽', role: '医疗救护组长', responsibility: '对受伤人员进行现场急救', phone: '138-0001-0008', group: '医疗救护组' },
];

export const mockDrills: DrillRecord[] = [
  { id: 'd1', name: '2026年上半年消防疏散演练', date: '2026-03-15', type: '疏散演练', participants: 120, evaluation: 'good', summary: '全体人员能在5分钟内完成疏散，部分员工对疏散路线不熟悉', planId: 'p1' },
  { id: 'd2', name: '办公室灭火器实操演练', date: '2026-04-20', type: '实操演练', participants: 45, evaluation: 'excellent', summary: '参训人员均能正确使用灭火器灭火', planId: 'p1' },
  { id: 'd3', name: '仓库消防应急演练', date: '2026-05-10', type: '综合演练', participants: 30, evaluation: 'average', summary: '疏散速度需提升，仓库人员对预案不够熟悉', planId: 'p2' },
  { id: 'd4', name: '夜间消防疏散演练', date: '2026-05-25', type: '疏散演练', participants: 65, evaluation: 'good', summary: '夜间疏散照明正常，部分人员反应较慢', planId: 'p1' },
];

export const mockTrainingRecords: TrainingRecord[] = [
  { id: 'tr1', title: '消防安全基础知识培训', date: '2026-01-20', content: '火灾分类、灭火器使用方法、疏散逃生要点', trainer: '消防大队-王教官', participants: ['全体员工'], passRate: 95, status: 'completed' },
  { id: 'tr2', title: '灭火器实操培训', date: '2026-03-05', content: '干粉灭火器、CO2灭火器实操练习', trainer: '消防大队-王教官', participants: ['安保部', '后勤部'], passRate: 100, status: 'completed' },
  { id: 'tr3', title: '应急疏散引导员培训', date: '2026-04-10', content: '疏散路线规划、人员引导技巧、紧急情况处理', trainer: '安全部-周建国', participants: ['各楼层疏散引导员'], passRate: 90, status: 'completed' },
  { id: 'tr4', title: '消防设施操作培训', date: '2026-06-15', content: '消火栓操作、烟感报警系统使用、消防联动控制', trainer: '设备厂家-张工', participants: ['安保部', '物业部'], passRate: 0, status: 'scheduled' },
];

export const mockOnboarding: OnboardingTraining[] = [
  { id: 'o1', employeeName: '马晓东', department: '市场部', joinDate: '2026-04-01', trainingCompleted: true, completionDate: '2026-04-03', score: 92 },
  { id: 'o2', employeeName: '林小红', department: '行政部', joinDate: '2026-04-15', trainingCompleted: true, completionDate: '2026-04-17', score: 88 },
  { id: 'o3', employeeName: '吴天明', department: '技术部', joinDate: '2026-05-01', trainingCompleted: true, completionDate: '2026-05-03', score: 95 },
  { id: 'o4', employeeName: '钱佳佳', department: '财务部', joinDate: '2026-05-10', trainingCompleted: false, completionDate: '', score: 0 },
  { id: 'o5', employeeName: '郑宇飞', department: '技术部', joinDate: '2026-05-20', trainingCompleted: false, completionDate: '', score: 0 },
  { id: 'o6', employeeName: '韩雪', department: '人事部', joinDate: '2026-06-01', trainingCompleted: false, completionDate: '', score: 0 },
];

export const mockQuestions: Question[] = [
  { id: 'q1', type: 'single', difficulty: 'easy', category: '基础知识', content: '火灾分为哪几类？', options: ['A类、B类、C类、D类、E类、F类', '仅A类和B类', '可燃固体、可燃液体两类', '只有一类'], answer: 'A类、B类、C类、D类、E类、F类', explanation: '根据GB/T4968-2008《火灾分类》，火灾分为A-F六大类' },
  { id: 'q2', type: 'single', difficulty: 'easy', category: '灭火器使用', content: '使用干粉灭火器灭火时，应站在什么位置？', options: ['下风方向', '上风方向', '侧面', '任意位置'], answer: '上风方向', explanation: '使用灭火器时应站在上风方向，避免灭火剂被风吹回和烟雾呛伤' },
  { id: 'q3', type: 'judge', difficulty: 'easy', category: '灭火器使用', content: '电器着火可以用水扑救。', options: ['正确', '错误'], answer: '错误', explanation: '电器着火不能用水扑救，应先切断电源，使用CO2或干粉灭火器' },
  { id: 'q4', type: 'single', difficulty: 'medium', category: '疏散逃生', content: '高层建筑发生火灾时，以下哪种做法是正确的？', options: ['乘坐电梯快速下楼', '从窗户跳下逃生', '沿安全楼梯有序疏散', '返回办公室取重要物品'], answer: '沿安全楼梯有序疏散', explanation: '火灾时严禁使用电梯，应沿安全楼梯有序疏散，不可贪恋财物' },
  { id: 'q5', type: 'judge', difficulty: 'medium', category: '疏散逃生', content: '逃生时经过烟雾区，应弯腰低姿前行，用湿毛巾捂住口鼻。', options: ['正确', '错误'], answer: '正确', explanation: '烟雾较轻往上飘，低姿前行可减少吸入有毒烟雾，湿毛巾可过滤部分有毒气体' },
  { id: 'q6', type: 'single', difficulty: 'medium', category: '消防设施', content: '室内消火栓的使用步骤，正确的顺序是？', options: ['开箱-接水带-开阀门-出水', '开阀门-接水带-开箱-出水', '接水带-开箱-开阀门-出水', '开箱-开阀门-接水带-出水'], answer: '开箱-接水带-开阀门-出水', explanation: '正确步骤：打开消火栓箱→连接水带和水枪→打开阀门→对准火源出水灭火' },
  { id: 'q7', type: 'multiple', difficulty: 'hard', category: '基础知识', content: '以下哪些属于A类火灾？（多选）', options: ['木材着火', '汽油着火', '纸张着火', '布料着火', '天然气着火'], answer: ['木材着火', '纸张着火', '布料着火'], explanation: 'A类火灾指固体物质火灾，如木材、纸张、布料等。汽油属于B类液体火灾，天然气属于C类气体火灾' },
  { id: 'q8', type: 'single', difficulty: 'hard', category: '消防设施', content: '消防应急照明灯的持续供电时间不应低于多少分钟？', options: ['20分钟', '30分钟', '60分钟', '90分钟'], answer: '30分钟', explanation: '根据GB17945-2010，消防应急照明灯的持续供电时间不应低于30分钟' },
];
