import { Student, Attendance, Exam, Grade, Behavior, StudentGroup, GroupMember, Communication, Announcement, LeaveRequest, HomeVisit } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 9);

const firstNames = ['张', '李', '王', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗', '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹', '彭', '曾', '萧', '田', '董', '袁', '潘', '于', '蒋', '蔡'];
const givenNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '文', '华', '玲', '辉', '鑫', '斌', '波', '宇', '浩', '凯', '健', '俊', '帆', '鹏', '博', '婷', '雪', '倩', '琳'];

const generateName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
  return firstName + givenName;
};

const generatePhone = () => {
  const prefix = ['138', '139', '158', '159', '188', '189', '136', '137', '150', '151'];
  return prefix[Math.floor(Math.random() * prefix.length)] + Math.random().toString().slice(2, 10);
};

const streets = ['文化路', '学府路', '建设路', '人民路', '解放路', '中山路', '光明路', '幸福路', '和平路', '民主路'];
const cities = ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '通州区', '顺义区', '昌平区', '大兴区', '房山区'];

const generateAddress = () => {
  const city = cities[Math.floor(Math.random() * cities.length)];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const number = Math.floor(Math.random() * 100) + 1;
  const unit = Math.floor(Math.random() * 10) + 1;
  const room = Math.floor(Math.random() * 200) + 101;
  return `${city}${street}${number}号${unit}单元${room}室`;
};

export const generateMockStudents = (): Student[] => {
  const students: Student[] = [];
  const rows = 5;
  const cols = 8;
  
  for (let i = 0; i < 40; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const gender = Math.random() > 0.5 ? '男' : '女';
    const birthYear = 2012 + Math.floor(Math.random() * 2);
    const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    
    students.push({
      id: generateId(),
      name: generateName(),
      studentNo: `2024${String(i + 1).padStart(4, '0')}`,
      gender,
      birthDate: `${birthYear}-${birthMonth}-${birthDay}`,
      parentName: generateName(),
      parentPhone: generatePhone(),
      address: generateAddress(),
      notes: Math.random() > 0.8 ? '需要特别关注学习情况' : '',
      photoUrl: gender === '男' 
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=boy${i}&backgroundColor=b6e3f4`
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=girl${i}&backgroundColor=ffd5dc`,
      seatRow: row,
      seatCol: col,
      createdAt: new Date().toISOString().split('T')[0]
    });
  }
  return students;
};

export const generateMockAttendance = (students: Student[]): Attendance[] => {
  const attendance: Attendance[] = [];
  const today = new Date();
  
  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];
    
    students.forEach(student => {
      const rand = Math.random();
      let status: 'present' | 'late' | 'leave' | 'absent';
      if (rand > 0.95) status = 'absent';
      else if (rand > 0.88) status = 'late';
      else if (rand > 0.82) status = 'leave';
      else status = 'present';
      
      attendance.push({
        id: generateId(),
        studentId: student.id,
        date: dateStr,
        status,
        remarks: status !== 'present' ? (status === 'late' ? '迟到15分钟' : status === 'leave' ? '感冒请假' : '无故缺席') : ''
      });
    });
  }
  return attendance;
};

export const mockExams: Exam[] = [
  { id: generateId(), name: '第一次月考', date: '2024-09-25', term: '2024-2025学年第一学期' },
  { id: generateId(), name: '期中考试', date: '2024-11-15', term: '2024-2025学年第一学期' },
  { id: generateId(), name: '第二次月考', date: '2024-12-20', term: '2024-2025学年第一学期' }
];

export const generateMockGrades = (students: Student[]): Grade[] => {
  const grades: Grade[] = [];
  const subjects = ['语文', '数学', '英语', '物理', '化学'];
  
  mockExams.forEach(exam => {
    students.forEach(student => {
      subjects.forEach(subject => {
        const baseScore = 60 + Math.random() * 40;
        const variance = (Math.random() - 0.5) * 20;
        const score = Math.round(Math.min(100, Math.max(30, baseScore + variance)));
        
        grades.push({
          id: generateId(),
          studentId: student.id,
          examId: exam.id,
          score,
          subject
        });
      });
    });
  });
  return grades;
};

export const generateMockBehaviors = (students: Student[]): Behavior[] => {
  const behaviors: Behavior[] = [];
  const positiveDescs = ['积极回答问题', '作业完成优秀', '帮助同学', '课堂表现活跃', '值日认真负责'];
  const negativeDescs = ['上课讲话', '未完成作业', '迟到', '与同学发生争执', '上课睡觉'];
  
  for (let i = 0; i < 60; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const isPositive = Math.random() > 0.3;
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    behaviors.push({
      id: generateId(),
      studentId: student.id,
      date: date.toISOString().split('T')[0],
      type: isPositive ? 'positive' : 'negative',
      description: isPositive 
        ? positiveDescs[Math.floor(Math.random() * positiveDescs.length)]
        : negativeDescs[Math.floor(Math.random() * negativeDescs.length)],
      points: isPositive ? 1 : -1
    });
  }
  return behaviors;
};

export const mockGroups: StudentGroup[] = [
  { id: generateId(), name: '第一小组', description: '数学探究小组', assignment: '完成圆周率历史研究报告' },
  { id: generateId(), name: '第二小组', description: '语文阅读小组', assignment: '经典文学作品分享会' },
  { id: generateId(), name: '第三小组', description: '英语实践小组', assignment: '英语话剧表演准备' },
  { id: generateId(), name: '第四小组', description: '科学实验小组', assignment: '植物生长环境对比实验' },
  { id: generateId(), name: '第五小组', description: '社会实践小组', assignment: '社区志愿服务活动' }
];

export const generateMockGroupMembers = (students: Student[]): GroupMember[] => {
  const members: GroupMember[] = [];
  const roles = ['组长', '记录员', '发言人', '资料收集', '后勤'];
  
  mockGroups.forEach((group, groupIndex) => {
    for (let i = 0; i < 8; i++) {
      const studentIndex = groupIndex * 8 + i;
      if (studentIndex < students.length) {
        members.push({
          id: generateId(),
          groupId: group.id,
          studentId: students[studentIndex].id,
          role: roles[i % roles.length]
        });
      }
    }
  });
  return members;
};

export const generateMockCommunications = (students: Student[]): Communication[] => {
  const communications: Communication[] = [];
  const reasons = ['学习情况沟通', '行为习惯问题', '家校合作', '特殊情况说明', '考试反馈'];
  const types: ('phone' | 'message' | 'meeting' | 'other')[] = ['phone', 'message', 'meeting', 'other'];
  
  for (let i = 0; i < 20; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    communications.push({
      id: generateId(),
      studentId: student.id,
      date: date.toISOString().split('T')[0],
      type: types[Math.floor(Math.random() * types.length)],
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      content: '与家长详细沟通了学生近期的学习表现和行为习惯，家长表示会积极配合学校的教育工作。',
      operator: '李老师'
    });
  }
  return communications;
};

export const mockAnnouncements: Announcement[] = [
  { id: generateId(), title: '期中考试通知', content: '本学期期中考试定于11月15日进行，请各位家长督促学生认真复习，考试期间注意休息，保持良好的精神状态。', date: '2024-11-01', author: '班主任' },
  { id: generateId(), title: '家长会通知', content: '定于11月22日下午2点在本班教室召开家长会，届时将汇报学生半学期的学习情况，请各位家长准时参加。', date: '2024-11-10', author: '班主任' },
  { id: generateId(), title: '冬季运动会报名', content: '学校冬季运动会将于12月5日举行，请各位同学积极报名参加，展示班级风采。报名截止日期11月25日。', date: '2024-11-18', author: '体育委员' },
  { id: generateId(), title: '安全提醒', content: '近期天气转冷，请各位同学注意保暖，上下学途中注意交通安全，遵守交通规则。', date: '2024-11-25', author: '班主任' }
];

export const generateMockLeaves = (students: Student[]): LeaveRequest[] => {
  const leaves: LeaveRequest[] = [];
  const reasons = ['感冒发烧', '家庭有事', '身体不适', '参加校外活动', '看医生'];
  const statuses: ('pending' | 'approved' | 'rejected')[] = ['approved', 'approved', 'pending', 'approved', 'rejected'];
  
  for (let i = 0; i < 8; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 20));
    const startDate = date.toISOString().split('T')[0];
    date.setDate(date.getDate() + Math.floor(Math.random() * 3));
    const endDate = date.toISOString().split('T')[0];
    
    leaves.push({
      id: generateId(),
      studentId: student.id,
      startDate,
      endDate,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      attachmentUrl: ''
    });
  }
  return leaves;
};

export const generateMockHomeVisits = (students: Student[]): HomeVisit[] => {
  const visits: HomeVisit[] = [];
  
  for (let i = 0; i < 6; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    
    visits.push({
      id: generateId(),
      studentId: student.id,
      date: date.toISOString().split('T')[0],
      purpose: '了解学生家庭学习环境',
      content: '家访了解了学生的家庭学习环境，与家长深入交流了学生的成长情况，制定了个性化的学习计划。家长表示会积极配合学校教育。',
      participants: '班主任、家长、学生'
    });
  }
  return visits;
};

export const mockStudents = generateMockStudents();
export const mockAttendance = generateMockAttendance(mockStudents);
export const mockGrades = generateMockGrades(mockStudents);
export const mockBehaviors = generateMockBehaviors(mockStudents);
export const mockGroupMembers = generateMockGroupMembers(mockStudents);
export const mockCommunications = generateMockCommunications(mockStudents);
export const mockLeaves = generateMockLeaves(mockStudents);
export const mockHomeVisits = generateMockHomeVisits(mockStudents);
