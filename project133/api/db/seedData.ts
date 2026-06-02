import type {
  ExperimentTemplate,
  StudentReport,
  CommentTemplate,
  Resource,
  Archive,
  Schedule,
  ClassInfo,
  Student
} from '../../shared/types.js';
import { setCollection, initDb } from './jsonDb.js';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const formatDateTime = (d: Date) => d.toISOString();

function daysAgo(days: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return formatDateTime(d);
}

export function seedData(): void {
  initDb();

  const templates: ExperimentTemplate[] = [
    {
      id: 1,
      name: '牛顿第二定律验证实验',
      courseName: '大学物理实验',
      purpose: '验证牛顿第二定律F=ma，理解力、质量和加速度之间的关系',
      principle: '当物体质量不变时，加速度与所受合外力成正比；当合外力不变时，加速度与物体质量成反比。即F=ma。',
      instruments: ['气垫导轨', '光电门计时器', '滑块', '砝码组', '气源', '游标卡尺'],
      steps: [
        { order: 1, title: '仪器调平', description: '打开气源，将滑块放在导轨上，调节导轨底脚螺丝使滑块能静止或匀速运动' },
        { order: 2, title: '质量测量', description: '用天平测量滑块和砝码的质量，记录数据' },
        { order: 3, title: '安装光电门', description: '将两个光电门固定在导轨上，间距为50cm' },
        { order: 4, title: '连接计时器', description: '将光电门与计时器连接，设置为计时模式' },
        { order: 5, title: '恒力实验', description: '保持滑块质量不变，改变拉力（砝码质量），测量加速度' },
        { order: 6, title: '变质量实验', description: '保持拉力不变，改变滑块质量，测量加速度' },
        { order: 7, title: '数据处理', description: '记录每组数据，计算加速度，绘制F-a图和m-a图' }
      ],
      dataTable: [
        { name: '砝码质量', unit: 'g', type: 'number' },
        { name: '滑块质量', unit: 'g', type: 'number' },
        { name: '时间t1', unit: 'ms', type: 'number' },
        { name: '时间t2', unit: 'ms', type: 'number' },
        { name: '加速度', unit: 'm/s²', type: 'number' }
      ],
      questions: [
        { id: 1, content: '如果导轨未调平，对实验结果会产生什么影响？如何消除这种影响？', type: 'essay' },
        { id: 2, content: '已知滑块质量为200g，砝码质量为20g，求理论加速度值（g=9.8m/s²）', type: 'calculation' },
        { id: 3, content: '分析实验中产生误差的主要来源，并提出改进措施。', type: 'essay' }
      ],
      safetyNotes: [
        '气源使用时注意电源安全，避免潮湿环境',
        '导轨表面严禁用手触摸或放置异物',
        '滑块轻拿轻放，防止跌落损坏',
        '实验结束后先关气源，再整理仪器'
      ],
      previewRequirements: [
        '复习牛顿第二定律的内容和公式',
        '预习气垫导轨的工作原理和使用方法',
        '了解光电门计时器的使用',
        '预习实验步骤，写出预习报告'
      ],
      assessmentPoints: [
        '仪器调平操作正确性（20%）',
        '数据测量准确性（30%）',
        '数据处理和图表绘制（25%）',
        '思考题回答质量（15%）',
        '实验态度和纪律（10%）'
      ],
      createdAt: daysAgo(30),
      updatedAt: daysAgo(10)
    },
    {
      id: 2,
      name: '酸碱中和滴定实验',
      courseName: '基础化学实验',
      purpose: '掌握酸碱滴定的基本操作，学会用已知浓度的酸（或碱）测定未知浓度的碱（或酸）',
      principle: '酸碱中和反应的本质是H++OH-=H2O，当反应达到化学计量点时，pH值发生突变，通过指示剂颜色变化确定终点。',
      instruments: ['酸式滴定管', '碱式滴定管', '锥形瓶', '移液管', '洗耳球', '滴定台', '烧杯'],
      steps: [
        { order: 1, title: '仪器洗涤', description: '将滴定管、移液管、锥形瓶用蒸馏水洗净，滴定管和移液管用待装溶液润洗' },
        { order: 2, title: '装液', description: '将标准HCl溶液装入酸式滴定管，将待测NaOH溶液用移液管移入锥形瓶' },
        { order: 3, title: '排气泡', description: '排气滴定管下端的气泡，调整液面至零刻度或以下' },
        { order: 4, title: '加指示剂', description: '向锥形瓶中滴加2-3滴酚酞指示剂' },
        { order: 5, title: '滴定操作', description: '左手控制活塞，右手摇动锥形瓶，眼睛观察颜色变化' },
        { order: 6, title: '终点判断', description: '当溶液由无色变为浅红色且30秒不褪色时，停止滴定' },
        { order: 7, title: '平行测定', description: '重复滴定2-3次，记录每次消耗的酸体积' }
      ],
      dataTable: [
        { name: 'NaOH溶液体积', unit: 'mL', type: 'number' },
        { name: 'HCl浓度', unit: 'mol/L', type: 'number' },
        { name: 'HCl初读数', unit: 'mL', type: 'number' },
        { name: 'HCl终读数', unit: 'mL', type: 'number' },
        { name: 'HCl消耗体积', unit: 'mL', type: 'number' },
        { name: 'NaOH浓度', unit: 'mol/L', type: 'number' }
      ],
      questions: [
        { id: 1, content: '为什么滴定管和移液管需要用待装溶液润洗，而锥形瓶不需要？', type: 'essay' },
        { id: 2, content: '若滴定管下端有气泡未排除，对测定结果有何影响？', type: 'essay' },
        { id: 3, content: '用0.1000mol/L HCl滴定25.00mL NaOH溶液，消耗HCl 22.50mL，计算NaOH溶液的浓度', type: 'calculation' }
      ],
      safetyNotes: [
        '酸碱溶液具有腐蚀性，避免接触皮肤和衣物',
        '如不慎溅到皮肤上，立即用大量水冲洗',
        '滴定管竖直放置，防止溶液溅出',
        '实验结束后将废液倒入指定容器'
      ],
      previewRequirements: [
        '复习酸碱中和反应原理',
        '预习滴定管的使用方法和读数规则',
        '了解指示剂的变色原理和选择',
        '熟悉实验操作步骤'
      ],
      assessmentPoints: [
        '滴定管使用规范性（25%）',
        '移液操作准确性（20%）',
        '终点判断正确性（25%）',
        '数据处理和结果计算（20%）',
        '实验习惯和安全（10%）'
      ],
      createdAt: daysAgo(25),
      updatedAt: daysAgo(5)
    },
    {
      id: 3,
      name: '惠斯通电桥测电阻',
      courseName: '电路分析实验',
      purpose: '掌握惠斯通电桥的工作原理，学会用电桥法测量中值电阻',
      principle: '惠斯通电桥由四个电阻组成桥臂，当电桥平衡时，对臂电阻乘积相等，即R1/R2=Rx/Rs，由此可求得未知电阻Rx。',
      instruments: ['直流稳压电源', '滑线变阻器', '检流计', '电阻箱', '待测电阻', '开关', '导线'],
      steps: [
        { order: 1, title: '电路连接', description: '按电路图连接电路，将电源电压调至3V' },
        { order: 2, title: '比率选择', description: '根据待测电阻标称值选择合适的比率臂' },
        { order: 3, title: '粗调平衡', description: '保护电阻置最大，调节比较臂使检流计指零' },
        { order: 4, title: '细调平衡', description: '减小保护电阻，重新调节使电桥平衡' },
        { order: 5, title: '记录数据', description: '记录比率和比较臂电阻值' },
        { order: 6, title: '交换测量', description: '交换待测电阻和比较臂位置，再次测量以消除系统误差' },
        { order: 7, title: '测量多个电阻', description: '更换不同待测电阻，重复上述步骤' }
      ],
      dataTable: [
        { name: '电阻编号', unit: '', type: 'text' },
        { name: '比率K', unit: '', type: 'number' },
        { name: '比较臂Rs', unit: 'Ω', type: 'number' },
        { name: '测量值Rx1', unit: 'Ω', type: 'number' },
        { name: '交换测量Rx2', unit: 'Ω', type: 'number' },
        { name: '平均值Rx', unit: 'Ω', type: 'number' }
      ],
      questions: [
        { id: 1, content: '惠斯通电桥的平衡条件是什么？影响电桥灵敏度的因素有哪些？', type: 'essay' },
        { id: 2, content: '为什么要采用交换测量法？它能消除哪些系统误差？', type: 'essay' },
        { id: 3, content: '已知比率K=10，比较臂Rs=345.6Ω，求待测电阻Rx的值', type: 'calculation' }
      ],
      safetyNotes: [
        '电源电压不能过高，避免元件损坏',
        '电路连接完成后经检查无误再接通电源',
        '检流计使用时注意保护，避免大电流通过',
        '实验结束后先关电源再拆线'
      ],
      previewRequirements: [
        '复习惠斯通电桥工作原理',
        '预习电阻箱和检流计的使用',
        '了解电桥灵敏度的概念',
        '绘制实验电路图'
      ],
      assessmentPoints: [
        '电路连接正确性（25%）',
        '电桥调节技巧（25%）',
        '测量方法掌握（20%）',
        '数据处理和误差分析（20%）',
        '实验报告质量（10%）'
      ],
      createdAt: daysAgo(20),
      updatedAt: daysAgo(3)
    }
  ];

  const classes: ClassInfo[] = [
    { id: 1, name: '物理2301班', studentCount: 32 },
    { id: 2, name: '物理2302班', studentCount: 30 },
    { id: 3, name: '化学2301班', studentCount: 28 },
    { id: 4, name: '电子2301班', studentCount: 35 }
  ];

  const students: Student[] = [
    { id: 1, name: '张明', studentNo: '202301001', classId: 1, className: '物理2301班' },
    { id: 2, name: '李华', studentNo: '202301002', classId: 1, className: '物理2301班' },
    { id: 3, name: '王芳', studentNo: '202301003', classId: 1, className: '物理2301班' },
    { id: 4, name: '刘伟', studentNo: '202301004', classId: 1, className: '物理2301班' },
    { id: 5, name: '陈静', studentNo: '202301005', classId: 1, className: '物理2301班' },
    { id: 6, name: '赵强', studentNo: '202301006', classId: 1, className: '物理2301班' },
    { id: 7, name: '孙丽', studentNo: '202301007', classId: 1, className: '物理2301班' },
    { id: 8, name: '周杰', studentNo: '202301008', classId: 1, className: '物理2301班' },
    { id: 9, name: '吴敏', studentNo: '202302001', classId: 2, className: '物理2302班' },
    { id: 10, name: '郑浩', studentNo: '202302002', classId: 2, className: '物理2302班' }
  ];

  const reports: StudentReport[] = [
    {
      id: 1,
      studentId: 1,
      studentName: '张明',
      studentNo: '202301001',
      className: '物理2301班',
      templateId: 1,
      templateName: '牛顿第二定律验证实验',
      submittedAt: daysAgo(2),
      status: 'graded',
      data: { '砝码质量': 20, '滑块质量': 200, '时间t1': 45.2, '时间t2': 32.1, '加速度': 0.89 },
      answers: { 1: '如果导轨未调平，滑块会受到重力分力作用，导致加速度测量值偏大或偏小。可以通过反复调节底脚螺丝，使滑块能在导轨上任意位置静止来消除。', 2: '理论加速度 a = F/(M+m) = (0.02×9.8)/(0.2+0.02) ≈ 0.89 m/s²', 3: '误差来源主要有：空气阻力、导轨摩擦力、计时误差等。改进措施：使用气垫导轨减小摩擦，多次测量取平均值，保证导轨水平等。' },
      grade: 92,
      feedback: '实验操作规范，数据准确，思考题回答完整。建议在误差分析部分更加详细。',
      gradedAt: daysAgo(1)
    },
    {
      id: 2,
      studentId: 2,
      studentName: '李华',
      studentNo: '202301002',
      className: '物理2301班',
      templateId: 1,
      templateName: '牛顿第二定律验证实验',
      submittedAt: daysAgo(2),
      status: 'graded',
      data: { '砝码质量': 20, '滑块质量': 200, '时间t1': 46.8, '时间t2': 33.5, '加速度': 0.85 },
      answers: { 1: '导轨未调平会有重力影响，使加速度变大。', 2: 'a = 0.02×9.8 / 0.22 = 0.89 m/s²', 3: '误差主要是计时不准，还有摩擦。' },
      grade: 78,
      feedback: '数据基本正确，但思考题回答不够详细，误差分析需要加强。',
      gradedAt: daysAgo(1)
    },
    {
      id: 3,
      studentId: 3,
      studentName: '王芳',
      studentNo: '202301003',
      className: '物理2301班',
      templateId: 1,
      templateName: '牛顿第二定律验证实验',
      submittedAt: daysAgo(1),
      status: 'ungraded',
      data: { '砝码质量': 20, '滑块质量': 200, '时间t1': 44.5, '时间t2': 31.8, '加速度': 0.91 },
      answers: { 1: '未调平会导致系统误差，因为有重力分力作用。调节底脚螺丝使滑块匀速运动即可。', 2: 'a = F/M = (0.02×9.8)/0.22 ≈ 0.891 m/s²', 3: '误差来源：1. 空气阻力 2. 导轨不完全水平 3. 计时系统误差。改进：多次测量，仔细调平。' }
    },
    {
      id: 4,
      studentId: 4,
      studentName: '刘伟',
      studentNo: '202301004',
      className: '物理2301班',
      templateId: 1,
      templateName: '牛顿第二定律验证实验',
      submittedAt: daysAgo(1),
      status: 'ungraded',
      data: { '砝码质量': 20, '滑块质量': 200, '时间t1': 47.2, '时间t2': 34.0, '加速度': 0.83 },
      answers: { 1: '会有影响，结果不准。', 2: '不会算。', 3: '不知道。' }
    },
    {
      id: 5,
      studentId: 5,
      studentName: '陈静',
      studentNo: '202301005',
      className: '物理2301班',
      templateId: 1,
      templateName: '牛顿第二定律验证实验',
      submittedAt: daysAgo(1),
      status: 'needs-revision',
      data: { '砝码质量': 20, '滑块质量': 200, '时间t1': 48.0, '时间t2': 35.0, '加速度': 0.80 },
      answers: { 1: '回答太简略。', 2: '计算错误。', 3: '回答不完整。' },
      feedback: '实验报告过于简略，请补充完整思考题回答，并重新检查数据计算。',
      gradedAt: daysAgo(0)
    },
    {
      id: 6,
      studentId: 6,
      studentName: '赵强',
      studentNo: '202301006',
      className: '物理2301班',
      templateId: 2,
      templateName: '酸碱中和滴定实验',
      submittedAt: daysAgo(5),
      status: 'graded',
      data: { 'NaOH溶液体积': 25.00, 'HCl浓度': 0.1000, 'HCl初读数': 0.00, 'HCl终读数': 22.50, 'HCl消耗体积': 22.50, 'NaOH浓度': 0.0900 },
      answers: { 1: '滴定管和移液管用待装液润洗是为了避免溶液被稀释，浓度变小。锥形瓶不需要润洗是因为溶质的量是固定的。', 2: '如果有气泡，读取的体积会比实际消耗的大，导致结果偏高。', 3: 'c(NaOH) = c(HCl)×V(HCl)/V(NaOH) = 0.1000×22.50/25.00 = 0.0900 mol/L' },
      grade: 95,
      feedback: '非常优秀！操作规范，数据准确，思考深入。',
      gradedAt: daysAgo(4)
    },
    {
      id: 7,
      studentId: 7,
      studentName: '孙丽',
      studentNo: '202301007',
      className: '物理2301班',
      templateId: 2,
      templateName: '酸碱中和滴定实验',
      submittedAt: daysAgo(4),
      status: 'graded',
      data: { 'NaOH溶液体积': 25.00, 'HCl浓度': 0.1000, 'HCl初读数': 0.10, 'HCl终读数': 23.20, 'HCl消耗体积': 23.10, 'NaOH浓度': 0.0924 },
      answers: { 1: '防止浓度变稀。', 2: '结果偏大。', 3: '0.1×23.1/25=0.0924' },
      grade: 82,
      feedback: '数据正确，但思考题回答过于简略，需要详细说明。',
      gradedAt: daysAgo(3)
    },
    {
      id: 8,
      studentId: 9,
      studentName: '吴敏',
      studentNo: '202302001',
      className: '物理2302班',
      templateId: 3,
      templateName: '惠斯通电桥测电阻',
      submittedAt: daysAgo(7),
      status: 'graded',
      data: { '电阻编号': 'R1', '比率K': 10, '比较臂Rs': 345.6, '测量值Rx1': 3456, '交换测量Rx2': 3458, '平均值Rx': 3457 },
      answers: { 1: '平衡条件是对臂电阻乘积相等。影响灵敏度的因素有：电源电压、检流计灵敏度、桥臂电阻大小等。', 2: '交换测量法可以消除比率臂电阻不准确带来的系统误差，提高测量准确度。', 3: 'Rx = K×Rs = 10×345.6 = 3456Ω' },
      grade: 90,
      feedback: '实验完成良好，测量方法正确，数据处理规范。',
      gradedAt: daysAgo(6)
    },
    {
      id: 9,
      studentId: 10,
      studentName: '郑浩',
      studentNo: '202302002',
      className: '物理2302班',
      templateId: 3,
      templateName: '惠斯通电桥测电阻',
      submittedAt: daysAgo(3),
      status: 'ungraded',
      data: { '电阻编号': 'R2', '比率K': 1, '比较臂Rs': 567.8, '测量值Rx1': 568, '交换测量Rx2': 570, '平均值Rx': 569 },
      answers: { 1: '平衡时检流计为零。', 2: '消除误差。', 3: '567.8Ω' }
    }
  ];

  const comments: CommentTemplate[] = [
    { id: 1, category: '数据质量', content: '实验数据测量准确，记录规范。' },
    { id: 2, category: '数据质量', content: '数据存在较大误差，请检查测量方法和读数是否正确。' },
    { id: 3, category: '数据质量', content: '部分数据缺失，请补充完整。' },
    { id: 4, category: '操作规范', content: '实验操作规范，仪器使用正确。' },
    { id: 5, category: '操作规范', content: '操作过程中存在不规范之处，建议加强练习。' },
    { id: 6, category: '思考题', content: '思考题回答完整，分析深入。' },
    { id: 7, category: '思考题', content: '思考题回答过于简略，请详细展开说明。' },
    { id: 8, category: '思考题', content: '部分思考题回答有误，请重新思考。' },
    { id: 9, category: '报告质量', content: '实验报告结构完整，书写工整。' },
    { id: 10, category: '报告质量', content: '报告格式不规范，请按照要求整理。' },
    { id: 11, category: '误差分析', content: '误差分析全面，改进建议合理。' },
    { id: 12, category: '误差分析', content: '缺乏对误差来源的深入分析。' },
    { id: 13, category: '整体评价', content: '优秀！实验完成质量很高，继续保持。' },
    { id: 14, category: '整体评价', content: '良好，但仍有改进空间。' },
    { id: 15, category: '整体评价', content: '需要重新提交，请认真修改。' }
  ];

  const resources: Resource[] = [
    {
      id: 1,
      type: 'literature',
      title: '大学物理实验教程（第三版）',
      description: '包含所有基础物理实验的原理、方法和数据处理，实验教学的主要参考教材。',
      url: 'https://example.com/physics-lab-book'
    },
    {
      id: 2,
      type: 'literature',
      title: '误差理论与数据处理',
      description: '详细介绍实验误差的来源、分类和处理方法，是实验数据分析的重要参考。',
      url: 'https://example.com/error-theory'
    },
    {
      id: 3,
      type: 'literature',
      title: '基础化学实验操作规范',
      description: '化学实验基本操作的标准化指导，包括滴定、称量、加热等操作规范。',
      url: 'https://example.com/chemistry-lab-guide'
    },
    {
      id: 4,
      type: 'equipment',
      title: '气垫导轨（型号：QDG-1）',
      description: '用于力学实验，提供近乎无摩擦的运动环境，配合光电门使用。',
      status: '正常',
      lastMaintenance: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 15))
    },
    {
      id: 5,
      type: 'equipment',
      title: '光电门计时器（型号：J0201）',
      description: '高精度计时仪器，测量范围0.01ms-99.99s，精度±0.01ms。',
      status: '正常',
      lastMaintenance: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10))
    },
    {
      id: 6,
      type: 'equipment',
      title: '分析天平（型号：FA2004）',
      description: '万分之一电子分析天平，最大称量200g，分度值0.1mg。',
      status: '维护中',
      lastMaintenance: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 45))
    },
    {
      id: 7,
      type: 'equipment',
      title: '直流稳压电源（型号：WYJ-30V5A）',
      description: '可调直流稳压电源，输出0-30V，0-5A，具有过流保护功能。',
      status: '正常',
      lastMaintenance: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20))
    },
    {
      id: 8,
      type: 'video',
      title: '气垫导轨调平操作示范',
      description: '详细演示如何正确调节气垫导轨的水平度，包括静态调平和动态调平两种方法。',
      url: 'https://example.com/video/air-track-leveling'
    },
    {
      id: 9,
      type: 'video',
      title: '滴定管的正确使用方法',
      description: '从洗涤、润洗、装液、排气泡到读数和滴定操作的完整示范。',
      url: 'https://example.com/video/burette-tutorial'
    },
    {
      id: 10,
      type: 'video',
      title: '惠斯通电桥电路连接演示',
      description: '逐步演示惠斯通电桥的电路连接方法和注意事项。',
      url: 'https://example.com/video/wheatstone-bridge'
    }
  ];

  const archives: Archive[] = [
    {
      id: 1,
      semester: '秋季学期',
      year: 2024,
      courseName: '大学物理实验',
      summary: '本学期共开设8个实验项目，覆盖力学、热学、电磁学、光学四大板块。共有4个教学班125名学生修读。实验报告优秀率15%，良好率60%，及格率23%，不及格率2%。',
      updateRecords: [
        { date: '2024-09-01', content: '新增"牛顿第二定律验证实验"项目', operator: '王老师' },
        { date: '2024-10-15', content: '更新"刚体转动惯量测定"实验数据表格', operator: '李老师' },
        { date: '2024-11-20', content: '补充"霍尔效应"实验的安全注意事项', operator: '张老师' },
        { date: '2025-01-10', content: '学期总结归档', operator: '王老师' }
      ]
    },
    {
      id: 2,
      semester: '春季学期',
      year: 2025,
      courseName: '大学物理实验',
      summary: '本学期开设6个实验项目，重点是电磁学和光学实验。共有3个教学班95名学生修读。学生动手能力普遍提升，实验报告质量较上学期有所提高。',
      updateRecords: [
        { date: '2025-03-01', content: '新增"示波器的使用"实验项目', operator: '李老师' },
        { date: '2025-04-20', content: '更新实验考核评分标准', operator: '王老师' },
        { date: '2025-06-25', content: '学期总结归档', operator: '王老师' }
      ]
    },
    {
      id: 3,
      semester: '秋季学期',
      year: 2025,
      courseName: '基础化学实验',
      summary: '本学期开设10个化学实验项目，包括基础操作、物质制备、定量分析等内容。共有2个教学班58名学生修读。实验安全零事故。',
      updateRecords: [
        { date: '2025-09-05', content: '新增"酸碱中和滴定"实验项目', operator: '陈老师' },
        { date: '2025-10-10', content: '更新化学实验安全操作规程', operator: '陈老师' },
        { date: '2025-12-15', content: '学期总结归档', operator: '陈老师' }
      ]
    }
  ];

  const schedules: Schedule[] = [
    {
      id: 1,
      date: formatDate(today),
      timeSlot: '08:00-10:30',
      labName: '物理实验室A-301',
      courseName: '大学物理实验',
      className: '物理2301班'
    },
    {
      id: 2,
      date: formatDate(today),
      timeSlot: '14:00-16:30',
      labName: '物理实验室A-301',
      courseName: '大学物理实验',
      className: '物理2302班'
    },
    {
      id: 3,
      date: formatDate(today),
      timeSlot: '14:00-16:30',
      labName: '化学实验室B-205',
      courseName: '基础化学实验',
      className: '化学2301班'
    },
    {
      id: 4,
      date: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)),
      timeSlot: '08:00-10:30',
      labName: '物理实验室A-302',
      courseName: '电路分析实验',
      className: '电子2301班'
    },
    {
      id: 5,
      date: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)),
      timeSlot: '10:45-13:15',
      labName: '物理实验室A-301',
      courseName: '大学物理实验',
      className: '物理2301班'
    },
    {
      id: 6,
      date: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
      timeSlot: '14:00-16:30',
      labName: '物理实验室A-301',
      courseName: '大学物理实验',
      className: '物理2302班'
    },
    {
      id: 7,
      date: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)),
      timeSlot: '08:00-10:30',
      labName: '化学实验室B-205',
      courseName: '基础化学实验',
      className: '化学2301班'
    },
    {
      id: 8,
      date: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4)),
      timeSlot: '08:00-10:30',
      labName: '物理实验室A-302',
      courseName: '电路分析实验',
      className: '电子2301班'
    }
  ];

  setCollection('templates', templates);
  setCollection('classes', classes);
  setCollection('students', students);
  setCollection('reports', reports);
  setCollection('comments', comments);
  setCollection('resources', resources);
  setCollection('archives', archives);
  setCollection('schedules', schedules);
}
