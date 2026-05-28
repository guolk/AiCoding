import { AppData } from '../types';

export const mockData: AppData = {
  members: [
    {
      id: '1',
      name: '王德明',
      birthDate: '1930-05-15',
      deathDate: '2010-12-03',
      birthPlace: '山东省济南市',
      occupation: '教师',
      children: ['2', '3'],
      spouse: '4',
      notes: '一生致力于教育事业'
    },
    {
      id: '2',
      name: '王建国',
      birthDate: '1955-08-22',
      birthPlace: '山东省济南市',
      occupation: '工程师',
      children: ['5'],
      parent: '1',
      spouse: '6'
    },
    {
      id: '3',
      name: '王建华',
      birthDate: '1958-03-10',
      birthPlace: '山东省济南市',
      occupation: '医生',
      children: ['7'],
      parent: '1',
      spouse: '8'
    },
    {
      id: '4',
      name: '李秀英',
      birthDate: '1932-11-08',
      deathDate: '2015-09-20',
      birthPlace: '山东省青岛市',
      occupation: '家庭主妇',
      spouse: '1'
    },
    {
      id: '5',
      name: '王晓明',
      birthDate: '1982-07-05',
      birthPlace: '北京市',
      occupation: '软件工程师',
      children: [],
      parent: '2'
    },
    {
      id: '6',
      name: '张美玲',
      birthDate: '1957-12-15',
      birthPlace: '天津市',
      occupation: '会计',
      spouse: '2'
    },
    {
      id: '7',
      name: '王小雨',
      birthDate: '1985-04-25',
      birthPlace: '上海市',
      occupation: '设计师',
      children: [],
      parent: '3'
    },
    {
      id: '8',
      name: '刘建国',
      birthDate: '1959-06-30',
      birthPlace: '河北省石家庄市',
      occupation: '公务员',
      spouse: '3'
    }
  ],
  events: [
    {
      id: 'e1',
      title: '家族迁居北京',
      date: '1970-05-01',
      type: 'migration',
      description: '王德明带领全家从济南迁居北京',
      location: '北京市'
    },
    {
      id: 'e2',
      title: '王建国获得科技进步奖',
      date: '1995-10-20',
      type: 'achievement',
      description: '王建国因在工程领域的突出贡献获得国家科技进步奖',
      location: '北京市'
    },
    {
      id: 'e3',
      title: '抗日战争期间',
      date: '1937-07-07',
      type: 'historical',
      description: '家族经历了抗日战争时期的艰难岁月',
      location: '山东省'
    }
  ],
  oralHistories: [
    {
      id: 'o1',
      title: '爷爷讲述的家族故事',
      narrator: '王德明',
      content: '我们的家族祖籍在山东，祖辈们都是勤劳善良的农民。我的父亲常常教育我们要诚信待人、勤奋做事...',
      dateRecorded: '2005-03-15'
    },
    {
      id: 'o2',
      title: '奶奶回忆往事',
      narrator: '李秀英',
      content: '年轻时的日子虽然艰苦，但我们一家人团结一心，互相扶持。那些岁月虽然苦，但也充满了温暖...',
      dateRecorded: '2008-06-22'
    }
  ],
  photos: [
    {
      id: 'p1',
      title: '1975年全家福',
      imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop',
      date: '1975-08-15',
      location: '北京市',
      people: ['1', '2', '3', '4']
    },
    {
      id: 'p2',
      title: '王建国结婚照',
      imageUrl: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&h=300&fit=crop',
      date: '1980-10-01',
      location: '北京市',
      people: ['2', '6']
    }
  ],
  biographies: [
    {
      id: 'b1',
      memberId: '1',
      title: '王德明传',
      content: '王德明先生生于1930年，山东省济南市人。他一生致力于教育事业，在三尺讲台上耕耘了四十多个春秋。他不仅教授知识，更注重品德教育，培养了无数优秀人才...'
    },
    {
      id: 'b2',
      memberId: '2',
      title: '王建国的奋斗之路',
      content: '王建国，1955年生，从小就展现出对工程技术的浓厚兴趣。通过不懈努力，他在自己的领域取得了卓越成就，获得了国家科技进步奖...'
    }
  ],
  familyTraits: [
    {
      id: 'ft1',
      type: 'motto',
      title: '家训',
      content: '勤为本，德为先，和为贵，学在前'
    },
    {
      id: 'ft2',
      type: 'value',
      title: '核心价值观',
      content: '诚实守信、尊老爱幼、勤奋好学、团结互助'
    },
    {
      id: 'ft3',
      type: 'custom',
      title: '传统习俗',
      content: '每年春节家族团聚，清明共同祭祖'
    }
  ],
  themeStories: [
    {
      id: 'ts1',
      theme: 'struggle',
      title: '艰苦创业的岁月',
      content: '改革开放初期，家族成员在各自的岗位上努力奋斗。王建国在工程领域刻苦钻研，王建华在医疗事业中救死扶伤...'
    },
    {
      id: 'ts2',
      theme: 'migration',
      title: '迁徙的足迹',
      content: '从山东到北京，再到全国各地，家族的足迹见证了时代的变迁。每一次迁徙都伴随着奋斗与希望...'
    },
    {
      id: 'ts3',
      theme: 'war',
      title: '战争年代的记忆',
      content: '抗日战争时期，家族先辈们经历了战火的洗礼。他们在艰难困苦中保持着民族气节，传承着爱国精神...'
    }
  ],
  researchNotes: [
    {
      id: 'r1',
      infoId: '1',
      sourceType: 'elder',
      source: '王德明口述',
      confirmed: true
    },
    {
      id: 'r2',
      infoId: 'e1',
      sourceType: 'document',
      source: '家谱记载',
      confirmed: true,
      historicalSource: '王氏宗谱'
    },
    {
      id: 'r3',
      infoId: '2',
      sourceType: 'elder',
      source: '王建华口述',
      confirmed: false
    }
  ]
};
