import type {
  ClubInfo,
  Cadre,
  ConstitutionVersion,
  Member,
  PointRecord,
  MemberRecord,
  Activity,
  PlanVersion,
  ActivityEvaluation,
  FinanceRecord,
  FinanceReport,
  BudgetItem,
  Achievement,
  HonorApplication,
} from "@/types";

export const mockClubInfo: ClubInfo = {
  id: "club-001",
  name: "科技创新协会",
  foundedDate: "2018-09-01",
  purpose:
    "以科技创新为核心，培养学生创新思维和实践能力，组织开展各类科技竞赛、学术讲座和创新项目，推动校园科技文化建设。",
  advisor: "张明教授",
  feePolicy: "每人每学年50元，用于活动材料采购和社团日常运营",
  description:
    "科技创新协会是校级重点社团，连续五年获得十佳社团称号，拥有成员200余人，下设技术部、策划部、宣传部、外联部四个部门。",
};

export const mockCadres: Cadre[] = [
  {
    id: "cadre-001",
    name: "李明",
    position: "社长",
    term: "第7届",
    startDate: "2024-09-01",
    department: "主席团",
  },
  {
    id: "cadre-002",
    name: "王芳",
    position: "副社长",
    term: "第7届",
    startDate: "2024-09-01",
    department: "主席团",
  },
  {
    id: "cadre-003",
    name: "张伟",
    position: "技术部部长",
    term: "第7届",
    startDate: "2024-09-01",
    department: "技术部",
  },
  {
    id: "cadre-004",
    name: "刘洋",
    position: "策划部部长",
    term: "第7届",
    startDate: "2024-09-01",
    department: "策划部",
  },
  {
    id: "cadre-005",
    name: "陈静",
    position: "社长",
    term: "第6届",
    startDate: "2023-09-01",
    endDate: "2024-08-31",
    department: "主席团",
  },
  {
    id: "cadre-006",
    name: "赵强",
    position: "副社长",
    term: "第6届",
    startDate: "2023-09-01",
    endDate: "2024-08-31",
    department: "主席团",
  },
  {
    id: "cadre-007",
    name: "孙丽",
    position: "社长",
    term: "第5届",
    startDate: "2022-09-01",
    endDate: "2023-08-31",
    department: "主席团",
  },
  {
    id: "cadre-008",
    name: "周杰",
    position: "社长",
    term: "第4届",
    startDate: "2021-09-01",
    endDate: "2022-08-31",
    department: "主席团",
  },
];

export const mockConstitutions: ConstitutionVersion[] = [
  {
    id: "const-001",
    version: "v3.0",
    content: `# 科技创新协会章程

## 第一章 总则
第一条 本社团全称为"科技创新协会"，是在校团委领导下的学生社团组织。
第二条 本社团的宗旨是：以科技创新为核心，培养学生创新思维和实践能力。

## 第二章 成员
第三条 凡本校在籍学生，承认本社团章程，均可申请加入。
第四条 成员享有以下权利：
（一）参加本社团的各项活动；
（二）对本社团工作有建议、批评和监督的权利；
（三）有选举权和被选举权。

## 第三章 组织机构
第五条 社团设社长一名，副社长两名，下设技术部、策划部、宣传部、外联部。
第六条 社长任期一年，由成员大会选举产生。

## 第四章 财务制度
第七条 社团经费来源包括会费、学校拨款、企业赞助等。
第八条 财务支出需经社长审批，定期公布账目。

## 第五章 附则
第九条 本章程自通过之日起生效。
第十条 本章程解释权归社团主席团所有。`,
    createdAt: "2024-09-10",
    createdBy: "李明",
    description: "2024学年新版章程，更新了财务制度和组织机构",
  },
  {
    id: "const-002",
    version: "v2.1",
    content: `# 科技创新协会章程

## 第一章 总则
第一条 本社团全称为"科技创新协会"，是在校团委领导下的学生社团组织。
第二条 本社团的宗旨是：以科技创新为核心，培养学生创新思维和实践能力。

## 第二章 成员
第三条 凡本校在籍学生，承认本社团章程，均可申请加入。
第四条 成员享有以下权利：
（一）参加本社团的各项活动；
（二）对本社团工作有建议、批评和监督的权利；
（三）有选举权和被选举权。

## 第三章 组织机构
第五条 社团设社长一名，副社长一名，下设技术部、策划部、宣传部。
第六条 社长任期一年，由成员大会选举产生。

## 第四章 财务制度
第七条 社团经费来源包括会费、学校拨款等。
第八条 财务支出需经社长审批。

## 第五章 附则
第九条 本章程自通过之日起生效。`,
    createdAt: "2023-09-05",
    createdBy: "陈静",
    description: "2023学年修订版，增加宣传部职责",
  },
  {
    id: "const-003",
    version: "v2.0",
    content: `# 科技创新协会章程

## 第一章 总则
第一条 本社团全称为"科技创新协会"。
第二条 本社团的宗旨是：培养学生创新思维和实践能力。

## 第二章 成员
第三条 凡本校在籍学生均可申请加入。

## 第三章 组织机构
第四条 社团设社长一名，下设技术部、策划部。

## 第四章 附则
第五条 本章程自通过之日起生效。`,
    createdAt: "2022-09-01",
    createdBy: "孙丽",
    description: "章程首次发布",
  },
];

export const mockMembers: Member[] = [
  {
    id: "member-001",
    name: "李明",
    grade: "大三",
    major: "计算机科学与技术",
    joinDate: "2022-09-15",
    position: "社长",
    phone: "13800138001",
    email: "liming@example.com",
    points: 280,
    status: "active",
    attendance: 95,
  },
  {
    id: "member-002",
    name: "王芳",
    grade: "大三",
    major: "软件工程",
    joinDate: "2022-10-01",
    position: "副社长",
    phone: "13800138002",
    email: "wangfang@example.com",
    points: 265,
    status: "active",
    attendance: 92,
  },
  {
    id: "member-003",
    name: "张伟",
    grade: "大二",
    major: "人工智能",
    joinDate: "2023-09-10",
    position: "技术部部长",
    phone: "13800138003",
    email: "zhangwei@example.com",
    points: 180,
    status: "active",
    attendance: 88,
  },
  {
    id: "member-004",
    name: "刘洋",
    grade: "大二",
    major: "数据科学",
    joinDate: "2023-09-12",
    position: "策划部部长",
    phone: "13800138004",
    email: "liuyang@example.com",
    points: 175,
    status: "active",
    attendance: 90,
  },
  {
    id: "member-005",
    name: "陈静",
    grade: "大四",
    major: "电子信息",
    joinDate: "2021-09-05",
    position: "技术部干事",
    phone: "13800138005",
    email: "chenjing@example.com",
    points: 320,
    status: "active",
    attendance: 98,
  },
  {
    id: "member-006",
    name: "赵强",
    grade: "大一",
    major: "计算机科学与技术",
    joinDate: "2024-09-20",
    position: "策划部干事",
    phone: "13800138006",
    email: "zhaoqiang@example.com",
    points: 45,
    status: "active",
    attendance: 85,
  },
  {
    id: "member-007",
    name: "孙丽",
    grade: "大一",
    major: "软件工程",
    joinDate: "2024-09-22",
    position: "宣传部干事",
    phone: "13800138007",
    email: "sunli@example.com",
    points: 40,
    status: "active",
    attendance: 82,
  },
  {
    id: "member-008",
    name: "周杰",
    grade: "大二",
    major: "人工智能",
    joinDate: "2023-10-08",
    position: "外联部部长",
    phone: "13800138008",
    email: "zhoujie@example.com",
    points: 155,
    status: "active",
    attendance: 86,
  },
  {
    id: "member-009",
    name: "吴敏",
    grade: "大三",
    major: "数据科学",
    joinDate: "2022-11-10",
    position: "宣传部部长",
    phone: "13800138009",
    email: "wumin@example.com",
    points: 220,
    status: "active",
    attendance: 91,
  },
  {
    id: "member-010",
    name: "郑浩",
    grade: "大四",
    major: "计算机科学与技术",
    joinDate: "2021-09-10",
    position: "技术部干事",
    phone: "13800138010",
    email: "zhenghao@example.com",
    points: 290,
    status: "graduated",
    attendance: 94,
  },
];

export const mockPointRecords: PointRecord[] = [
  {
    id: "point-001",
    memberId: "member-001",
    memberName: "李明",
    points: 20,
    reason: "参加程序设计竞赛获得一等奖",
    activityId: "act-001",
    activityName: "校园程序设计大赛",
    createdAt: "2024-11-15",
  },
  {
    id: "point-002",
    memberId: "member-002",
    memberName: "王芳",
    points: 15,
    reason: "组织科技创新讲座",
    activityId: "act-002",
    activityName: "AI技术前沿讲座",
    createdAt: "2024-11-10",
  },
  {
    id: "point-003",
    memberId: "member-003",
    memberName: "张伟",
    points: 10,
    reason: "参与技术培训授课",
    activityId: "act-003",
    activityName: "Python编程培训",
    createdAt: "2024-10-28",
  },
  {
    id: "point-004",
    memberId: "member-005",
    memberName: "陈静",
    points: 25,
    reason: "省级创新创业大赛金奖",
    activityId: "act-004",
    activityName: "省创新创业大赛",
    createdAt: "2024-10-20",
  },
  {
    id: "point-005",
    memberId: "member-001",
    memberName: "李明",
    points: 10,
    reason: "活动策划贡献",
    activityId: "act-005",
    activityName: "社团招新活动",
    createdAt: "2024-09-25",
  },
  {
    id: "point-006",
    memberId: "member-008",
    memberName: "周杰",
    points: 15,
    reason: "拉取企业赞助",
    createdAt: "2024-09-30",
  },
  {
    id: "point-007",
    memberId: "member-009",
    memberName: "吴敏",
    points: 10,
    reason: "宣传海报设计",
    activityId: "act-001",
    activityName: "校园程序设计大赛",
    createdAt: "2024-11-05",
  },
  {
    id: "point-008",
    memberId: "member-004",
    memberName: "刘洋",
    points: 8,
    reason: "活动场地协调",
    activityId: "act-002",
    activityName: "AI技术前沿讲座",
    createdAt: "2024-11-08",
  },
];

export const mockMemberRecords: MemberRecord[] = [
  {
    id: "record-001",
    name: "黄晓",
    type: "join",
    date: "2024-12-01",
    status: "pending",
    reason: "对人工智能很感兴趣，希望学习相关技术",
    grade: "大一",
    major: "人工智能",
    phone: "13800138011",
  },
  {
    id: "record-002",
    name: "林峰",
    type: "join",
    date: "2024-11-28",
    status: "pending",
    reason: "想参加科技竞赛",
    grade: "大二",
    major: "软件工程",
    phone: "13800138012",
  },
  {
    id: "record-003",
    name: "王磊",
    type: "leave",
    date: "2024-11-20",
    status: "approved",
    reason: "学业繁忙，时间不足",
  },
  {
    id: "record-004",
    name: "徐娜",
    type: "join",
    date: "2024-11-15",
    status: "approved",
    reason: "对编程感兴趣",
    grade: "大一",
    major: "数据科学",
    phone: "13800138013",
  },
  {
    id: "record-005",
    name: "马超",
    type: "leave",
    date: "2024-10-10",
    status: "rejected",
    reason: "个人原因",
  },
];

export const mockActivities: Activity[] = [
  {
    id: "act-001",
    name: "校园程序设计大赛",
    date: "2024-11-20",
    location: "图书馆报告厅",
    organizer: "技术部",
    budget: 3000,
    participantCount: 120,
    maxParticipants: 150,
    status: "completed",
    description: "面向全校学生的程序设计竞赛，提升同学们的编程能力",
    photos: ["photo1.jpg", "photo2.jpg"],
  },
  {
    id: "act-002",
    name: "AI技术前沿讲座",
    date: "2024-12-05",
    location: "逸夫楼201",
    organizer: "策划部",
    budget: 1500,
    participantCount: 80,
    maxParticipants: 100,
    status: "completed",
    description: "邀请业界专家分享AI领域最新技术进展",
  },
  {
    id: "act-003",
    name: "Python编程培训",
    date: "2024-10-28",
    location: "实验楼A301",
    organizer: "技术部",
    budget: 500,
    participantCount: 60,
    maxParticipants: 80,
    status: "completed",
    description: "面向零基础同学的Python入门培训课程",
  },
  {
    id: "act-004",
    name: "省创新创业大赛",
    date: "2024-10-15",
    location: "省科技馆",
    organizer: "外联部",
    budget: 5000,
    participantCount: 15,
    status: "completed",
    description: "代表学校参加省级创新创业大赛",
  },
  {
    id: "act-005",
    name: "社团招新活动",
    date: "2024-09-20",
    location: "学生活动中心广场",
    organizer: "宣传部",
    budget: 2000,
    participantCount: 200,
    status: "completed",
    description: "新学期社团招新，展示社团风采",
  },
  {
    id: "act-006",
    name: "黑客马拉松",
    date: "2024-12-25",
    location: "创业孵化基地",
    organizer: "技术部",
    budget: 4000,
    participantCount: 50,
    maxParticipants: 60,
    status: "planning",
    description: "48小时不间断编程挑战，激发创新潜能",
  },
  {
    id: "act-007",
    name: "年终总结大会",
    date: "2024-12-30",
    location: "多功能厅",
    organizer: "主席团",
    budget: 1000,
    participantCount: 100,
    maxParticipants: 120,
    status: "planning",
    description: "年度工作总结，优秀成员表彰",
  },
];

export const mockPlanVersions: PlanVersion[] = [
  {
    id: "plan-001",
    activityId: "act-006",
    activityName: "黑客马拉松",
    version: "v1.0",
    title: "黑客马拉松初步方案",
    content:
      "## 活动主题\n代码创新，未来无限\n\n## 活动时间\n2024年12月25日-26日\n\n## 活动地点\n创业孵化基地\n\n## 参与人数\n预计60人\n\n## 预算\n4000元",
    status: "draft",
    createdAt: "2024-11-25",
    createdBy: "张伟",
  },
  {
    id: "plan-002",
    activityId: "act-001",
    activityName: "校园程序设计大赛",
    version: "v1.0",
    title: "程序设计大赛初步方案",
    content:
      "## 比赛形式\n个人赛，3小时\n\n## 题目类型\n算法题5道\n\n## 奖项设置\n一等奖1名，二等奖3名，三等奖5名",
    status: "approved",
    createdAt: "2024-10-10",
    createdBy: "李明",
  },
  {
    id: "plan-003",
    activityId: "act-001",
    activityName: "校园程序设计大赛",
    version: "v2.0",
    title: "程序设计大赛优化方案",
    content:
      "## 比赛形式\n个人赛，4小时\n\n## 题目类型\n算法题6道，包含2道进阶题\n\n## 奖项设置\n一等奖1名（奖金500），二等奖3名（奖金300），三等奖5名（奖金100）\n\n## 新增环节\n赛后技术分享会",
    status: "approved",
    createdAt: "2024-10-25",
    createdBy: "李明",
  },
  {
    id: "plan-004",
    activityId: "act-002",
    activityName: "AI技术前沿讲座",
    version: "v1.0",
    title: "AI讲座方案",
    content: "## 讲座主题\n大模型技术发展趋势\n\n## 主讲嘉宾\n待定",
    status: "reviewing",
    createdAt: "2024-11-01",
    createdBy: "刘洋",
  },
];

export const mockEvaluations: ActivityEvaluation[] = [
  {
    id: "eval-001",
    activityId: "act-001",
    activityName: "校园程序设计大赛",
    participationRate: 85,
    satisfactionScore: 4.5,
    goalAchievement: 90,
    summary:
      "本次程序设计大赛参与度高，参赛选手反馈良好。比赛组织有序，题目难度适中，达到了提升同学们编程兴趣和能力的目标。建议下一届增加团队赛环节。",
    createdAt: "2024-11-22",
  },
  {
    id: "eval-002",
    activityId: "act-002",
    activityName: "AI技术前沿讲座",
    participationRate: 78,
    satisfactionScore: 4.7,
    goalAchievement: 88,
    summary:
      "讲座内容前沿实用，嘉宾分享深入浅出，同学们收获很大。满意度较高，建议以后多举办类似讲座。",
    createdAt: "2024-12-07",
  },
  {
    id: "eval-003",
    activityId: "act-003",
    activityName: "Python编程培训",
    participationRate: 92,
    satisfactionScore: 4.3,
    goalAchievement: 85,
    summary:
      "培训内容适合零基础同学，出勤率高。部分同学反映进度稍快，建议增加课后辅导环节。",
    createdAt: "2024-10-30",
  },
  {
    id: "eval-004",
    activityId: "act-004",
    activityName: "省创新创业大赛",
    participationRate: 100,
    satisfactionScore: 4.8,
    goalAchievement: 95,
    summary:
      "本次比赛成绩优异，获得金奖1项、银奖2项，超出预期目标。参赛同学表示收获满满。",
    createdAt: "2024-10-18",
  },
  {
    id: "eval-005",
    activityId: "act-005",
    activityName: "社团招新活动",
    participationRate: 95,
    satisfactionScore: 4.2,
    goalAchievement: 88,
    summary:
      "招新活动效果良好，共招收新成员45名，超额完成目标。宣传物料准备充分，现场互动活跃。",
    createdAt: "2024-09-22",
  },
];

export const mockFinanceRecords: FinanceRecord[] = [
  {
    id: "fin-001",
    type: "income",
    category: "membership_fee",
    categoryLabel: "会费收入",
    amount: 10000,
    date: "2024-09-15",
    description: "2024学年第一学期会费收缴",
    createdAt: "2024-09-15",
  },
  {
    id: "fin-002",
    type: "income",
    category: "school_grant",
    categoryLabel: "学校拨款",
    amount: 8000,
    date: "2024-09-20",
    description: "校级重点社团活动经费",
    createdAt: "2024-09-20",
  },
  {
    id: "fin-003",
    type: "income",
    category: "sponsorship",
    categoryLabel: "企业赞助",
    amount: 5000,
    date: "2024-10-10",
    description: "科技公司赞助程序设计大赛",
    relatedActivityId: "act-001",
    relatedActivityName: "校园程序设计大赛",
    createdAt: "2024-10-10",
  },
  {
    id: "fin-004",
    type: "expense",
    category: "activity",
    categoryLabel: "活动支出",
    amount: 3000,
    date: "2024-11-21",
    description: "程序设计大赛奖金及物料费",
    relatedActivityId: "act-001",
    relatedActivityName: "校园程序设计大赛",
    createdAt: "2024-11-21",
  },
  {
    id: "fin-005",
    type: "expense",
    category: "activity",
    categoryLabel: "活动支出",
    amount: 1500,
    date: "2024-12-06",
    description: "AI技术讲座场地及嘉宾费用",
    relatedActivityId: "act-002",
    relatedActivityName: "AI技术前沿讲座",
    createdAt: "2024-12-06",
  },
  {
    id: "fin-006",
    type: "expense",
    category: "office",
    categoryLabel: "办公采购",
    amount: 800,
    date: "2024-09-25",
    description: "社团招新宣传物料印刷",
    relatedActivityId: "act-005",
    relatedActivityName: "社团招新活动",
    createdAt: "2024-09-25",
  },
  {
    id: "fin-007",
    type: "expense",
    category: "activity",
    categoryLabel: "活动支出",
    amount: 500,
    date: "2024-10-29",
    description: "Python培训教材及证书费",
    relatedActivityId: "act-003",
    relatedActivityName: "Python编程培训",
    createdAt: "2024-10-29",
  },
  {
    id: "fin-008",
    type: "expense",
    category: "office",
    categoryLabel: "办公采购",
    amount: 600,
    date: "2024-10-01",
    description: "日常办公用品采购",
    createdAt: "2024-10-01",
  },
];

export const mockFinanceReports: FinanceReport[] = [
  {
    id: "report-001",
    title: "2024学年第一学期财务报告",
    period: "2024-2025学年第一学期",
    totalIncome: 23000,
    totalExpense: 11400,
    balance: 11600,
    details:
      "本学期收入合计23000元，其中会费10000元，学校拨款8000元，企业赞助5000元。支出合计11400元，主要用于活动开展和日常运营。期末结余11600元，财务状况良好。",
    createdAt: "2024-12-20",
  },
  {
    id: "report-002",
    title: "2023学年第二学期财务报告",
    period: "2023-2024学年第二学期",
    totalIncome: 18000,
    totalExpense: 15000,
    balance: 3000,
    details:
      "本学期收入合计18000元，支出合计15000元。主要活动包括春季招新、程序设计竞赛、技术培训等。期末结余3000元。",
    createdAt: "2024-06-25",
  },
];

export const mockBudgetItems: BudgetItem[] = [
  {
    id: "budget-001",
    category: "activity",
    categoryLabel: "活动支出",
    plannedAmount: 12000,
    actualAmount: 5000,
    description: "各类主题活动开展费用",
    semester: "2024-2025学年第一学期",
  },
  {
    id: "budget-002",
    category: "office",
    categoryLabel: "办公采购",
    plannedAmount: 2000,
    actualAmount: 1400,
    description: "日常办公用品及宣传物料",
    semester: "2024-2025学年第一学期",
  },
  {
    id: "budget-003",
    category: "training",
    categoryLabel: "培训经费",
    plannedAmount: 3000,
    actualAmount: 500,
    description: "技术培训课程费用",
    semester: "2024-2025学年第一学期",
  },
  {
    id: "budget-004",
    category: "other",
    categoryLabel: "其他支出",
    plannedAmount: 1000,
    actualAmount: 0,
    description: "其他不可预见支出",
    semester: "2024-2025学年第一学期",
  },
];

export const mockAchievements: Achievement[] = [
  {
    id: "ach-001",
    memberId: "member-005",
    memberName: "陈静",
    title: "省创新创业大赛金奖",
    category: "competition",
    date: "2024-10-15",
    description:
      "作为项目负责人带队参加省创新创业大赛，凭借'智能校园导航系统'项目荣获金奖，展现了出色的创新能力和团队协作精神。",
    attachments: ["证书.pdf", "项目报告.docx"],
    createdAt: "2024-10-16",
  },
  {
    id: "ach-002",
    memberId: "member-001",
    memberName: "李明",
    title: "国家奖学金",
    category: "scholarship",
    date: "2024-10-01",
    description:
      "学业成绩专业排名第一，综合素质突出，荣获2023-2024学年国家奖学金。",
    attachments: ["奖学金证书.pdf"],
    createdAt: "2024-10-02",
  },
  {
    id: "ach-003",
    memberId: "member-002",
    memberName: "王芳",
    title: "校级三好学生",
    category: "honor",
    date: "2024-09-15",
    description: "德智体美劳全面发展，被评为校级三好学生。",
    attachments: ["荣誉证书.pdf"],
    createdAt: "2024-09-16",
  },
  {
    id: "ach-004",
    memberId: "member-003",
    memberName: "张伟",
    title: "程序设计竞赛一等奖",
    category: "competition",
    date: "2024-11-20",
    description: "校园程序设计大赛个人赛一等奖。",
    attachments: ["获奖证书.pdf"],
    createdAt: "2024-11-21",
  },
  {
    id: "ach-005",
    memberId: "member-008",
    memberName: "周杰",
    title: "优秀志愿者",
    category: "volunteer",
    date: "2024-12-05",
    description: "积极参与社区科技志愿服务，累计服务时长50小时。",
    attachments: ["志愿服务证明.pdf"],
    createdAt: "2024-12-06",
  },
  {
    id: "ach-006",
    memberId: "member-009",
    memberName: "吴敏",
    title: "优秀学生干部",
    category: "honor",
    date: "2024-10-20",
    description: "担任宣传部部长期间工作出色，被评为优秀学生干部。",
    attachments: ["荣誉证书.pdf"],
    createdAt: "2024-10-21",
  },
];

export const mockHonorApplications: HonorApplication[] = [
  {
    id: "app-001",
    memberId: "member-005",
    memberName: "陈静",
    honorName: "校长奖学金",
    applicationDate: "2024-12-01",
    status: "reviewing",
    materials: ["成绩单.pdf", "获奖证明.pdf", "推荐信.docx"],
    remarks: "材料齐全，成绩优异",
  },
  {
    id: "app-002",
    memberId: "member-001",
    memberName: "李明",
    honorName: "十佳大学生",
    applicationDate: "2024-11-25",
    status: "submitted",
    materials: ["申请表.docx", "成绩单.pdf", "事迹材料.pdf"],
  },
  {
    id: "app-003",
    memberId: "member-002",
    memberName: "王芳",
    honorName: "优秀社团干部",
    applicationDate: "2024-12-10",
    status: "draft",
    materials: ["申请表.docx"],
    remarks: "材料准备中",
  },
];
