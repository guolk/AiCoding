import {
  Member,
  Rehearsal,
  Song,
  RehearsalRecord,
  Performance,
  Equipment,
  BorrowRecord,
} from '../types';
import { generateId } from './storage';

const dayjs = (date?: string | Date) => {
  const d = date ? new Date(date) : new Date();
  return {
    format: (fmt: string) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      const seconds = pad(d.getSeconds());
      return fmt
        .replace('YYYY', year.toString())
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    },
    add: (n: number, unit: string) => {
      const nd = new Date(d);
      if (unit === 'day') nd.setDate(nd.getDate() + n);
      if (unit === 'hour') nd.setHours(nd.getHours() + n);
      if (unit === 'minute') nd.setMinutes(nd.getMinutes() + n);
      return dayjs(nd);
    },
    toDate: () => d,
    isBefore: (other: { toDate: () => Date }) => d < other.toDate(),
    isAfter: (other: { toDate: () => Date }) => d > other.toDate(),
  };
};

export const mockMembers: Member[] = [
  {
    id: generateId(),
    name: '张伟',
    instrument: '主唱',
    phone: '13800138001',
    email: 'zhangwei@band.com',
    joinDate: '2023-01-15',
    status: 'active',
    availableTimes: [
      { dayOfWeek: 5, startTime: '19:00', endTime: '22:00' },
      { dayOfWeek: 6, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 0, startTime: '14:00', endTime: '18:00' },
    ],
  },
  {
    id: generateId(),
    name: '李明',
    instrument: '吉他',
    phone: '13800138002',
    email: 'liming@band.com',
    joinDate: '2023-01-15',
    status: 'active',
    availableTimes: [
      { dayOfWeek: 2, startTime: '20:00', endTime: '22:00' },
      { dayOfWeek: 4, startTime: '20:00', endTime: '22:00' },
      { dayOfWeek: 6, startTime: '14:00', endTime: '18:00' },
    ],
  },
  {
    id: generateId(),
    name: '王芳',
    instrument: '贝斯',
    phone: '13800138003',
    email: 'wangfang@band.com',
    joinDate: '2023-02-20',
    status: 'active',
    availableTimes: [
      { dayOfWeek: 5, startTime: '19:00', endTime: '22:00' },
      { dayOfWeek: 6, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 0, startTime: '10:00', endTime: '14:00' },
    ],
  },
  {
    id: generateId(),
    name: '赵强',
    instrument: '鼓',
    phone: '13800138004',
    email: 'zhaoqiang@band.com',
    joinDate: '2023-03-10',
    status: 'active',
    availableTimes: [
      { dayOfWeek: 1, startTime: '19:00', endTime: '22:00' },
      { dayOfWeek: 3, startTime: '19:00', endTime: '22:00' },
      { dayOfWeek: 6, startTime: '14:00', endTime: '18:00' },
    ],
  },
  {
    id: generateId(),
    name: '陈静',
    instrument: '键盘',
    phone: '13800138005',
    email: 'chenjing@band.com',
    joinDate: '2023-06-01',
    status: 'active',
    availableTimes: [
      { dayOfWeek: 2, startTime: '19:00', endTime: '22:00' },
      { dayOfWeek: 5, startTime: '19:00', endTime: '22:00' },
      { dayOfWeek: 6, startTime: '14:00', endTime: '18:00' },
    ],
  },
  {
    id: generateId(),
    name: '刘洋',
    instrument: '萨克斯',
    phone: '13800138006',
    email: 'liuyang@band.com',
    joinDate: '2024-01-10',
    status: 'active',
    availableTimes: [
      { dayOfWeek: 4, startTime: '19:00', endTime: '22:00' },
      { dayOfWeek: 6, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 0, startTime: '14:00', endTime: '18:00' },
    ],
  },
];

export const mockSongs: Song[] = [
  {
    id: generateId(),
    name: '海阔天空',
    artist: 'Beyond',
    version: '编曲版',
    status: '可演出',
    difficulty: 3,
    duration: 320,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-03-15T14:30:00Z',
    scores: [
      {
        id: generateId(),
        songId: '',
        instrument: '主唱',
        fileName: '海阔天空-主唱.pdf',
        fileUrl: '',
        annotations: [],
        permissions: [],
      },
      {
        id: generateId(),
        songId: '',
        instrument: '吉他',
        fileName: '海阔天空-吉他.pdf',
        fileUrl: '',
        annotations: [],
        permissions: [],
      },
      {
        id: generateId(),
        songId: '',
        instrument: '贝斯',
        fileName: '海阔天空-贝斯.pdf',
        fileUrl: '',
        annotations: [],
        permissions: [],
      },
      {
        id: generateId(),
        songId: '',
        instrument: '鼓',
        fileName: '海阔天空-鼓.pdf',
        fileUrl: '',
        annotations: [],
        permissions: [],
      },
    ],
  },
  {
    id: generateId(),
    name: '光辉岁月',
    artist: 'Beyond',
    version: '原版',
    status: '可演出',
    difficulty: 2,
    duration: 290,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-20T11:00:00Z',
    scores: [],
  },
  {
    id: generateId(),
    name: '真的爱你',
    artist: 'Beyond',
    version: '现场版',
    status: '学习中',
    difficulty: 3,
    duration: 280,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-03-10T16:00:00Z',
    scores: [],
  },
  {
    id: generateId(),
    name: '不再犹豫',
    artist: 'Beyond',
    version: '编曲版',
    status: '学习中',
    difficulty: 4,
    duration: 260,
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-03-18T09:00:00Z',
    scores: [],
  },
  {
    id: generateId(),
    name: '灰色轨迹',
    artist: 'Beyond',
    version: '原版',
    status: '已归档',
    difficulty: 3,
    duration: 340,
    createdAt: '2023-11-10T10:00:00Z',
    updatedAt: '2024-01-05T14:00:00Z',
    scores: [],
  },
];

const now = dayjs();

export const mockRehearsals: Rehearsal[] = [
  {
    id: generateId(),
    title: '周末常规排练',
    date: now.add(1, 'day').format('YYYY-MM-DD'),
    startTime: '14:00',
    endTime: '18:00',
    location: '星光排练室 A',
    participantIds: mockMembers.slice(0, 5).map(m => m.id),
    status: 'planned',
    songIds: mockSongs.slice(0, 3).map(s => s.id),
    leaveRequests: [],
    notes: '重点练习新曲目《真的爱你》',
  },
  {
    id: generateId(),
    title: '演出前彩排',
    date: now.add(7, 'day').format('YYYY-MM-DD'),
    startTime: '19:00',
    endTime: '22:00',
    location: '星光排练室 B',
    participantIds: mockMembers.map(m => m.id),
    status: 'planned',
    songIds: mockSongs.slice(0, 2).map(s => s.id),
    leaveRequests: [],
    notes: '按照演出顺序完整走台',
  },
  {
    id: generateId(),
    title: '日常排练',
    date: now.add(-3, 'day').format('YYYY-MM-DD'),
    startTime: '19:00',
    endTime: '22:00',
    location: '星光排练室 A',
    participantIds: mockMembers.slice(0, 4).map(m => m.id),
    status: 'completed',
    songIds: mockSongs.slice(0, 2).map(s => s.id),
    leaveRequests: [],
    notes: '复习经典曲目',
  },
];

export const mockRehearsalRecords: RehearsalRecord[] = [
  {
    id: generateId(),
    rehearsalId: mockRehearsals[2].id,
    date: mockRehearsals[2].date,
    participantIds: mockRehearsals[2].participantIds,
    songIds: mockRehearsals[2].songIds,
    duration: 180,
    focusSegments: ['《海阔天空》副歌部分', '《光辉岁月》前奏衔接'],
    technicalIssues: [
      {
        id: generateId(),
        rehearsalRecordId: '',
        songId: mockSongs[0].id,
        description: '副歌部分贝斯与鼓的速度不一致，需要多练',
        measure: '第32-40小节',
        status: 'open',
        assignedTo: mockMembers[2].id,
      },
    ],
    recordingIds: [],
    notes: '整体状态不错，重点解决速度问题',
  },
];

export const mockPerformances: Performance[] = [
  {
    id: generateId(),
    title: '春季音乐节演出',
    date: now.add(14, 'day').format('YYYY-MM-DD'),
    time: '20:00',
    location: '城市音乐厅',
    venue: '主舞台',
    audienceCount: 500,
    setlist: [
      { id: generateId(), songId: mockSongs[0].id, order: 1, notes: '开场曲' },
      { id: generateId(), songId: mockSongs[1].id, order: 2 },
    ],
    preparationList: [
      { id: generateId(), name: '检查所有乐器', category: '装备', completed: false, deadline: now.add(13, 'day').format('YYYY-MM-DD') },
      { id: generateId(), name: '确认音响设备', category: '装备', completed: false },
      { id: generateId(), name: '彩排走台', category: '人员', completed: false, deadline: now.add(14, 'day').format('YYYY-MM-DD') },
      { id: generateId(), name: '成员准时到场', category: '人员', completed: false, deadline: now.add(14, 'day').format('YYYY-MM-DD') },
    ],
  },
  {
    id: generateId(),
    title: '新年音乐会',
    date: now.add(-60, 'day').format('YYYY-MM-DD'),
    time: '19:30',
    location: '大剧院',
    venue: '音乐厅',
    audienceCount: 800,
    setlist: [
      { id: generateId(), songId: mockSongs[0].id, order: 1 },
      { id: generateId(), songId: mockSongs[1].id, order: 2 },
      { id: generateId(), songId: mockSongs[4].id, order: 3, notes: '返场曲' },
    ],
    preparationList: [
      { id: generateId(), name: '乐器运输', category: '装备', completed: true },
      { id: generateId(), name: '音响调试', category: '装备', completed: true },
    ],
    review: {
      highlights: '现场气氛很好，《海阔天空》大合唱很震撼',
      improvements: '第二首歌的前奏衔接有点问题，需要多练',
      overallRating: 4,
      createdAt: now.add(-59, 'day').format('YYYY-MM-DD'),
    },
  },
];

export const mockEquipment: Equipment[] = [
  {
    id: generateId(),
    name: 'Fender 电吉他',
    ownerId: mockMembers[1].id,
    description: '美产 Stratocaster，状态良好',
    category: '吉他',
    available: true,
  },
  {
    id: generateId(),
    name: 'Yamaha 贝斯',
    ownerId: mockMembers[2].id,
    description: '四弦电贝斯',
    category: '贝斯',
    available: true,
  },
  {
    id: generateId(),
    name: 'Shure SM58 话筒',
    ownerId: mockMembers[0].id,
    description: '动圈话筒，演出专用',
    category: '话筒',
    available: false,
  },
  {
    id: generateId(),
    name: '效果器板',
    ownerId: mockMembers[1].id,
    description: '包含失真、延迟、混响等效果',
    category: '效果器',
    available: true,
  },
  {
    id: generateId(),
    name: 'Roland 键盘',
    ownerId: mockMembers[4].id,
    description: '88键合成器',
    category: '键盘',
    available: true,
  },
];

export const mockBorrowRecords: BorrowRecord[] = [
  {
    id: generateId(),
    equipmentId: mockEquipment[2].id,
    borrowerId: mockMembers[3].id,
    ownerId: mockEquipment[2].ownerId,
    borrowDate: now.add(-2, 'day').format('YYYY-MM-DD'),
    expectedReturnDate: now.add(3, 'day').format('YYYY-MM-DD'),
    status: 'approved',
    notes: '演出排练使用',
  },
];

export const initMockData = () => {
  localStorage.setItem('band_members', JSON.stringify(mockMembers));
  localStorage.setItem('band_songs', JSON.stringify(mockSongs));
  localStorage.setItem('band_rehearsals', JSON.stringify(mockRehearsals));
  localStorage.setItem('band_rehearsal_records', JSON.stringify(mockRehearsalRecords));
  localStorage.setItem('band_performances', JSON.stringify(mockPerformances));
  localStorage.setItem('band_equipment', JSON.stringify(mockEquipment));
  localStorage.setItem('band_borrow_records', JSON.stringify(mockBorrowRecords));
  localStorage.setItem('band_initialized', 'true');
};
