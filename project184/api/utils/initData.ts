import { writeDataFile, dataFiles, generateId, DATA_DIR } from "./storage.js";
import fs from "fs";
import path from "path";

const initialClubInfo = {
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

const initialCadres = [
  { id: "cadre-001", name: "李明", position: "社长", term: "第7届", startDate: "2024-09-01", department: "主席团" },
  { id: "cadre-002", name: "王芳", position: "副社长", term: "第7届", startDate: "2024-09-01", department: "主席团" },
  { id: "cadre-003", name: "张伟", position: "技术部部长", term: "第7届", startDate: "2024-09-01", department: "技术部" },
  { id: "cadre-004", name: "刘洋", position: "策划部部长", term: "第7届", startDate: "2024-09-01", department: "策划部" },
  { id: "cadre-005", name: "陈静", position: "社长", term: "第6届", startDate: "2023-09-01", endDate: "2024-08-31", department: "主席团" },
  { id: "cadre-006", name: "赵强", position: "副社长", term: "第6届", startDate: "2023-09-01", endDate: "2024-08-31", department: "主席团" },
];

const initialMembers = [
  { id: "member-001", name: "李明", grade: "大三", major: "计算机科学与技术", joinDate: "2022-09-15", position: "社长", phone: "13800138001", email: "liming@example.com", points: 280, status: "active", attendance: 95 },
  { id: "member-002", name: "王芳", grade: "大三", major: "软件工程", joinDate: "2022-10-01", position: "副社长", phone: "13800138002", email: "wangfang@example.com", points: 265, status: "active", attendance: 92 },
  { id: "member-003", name: "张伟", grade: "大二", major: "人工智能", joinDate: "2023-09-10", position: "技术部部长", phone: "13800138003", email: "zhangwei@example.com", points: 180, status: "active", attendance: 88 },
  { id: "member-004", name: "刘洋", grade: "大二", major: "数据科学", joinDate: "2023-09-12", position: "策划部部长", phone: "13800138004", email: "liuyang@example.com", points: 175, status: "active", attendance: 90 },
  { id: "member-005", name: "陈静", grade: "大四", major: "电子信息", joinDate: "2021-09-05", position: "技术部干事", phone: "13800138005", email: "chenjing@example.com", points: 320, status: "active", attendance: 98 },
  { id: "member-006", name: "赵强", grade: "大一", major: "计算机科学与技术", joinDate: "2024-09-20", position: "策划部干事", phone: "13800138006", email: "zhaoqiang@example.com", points: 45, status: "active", attendance: 85 },
  { id: "member-007", name: "孙丽", grade: "大一", major: "软件工程", joinDate: "2024-09-22", position: "宣传部干事", phone: "13800138007", email: "sunli@example.com", points: 40, status: "active", attendance: 82 },
  { id: "member-008", name: "周杰", grade: "大二", major: "人工智能", joinDate: "2023-10-08", position: "外联部部长", phone: "13800138008", email: "zhoujie@example.com", points: 155, status: "active", attendance: 86 },
  { id: "member-009", name: "吴敏", grade: "大三", major: "数据科学", joinDate: "2022-11-10", position: "宣传部部长", phone: "13800138009", email: "wumin@example.com", points: 220, status: "active", attendance: 91 },
  { id: "member-010", name: "郑浩", grade: "大四", major: "计算机科学与技术", joinDate: "2021-09-10", position: "技术部干事", phone: "13800138010", email: "zhenghao@example.com", points: 290, status: "graduated", attendance: 94 },
];

const initialActivities = [
  { id: "act-001", name: "校园程序设计大赛", date: "2024-11-20", location: "图书馆报告厅", organizer: "技术部", budget: 3000, participantCount: 120, maxParticipants: 150, status: "completed", description: "面向全校学生的程序设计竞赛" },
  { id: "act-002", name: "AI技术前沿讲座", date: "2024-12-05", location: "逸夫楼201", organizer: "策划部", budget: 1500, participantCount: 80, maxParticipants: 100, status: "completed", description: "邀请业界专家分享AI领域最新技术进展" },
  { id: "act-003", name: "Python编程培训", date: "2024-10-28", location: "实验楼A301", organizer: "技术部", budget: 500, participantCount: 60, maxParticipants: 80, status: "completed", description: "面向零基础同学的Python入门培训课程" },
  { id: "act-004", name: "省创新创业大赛", date: "2024-10-15", location: "省科技馆", organizer: "外联部", budget: 5000, participantCount: 15, status: "completed", description: "代表学校参加省级创新创业大赛" },
  { id: "act-005", name: "社团招新活动", date: "2024-09-20", location: "学生活动中心广场", organizer: "宣传部", budget: 2000, participantCount: 200, status: "completed", description: "新学期社团招新，展示社团风采" },
  { id: "act-006", name: "黑客马拉松", date: "2024-12-25", location: "创业孵化基地", organizer: "技术部", budget: 4000, participantCount: 50, maxParticipants: 60, status: "planning", description: "48小时不间断编程挑战" },
  { id: "act-007", name: "年终总结大会", date: "2024-12-30", location: "多功能厅", organizer: "主席团", budget: 1000, participantCount: 100, maxParticipants: 120, status: "planning", description: "年度工作总结，优秀成员表彰" },
];

const initialFinanceRecords = [
  { id: "fin-001", type: "income", category: "membership_fee", categoryLabel: "会费收入", amount: 10000, date: "2024-09-15", description: "2024学年第一学期会费收缴", createdAt: "2024-09-15" },
  { id: "fin-002", type: "income", category: "school_grant", categoryLabel: "学校拨款", amount: 8000, date: "2024-09-20", description: "校级重点社团活动经费", createdAt: "2024-09-20" },
  { id: "fin-003", type: "income", category: "sponsorship", categoryLabel: "企业赞助", amount: 5000, date: "2024-10-10", description: "科技公司赞助程序设计大赛", relatedActivityId: "act-001", relatedActivityName: "校园程序设计大赛", createdAt: "2024-10-10" },
  { id: "fin-004", type: "expense", category: "activity", categoryLabel: "活动支出", amount: 3000, date: "2024-11-21", description: "程序设计大赛奖金及物料费", relatedActivityId: "act-001", relatedActivityName: "校园程序设计大赛", createdAt: "2024-11-21" },
  { id: "fin-005", type: "expense", category: "activity", categoryLabel: "活动支出", amount: 1500, date: "2024-12-06", description: "AI技术讲座场地及嘉宾费用", relatedActivityId: "act-002", relatedActivityName: "AI技术前沿讲座", createdAt: "2024-12-06" },
  { id: "fin-006", type: "expense", category: "office", categoryLabel: "办公采购", amount: 800, date: "2024-09-25", description: "社团招新宣传物料印刷", createdAt: "2024-09-25" },
  { id: "fin-007", type: "expense", category: "activity", categoryLabel: "活动支出", amount: 500, date: "2024-10-29", description: "Python培训教材及证书费", createdAt: "2024-10-29" },
];

export function initData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const clubInfoPath = path.join(DATA_DIR, dataFiles.clubInfo);
  if (!fs.existsSync(clubInfoPath)) {
    writeDataFile(dataFiles.clubInfo, initialClubInfo);
  }

  const cadresPath = path.join(DATA_DIR, dataFiles.cadres);
  if (!fs.existsSync(cadresPath)) {
    writeDataFile(dataFiles.cadres, initialCadres);
  }

  const membersPath = path.join(DATA_DIR, dataFiles.members);
  if (!fs.existsSync(membersPath)) {
    writeDataFile(dataFiles.members, initialMembers);
  }

  const activitiesPath = path.join(DATA_DIR, dataFiles.activities);
  if (!fs.existsSync(activitiesPath)) {
    writeDataFile(dataFiles.activities, initialActivities);
  }

  const financePath = path.join(DATA_DIR, dataFiles.financeRecords);
  if (!fs.existsSync(financePath)) {
    writeDataFile(dataFiles.financeRecords, initialFinanceRecords);
  }

  const pointRecordsPath = path.join(DATA_DIR, dataFiles.pointRecords);
  if (!fs.existsSync(pointRecordsPath)) {
    writeDataFile(dataFiles.pointRecords, [
      { id: "point-001", memberId: "member-001", memberName: "李明", points: 20, reason: "参加程序设计竞赛获得一等奖", activityId: "act-001", activityName: "校园程序设计大赛", createdAt: "2024-11-15" },
      { id: "point-002", memberId: "member-002", memberName: "王芳", points: 15, reason: "组织科技创新讲座", activityId: "act-002", activityName: "AI技术前沿讲座", createdAt: "2024-11-10" },
      { id: "point-003", memberId: "member-005", memberName: "陈静", points: 25, reason: "省级创新创业大赛金奖", activityId: "act-004", activityName: "省创新创业大赛", createdAt: "2024-10-20" },
    ]);
  }

  const memberRecordsPath = path.join(DATA_DIR, dataFiles.memberRecords);
  if (!fs.existsSync(memberRecordsPath)) {
    writeDataFile(dataFiles.memberRecords, [
      { id: "record-001", name: "黄晓", type: "join", date: "2024-12-01", status: "pending", reason: "对人工智能很感兴趣", grade: "大一", major: "人工智能", phone: "13800138011" },
      { id: "record-002", name: "林峰", type: "join", date: "2024-11-28", status: "pending", reason: "想参加科技竞赛", grade: "大二", major: "软件工程", phone: "13800138012" },
      { id: "record-003", name: "王磊", type: "leave", date: "2024-11-20", status: "approved", reason: "学业繁忙，时间不足" },
    ]);
  }

  const constitutionsPath = path.join(DATA_DIR, dataFiles.constitutions);
  if (!fs.existsSync(constitutionsPath)) {
    writeDataFile(dataFiles.constitutions, [
      { id: "const-001", version: "v3.0", content: "# 科技创新协会章程\n\n## 第一章 总则\n第一条 本社团全称为科技创新协会，是在校团委领导下的学生社团组织。\n第二条 本社团的宗旨是：以科技创新为核心，培养学生创新思维和实践能力。", createdAt: "2024-09-10", createdBy: "李明", description: "2024学年新版章程" },
      { id: "const-002", version: "v2.1", content: "# 科技创新协会章程\n\n## 第一章 总则\n第一条 本社团全称为科技创新协会。\n第二条 本社团的宗旨是：培养学生创新思维。", createdAt: "2023-09-05", createdBy: "陈静", description: "2023学年修订版" },
    ]);
  }

  const planVersionsPath = path.join(DATA_DIR, dataFiles.planVersions);
  if (!fs.existsSync(planVersionsPath)) {
    writeDataFile(dataFiles.planVersions, [
      { id: "plan-001", activityId: "act-006", activityName: "黑客马拉松", version: "v1.0", title: "黑客马拉松初步方案", content: "## 活动主题\n代码创新，未来无限\n\n## 活动时间\n2024年12月25日-26日", status: "draft", createdAt: "2024-11-25", createdBy: "张伟" },
      { id: "plan-002", activityId: "act-001", activityName: "校园程序设计大赛", version: "v2.0", title: "程序设计大赛优化方案", content: "## 比赛形式\n个人赛，4小时\n\n## 题目类型\n算法题6道", status: "approved", createdAt: "2024-10-25", createdBy: "李明" },
    ]);
  }

  const evaluationsPath = path.join(DATA_DIR, dataFiles.evaluations);
  if (!fs.existsSync(evaluationsPath)) {
    writeDataFile(dataFiles.evaluations, [
      { id: "eval-001", activityId: "act-001", activityName: "校园程序设计大赛", participationRate: 85, satisfactionScore: 4.5, goalAchievement: 90, summary: "本次程序设计大赛参与度高，参赛选手反馈良好。", createdAt: "2024-11-22" },
      { id: "eval-002", activityId: "act-002", activityName: "AI技术前沿讲座", participationRate: 78, satisfactionScore: 4.7, goalAchievement: 88, summary: "讲座内容前沿实用，嘉宾分享深入浅出。", createdAt: "2024-12-07" },
      { id: "eval-003", activityId: "act-003", activityName: "Python编程培训", participationRate: 92, satisfactionScore: 4.3, goalAchievement: 85, summary: "培训内容适合零基础同学，出勤率高。", createdAt: "2024-10-30" },
    ]);
  }

  const financeReportsPath = path.join(DATA_DIR, dataFiles.financeReports);
  if (!fs.existsSync(financeReportsPath)) {
    writeDataFile(dataFiles.financeReports, [
      { id: "report-001", title: "2024学年第一学期财务报告", period: "2024-2025学年第一学期", totalIncome: 23000, totalExpense: 11400, balance: 11600, details: "本学期收入合计23000元，支出合计11400元。期末结余11600元，财务状况良好。", createdAt: "2024-12-20" },
    ]);
  }

  const budgetItemsPath = path.join(DATA_DIR, dataFiles.budgetItems);
  if (!fs.existsSync(budgetItemsPath)) {
    writeDataFile(dataFiles.budgetItems, [
      { id: "budget-001", category: "activity", categoryLabel: "活动支出", plannedAmount: 12000, actualAmount: 5000, description: "各类主题活动开展费用", semester: "2024-2025学年第一学期" },
      { id: "budget-002", category: "office", categoryLabel: "办公采购", plannedAmount: 2000, actualAmount: 1400, description: "日常办公用品及宣传物料", semester: "2024-2025学年第一学期" },
      { id: "budget-003", category: "training", categoryLabel: "培训经费", plannedAmount: 3000, actualAmount: 500, description: "技术培训课程费用", semester: "2024-2025学年第一学期" },
    ]);
  }

  const achievementsPath = path.join(DATA_DIR, dataFiles.achievements);
  if (!fs.existsSync(achievementsPath)) {
    writeDataFile(dataFiles.achievements, [
      { id: "ach-001", memberId: "member-005", memberName: "陈静", title: "省创新创业大赛金奖", category: "competition", date: "2024-10-15", description: "作为项目负责人带队参加省创新创业大赛荣获金奖。", attachments: ["证书.pdf"], createdAt: "2024-10-16" },
      { id: "ach-002", memberId: "member-001", memberName: "李明", title: "国家奖学金", category: "scholarship", date: "2024-10-01", description: "学业成绩专业排名第一，荣获国家奖学金。", attachments: ["奖学金证书.pdf"], createdAt: "2024-10-02" },
      { id: "ach-003", memberId: "member-002", memberName: "王芳", title: "校级三好学生", category: "honor", date: "2024-09-15", description: "德智体美劳全面发展，被评为校级三好学生。", attachments: ["荣誉证书.pdf"], createdAt: "2024-09-16" },
      { id: "ach-004", memberId: "member-003", memberName: "张伟", title: "程序设计竞赛一等奖", category: "competition", date: "2024-11-20", description: "校园程序设计大赛个人赛一等奖。", attachments: ["获奖证书.pdf"], createdAt: "2024-11-21" },
    ]);
  }

  const honorApplicationsPath = path.join(DATA_DIR, dataFiles.honorApplications);
  if (!fs.existsSync(honorApplicationsPath)) {
    writeDataFile(dataFiles.honorApplications, [
      { id: "app-001", memberId: "member-005", memberName: "陈静", honorName: "校长奖学金", applicationDate: "2024-12-01", status: "reviewing", materials: ["成绩单.pdf", "获奖证明.pdf"], remarks: "材料齐全，成绩优异" },
      { id: "app-002", memberId: "member-001", memberName: "李明", honorName: "十佳大学生", applicationDate: "2024-11-25", status: "submitted", materials: ["申请表.docx", "成绩单.pdf"], remarks: "" },
      { id: "app-003", memberId: "member-002", memberName: "王芳", honorName: "优秀社团干部", applicationDate: "2024-12-10", status: "draft", materials: ["申请表.docx"], remarks: "材料准备中" },
    ]);
  }
}

export { generateId };
