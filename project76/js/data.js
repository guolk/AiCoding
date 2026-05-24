const whoStandards = {
    boy: {
        height: {
            months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24, 30, 36, 42, 48, 54, 60],
            p3: [46.1, 50.8, 54.4, 57.3, 59.7, 61.7, 63.3, 64.8, 66.0, 67.1, 68.1, 69.0, 69.8, 71.9, 73.6, 76.9, 80.2, 83.4, 86.4, 89.3, 91.9, 94.6],
            p50: [49.9, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6, 69.2, 70.6, 71.8, 72.9, 74.0, 74.9, 77.2, 79.5, 83.3, 87.0, 90.5, 93.8, 97.1, 100.2, 103.3],
            p97: [53.7, 58.6, 62.4, 65.5, 68.0, 70.1, 71.9, 73.5, 75.0, 76.3, 77.5, 78.7, 79.7, 82.5, 85.3, 89.6, 93.9, 97.7, 101.3, 104.8, 108.2, 111.6]
        },
        weight: {
            months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24, 30, 36, 42, 48, 54, 60],
            p3: [2.5, 3.4, 4.4, 5.1, 5.6, 6.1, 6.4, 6.7, 7.0, 7.3, 7.5, 7.7, 7.9, 8.3, 8.6, 9.2, 9.8, 10.4, 11.0, 11.6, 12.2, 12.8],
            p50: [3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6, 10.1, 10.5, 11.3, 12.1, 12.9, 13.7, 14.5, 15.3, 16.1],
            p97: [4.3, 5.8, 7.1, 8.0, 8.7, 9.3, 9.8, 10.3, 10.7, 11.1, 11.4, 11.7, 12.0, 12.7, 13.3, 14.5, 15.7, 16.9, 18.1, 19.3, 20.5, 21.7]
        },
        head: {
            months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24, 30, 36, 42, 48, 54, 60],
            p3: [32.1, 35.1, 36.8, 38.1, 39.2, 40.1, 40.9, 41.5, 42.0, 42.5, 42.9, 43.3, 43.6, 44.2, 44.7, 45.4, 45.9, 46.4, 46.8, 47.2, 47.5, 47.8],
            p50: [34.5, 37.3, 39.1, 40.5, 41.6, 42.5, 43.2, 43.8, 44.3, 44.7, 45.1, 45.4, 45.7, 46.3, 46.8, 47.5, 48.1, 48.6, 49.0, 49.4, 49.7, 50.0],
            p97: [36.9, 39.5, 41.3, 42.7, 43.8, 44.7, 45.4, 46.0, 46.5, 46.9, 47.3, 47.6, 47.8, 48.4, 48.9, 49.6, 50.2, 50.7, 51.1, 51.5, 51.8, 52.1]
        }
    },
    girl: {
        height: {
            months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24, 30, 36, 42, 48, 54, 60],
            p3: [45.4, 49.8, 53.0, 55.6, 57.8, 59.6, 61.2, 62.6, 63.8, 64.9, 65.9, 66.8, 67.6, 69.8, 71.7, 75.0, 78.3, 81.6, 84.7, 87.7, 90.5, 93.5],
            p50: [49.1, 53.7, 57.1, 59.8, 62.1, 64.0, 65.7, 67.1, 68.4, 69.6, 70.7, 71.7, 72.6, 75.0, 77.3, 81.5, 85.5, 89.4, 93.0, 96.5, 99.9, 103.2],
            p97: [52.9, 57.6, 61.1, 64.0, 66.4, 68.5, 70.3, 71.9, 73.3, 74.6, 75.8, 76.9, 77.9, 80.3, 82.9, 87.4, 91.8, 96.0, 99.9, 103.7, 107.2, 110.7]
        },
        weight: {
            months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24, 30, 36, 42, 48, 54, 60],
            p3: [2.4, 3.2, 4.0, 4.7, 5.2, 5.6, 6.0, 6.3, 6.6, 6.9, 7.1, 7.3, 7.5, 7.9, 8.2, 8.8, 9.4, 10.0, 10.6, 11.2, 11.8, 12.4],
            p50: [3.2, 4.2, 5.1, 5.8, 6.4, 6.9, 7.3, 7.7, 8.0, 8.3, 8.6, 8.8, 9.0, 9.5, 10.0, 10.8, 11.6, 12.4, 13.2, 14.0, 14.8, 15.7],
            p97: [4.2, 5.4, 6.5, 7.4, 8.1, 8.7, 9.2, 9.7, 10.1, 10.5, 10.8, 11.2, 11.5, 12.2, 12.9, 14.1, 15.4, 16.7, 18.0, 19.3, 20.6, 21.9]
        },
        head: {
            months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24, 30, 36, 42, 48, 54, 60],
            p3: [31.7, 34.3, 36.0, 37.2, 38.2, 39.0, 39.7, 40.3, 40.8, 41.2, 41.6, 42.0, 42.3, 42.9, 43.4, 44.1, 44.6, 45.1, 45.5, 45.9, 46.2, 46.5],
            p50: [33.9, 36.5, 38.3, 39.5, 40.6, 41.4, 42.1, 42.7, 43.2, 43.6, 44.0, 44.3, 44.6, 45.2, 45.7, 46.4, 46.9, 47.4, 47.8, 48.2, 48.5, 48.8],
            p97: [36.1, 38.7, 40.5, 41.7, 42.8, 43.6, 44.3, 44.9, 45.4, 45.8, 46.2, 46.5, 46.8, 47.4, 47.9, 48.6, 49.1, 49.6, 50.0, 50.3, 50.7, 51.0]
        }
    }
};

const defaultChild = {
    id: 0,
    name: '小明',
    gender: 'boy',
    birthday: '2023-05-15',
    birthWeight: 3.5,
    birthHeight: 50,
    birthHead: 34,
    bloodType: 'A型',
    allergy: '青霉素',
    avatar: '👦',
    growthData: [
        { date: '2023-05-15', height: 50, weight: 3.5, head: 34 },
        { date: '2023-06-15', height: 55, weight: 4.5, head: 37 },
        { date: '2023-08-15', height: 62, weight: 6.8, head: 41 },
        { date: '2023-11-15', height: 68, weight: 8.2, head: 44 },
        { date: '2024-02-15', height: 72, weight: 9.1, head: 45.5 },
        { date: '2024-05-15', height: 76, weight: 10.2, head: 46.8 },
        { date: '2024-11-15', height: 82, weight: 11.5, head: 48 },
        { date: '2025-05-15', height: 88, weight: 12.8, head: 49 },
        { date: '2025-11-15', height: 93, weight: 14.2, head: 49.5 },
        { date: '2026-05-15', height: 98, weight: 15.5, head: 50 }
    ],
    milestones: [
        { id: 1, icon: '👶', title: '出生', date: '2023-05-15', description: '体重3.5kg，身高50cm，健康可爱的小天使来到了我们身边！' },
        { id: 2, icon: '😊', title: '第一次微笑', date: '2023-07-20', description: '看到妈妈时露出了人生第一个微笑，心都化了~' },
        { id: 3, icon: '🗣️', title: '第一次说话', date: '2024-03-10', description: '清晰地叫出了"妈妈"，妈妈激动得热泪盈眶！' },
        { id: 4, icon: '🦶', title: '迈出第一步', date: '2024-06-25', description: '松开妈妈的手，独立走了3步，真棒！' },
        { id: 5, icon: '🦷', title: '第一颗牙', date: '2023-12-15', description: '下门牙冒出了小白点，终于要开始长牙啦！' },
        { id: 6, icon: '🍚', title: '第一次自己吃饭', date: '2024-08-10', description: '用勺子自己吃完了一整碗饭，虽然洒了一半~' },
        { id: 7, icon: '🚽', title: '学会自己上厕所', date: '2025-03-20', description: '告别纸尿裤，是大孩子啦！' },
        { id: 8, icon: '🎒', title: '第一天去幼儿园', date: '2025-09-01', description: '背着小书包，开心地去上幼儿园，没有哭哦！' }
    ],
    photos: [
        { id: 1, url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20newborn%20baby%20sleeping%20peacefully%20in%20soft%20blanket&image_size=square', caption: '刚出生的小天使', date: '2023-05-15' },
        { id: 2, url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=happy%203%20month%20old%20baby%20smiling&image_size=square', caption: '百日照', date: '2023-08-15' },
        { id: 3, url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=baby%20sitting%20up%20playing%20with%20toys&image_size=square', caption: '第一次坐起来', date: '2023-11-15' },
        { id: 4, url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=toddler%20first%20birthday%20cake%20smash&image_size=square', caption: '一周岁生日', date: '2024-05-15' },
        { id: 5, url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=toddler%20walking%20in%20park&image_size=square', caption: '在公园学走路', date: '2024-07-20' },
        { id: 6, url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=child%20playing%20with%20building%20blocks&image_size=square', caption: '搭积木', date: '2024-10-15' },
        { id: 7, url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=child%20in%20kindergarten%20uniform&image_size=square', caption: '幼儿园第一天', date: '2025-09-01' },
        { id: 8, url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=child%20blowing%20birthday%20candles%20age%203&image_size=square', caption: '三周岁生日', date: '2026-05-15' }
    ],
    scores: [
        { id: 1, date: '2025-10-15', subject: '语文', type: '单元测试', score: 92, rank: 5 },
        { id: 2, date: '2025-10-15', subject: '数学', type: '单元测试', score: 95, rank: 3 },
        { id: 3, date: '2025-10-15', subject: '英语', type: '单元测试', score: 88, rank: 8 },
        { id: 4, date: '2025-11-20', subject: '语文', type: '期中考试', score: 94, rank: 4 },
        { id: 5, date: '2025-11-20', subject: '数学', type: '期中考试', score: 98, rank: 2 },
        { id: 6, date: '2025-11-20', subject: '英语', type: '期中考试', score: 91, rank: 6 },
        { id: 7, date: '2026-01-15', subject: '语文', type: '期末考试', score: 96, rank: 3 },
        { id: 8, date: '2026-01-15', subject: '数学', type: '期末考试', score: 97, rank: 2 },
        { id: 9, date: '2026-01-15', subject: '英语', type: '期末考试', score: 93, rank: 5 },
        { id: 10, date: '2026-04-20', subject: '语文', type: '单元测试', score: 95, rank: 3 },
        { id: 11, date: '2026-04-20', subject: '数学', type: '单元测试', score: 99, rank: 1 },
        { id: 12, date: '2026-04-20', subject: '科学', type: '单元测试', score: 90, rank: 7 }
    ],
    activities: [
        { id: 1, type: '兴趣班', name: '绘画班', hours: 48, progress: 80, startDate: '2025-09-01', note: '每周六上午，孩子很喜欢画画' },
        { id: 2, type: '运动', name: '游泳', hours: 36, progress: 60, startDate: '2025-10-01', note: '每周日下午，已经学会蛙泳了' },
        { id: 3, type: '阅读', name: '亲子阅读', hours: 120, progress: 100, startDate: '2023-06-01', note: '每天睡前阅读30分钟' },
        { id: 4, type: '兴趣班', name: '钢琴', hours: 24, progress: 40, startDate: '2026-01-01', note: '每周两次，正在学习识谱' },
        { id: 5, type: '运动', name: '足球', hours: 18, progress: 30, startDate: '2026-03-01', note: '每周六下午，锻炼身体' }
    ],
    books: [
        { id: 1, title: '猜猜我有多爱你', author: '山姆·麦克布雷尼', status: '已读', rating: 5, pages: 32, review: '非常温馨的绘本，孩子百听不厌' },
        { id: 2, title: '好饿的毛毛虫', author: '艾瑞·卡尔', status: '已读', rating: 5, pages: 22, review: '经典洞洞书，设计精巧' },
        { id: 3, title: '我爸爸', author: '安东尼·布朗', status: '已读', rating: 5, pages: 32, review: '孩子心目中的超级爸爸' },
        { id: 4, title: '我妈妈', author: '安东尼·布朗', status: '已读', rating: 5, pages: 32, review: '妈妈是全世界最好的' },
        { id: 5, title: '爷爷一定有办法', author: '菲比·吉尔曼', status: '已读', rating: 4, pages: 32, review: '充满智慧的故事' },
        { id: 6, title: '活了一百万次的猫', author: '佐野洋子', status: '正在读', rating: 5, pages: 40, review: '关于生命和爱的深刻故事' },
        { id: 7, title: '夏洛的网', author: 'E.B.怀特', status: '想读', rating: 0, pages: 176, review: '' },
        { id: 8, title: '小王子', author: '安托万·德·圣-埃克苏佩里', status: '想读', rating: 0, pages: 97, review: '' }
    ],
    resources: [
        { id: 1, type: '书籍', title: '小猪佩奇系列', age: '3-6', subject: '语言', url: '', icon: '📚', description: '风靡全球的幼儿启蒙读物' },
        { id: 2, type: 'APP', title: '洪恩识字', age: '3-6', subject: '语言', url: '', icon: '📱', description: '游戏化识字，孩子爱学' },
        { id: 3, type: '视频', title: '小小优趣', age: '0-6', subject: '英语', url: '', icon: '🎬', description: '原版英文动画，磨耳朵神器' },
        { id: 4, type: 'APP', title: '小猿口算', age: '6-9', subject: '数学', url: '', icon: '🧮', description: '口算练习，自动批改' },
        { id: 5, type: '书籍', title: '神奇校车', age: '6-9', subject: '科学', url: '', icon: '🚍', description: '有趣的科普绘本' },
        { id: 6, type: '网站', title: '可汗学院', age: '6-12', subject: '数学', url: '', icon: '🌐', description: '免费优质的教育资源' },
        { id: 7, type: '视频', title: 'B站李永乐老师', age: '9-12', subject: '科学', url: '', icon: '▶️', description: '通俗易懂的科普视频' },
        { id: 8, type: 'APP', title: '英语趣配音', age: '6-12', subject: '英语', url: '', icon: '🎤', description: '配音学习英语，趣味十足' }
    ],
    trials: [
        { id: 1, title: 'ABCmouse英语', date: '2026-03-10', rating: 4, feedback: '游戏化设计不错，但内容有点简单，适合零基础' },
        { id: 2, title: '斑马AI课', date: '2026-04-01', rating: 5, feedback: '系统性强，孩子进步明显，已经报名正式课程' },
        { id: 3, title: '叫叫阅读', date: '2026-04-20', rating: 3, feedback: '内容挺好，但孩子兴趣不大，再观察一段时间' }
    ],
    parentActivities: [
        { id: 1, title: 'DIY彩虹火山实验', date: '2026-05-20', status: 'completed', type: '科学实验', tags: ['科学', '化学'], description: '用小苏打和醋做火山喷发实验', photo: '🧪' },
        { id: 2, title: '制作父亲节贺卡', date: '2026-06-15', status: 'planned', type: '手工制作', tags: ['手工', '节日'], description: '和孩子一起做父亲节礼物', photo: '💌' },
        { id: 3, title: '植物园探索', date: '2026-05-25', status: 'planned', type: '户外探索', tags: ['户外', '自然'], description: '去植物园认识各种植物', photo: '🌿' },
        { id: 4, title: '烘焙小饼干', date: '2026-05-10', status: 'completed', type: '手工制作', tags: ['烘焙', '美食'], description: '一起做动物形状的小饼干', photo: '🍪' },
        { id: 5, title: '夜观星空', date: '2026-06-01', status: 'planned', type: '户外探索', tags: ['天文', '户外'], description: '去郊外看星星，认识星座', photo: '🌟' }
    ],
    works: [
        { id: 1, title: '我的第一幅涂鸦', date: '2024-08-15', type: '绘画', photo: '🎨', description: '用蜡笔画的抽象派大作' },
        { id: 2, title: '母亲节手工花', date: '2025-05-10', type: '手工', photo: '💐', description: '送给妈妈的母亲节礼物' },
        { id: 3, title: '橡皮泥小动物', date: '2025-09-20', type: '手工', photo: '🐰', description: '用橡皮泥捏的小兔子' },
        { id: 4, title: '幼儿园手工作业', date: '2025-11-15', type: '手工', photo: '🏠', description: '用纸箱做的小房子' },
        { id: 5, title: '春天的树', date: '2026-03-20', type: '绘画', photo: '🌳', description: '画的春天的大树' },
        { id: 6, title: '我的小怪兽', date: '2026-04-10', type: '绘画', photo: '👾', description: '想象中的可爱小怪兽' }
    ],
    dialogs: [
        { id: 1, date: '2026-03-15', question: '妈妈，为什么天是蓝色的？', answer: '因为太阳光中有七种颜色，蓝色光最容易被空气散射，所以我们看到的天空就是蓝色的啦~' },
        { id: 2, date: '2026-04-02', question: '爸爸，我是从哪里来的？', answer: '你是爸爸妈妈爱情的结晶，在妈妈肚子里住了10个月，然后就出生啦！' },
        { id: 3, date: '2026-04-20', question: '妈妈，为什么月亮会跟着我们走？', answer: '因为月亮离我们很远很远，我们走的距离相对于月亮来说太小了，所以看起来月亮一直在跟着我们~' },
        { id: 4, date: '2026-05-05', question: '爸爸，恐龙为什么灭绝了？', answer: '科学家说是因为小行星撞击地球，环境发生了很大变化，恐龙适应不了就灭绝了。不过它们的后代鸟类还在哦！' },
        { id: 5, date: '2026-05-18', question: '妈妈，我什么时候能长大？', answer: '你现在每天都在长大呀！等你能自己照顾自己，能为别人着想的时候，就是真正的长大了~' }
    ],
    vaccines: [
        { id: 1, name: '乙肝疫苗第一针', date: '2023-05-15', status: 'completed', location: '市妇幼保健院' },
        { id: 2, name: '卡介苗', date: '2023-05-18', status: 'completed', location: '市妇幼保健院' },
        { id: 3, name: '乙肝疫苗第二针', date: '2023-06-15', status: 'completed', location: '社区卫生服务中心' },
        { id: 4, name: '脊灰疫苗第一针', date: '2023-08-15', status: 'completed', location: '社区卫生服务中心' },
        { id: 5, name: '百白破第一针', date: '2023-08-15', status: 'completed', location: '社区卫生服务中心' },
        { id: 6, name: '麻腮风疫苗', date: '2024-05-15', status: 'completed', location: '社区卫生服务中心' },
        { id: 7, name: '甲肝疫苗', date: '2024-11-15', status: 'completed', location: '社区卫生服务中心' },
        { id: 8, name: '水痘疫苗', date: '2025-05-15', status: 'completed', location: '社区卫生服务中心' },
        { id: 9, name: '流感疫苗', date: '2026-09-15', status: 'upcoming', location: '社区卫生服务中心' },
        { id: 10, name: '肺炎疫苗', date: '2026-11-15', status: 'upcoming', location: '社区卫生服务中心' }
    ],
    medicalRecords: [
        { id: 1, illness: '感冒发热', date: '2024-01-10', symptoms: '发热38.5°C，流鼻涕，咳嗽', diagnosis: '上呼吸道感染', medication: '小儿氨酚黄那敏颗粒', doctor: '张医生', hospital: '市妇幼保健院' },
        { id: 2, illness: '腹泻', date: '2024-03-20', symptoms: '拉肚子，一天5次，精神尚可', diagnosis: '消化不良', medication: '蒙脱石散，益生菌', doctor: '李医生', hospital: '社区卫生服务中心' },
        { id: 3, illness: '手足口病', date: '2024-06-15', symptoms: '发热，口腔疱疹，手足皮疹', diagnosis: '手足口病', medication: '抗病毒口服液，开喉剑', doctor: '王医生', hospital: '市妇幼保健院' },
        { id: 4, illness: '过敏性鼻炎', date: '2025-04-10', symptoms: '打喷嚏，流鼻涕，眼睛痒', diagnosis: '季节性过敏性鼻炎', medication: '氯雷他定，生理盐水洗鼻', doctor: '陈医生', hospital: '市人民医院' },
        { id: 5, illness: '急性支气管炎', date: '2025-12-05', symptoms: '咳嗽，有痰，夜间加重', diagnosis: '急性支气管炎', medication: '氨溴索，雾化治疗', doctor: '刘医生', hospital: '市妇幼保健院' }
    ]
};

let appData = {
    currentChildId: 0,
    children: [defaultChild]
};

function loadData() {
    const saved = localStorage.getItem('growthTrackerData');
    if (saved) {
        try {
            appData = JSON.parse(saved);
        } catch (e) {
            console.log('数据加载失败，使用默认数据');
        }
    }
    updateChildSelector();
}

function saveData() {
    localStorage.setItem('growthTrackerData', JSON.stringify(appData));
}

function getCurrentChild() {
    return appData.children.find(c => c.id === appData.currentChildId);
}

function updateChildSelector() {
    const selector = document.getElementById('childSelector');
    selector.innerHTML = appData.children.map(child => 
        `<option value="${child.id}">${child.name} - ${calculateAge(child.birthday)}</option>`
    ).join('');
    selector.value = appData.currentChildId;
}
