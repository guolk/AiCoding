import { nanoid } from 'nanoid';
import type { GameRecord, LifeDeathProblem, Joseki, DailyTask, MatchRecord, RankRecord, MoveNode } from '@/types';
import { getTodayString } from './dateUtils';

function createMoveNode(
  moveNumber: number,
  color: 'black' | 'white',
  point: { x: number; y: number } | null,
  parentId: string | null,
  comment?: string,
  isMain: boolean = true
): MoveNode {
  return {
    id: nanoid(),
    moveNumber,
    color,
    point,
    comment,
    marks: [],
    children: [],
    parentId,
    isMain,
  };
}

function buildJosekiGame(): GameRecord {
  const rootNode = createMoveNode(0, 'black', null, null, '星定式 - 小飞挂角');
  
  const move1 = createMoveNode(1, 'black', { x: 3, y: 3 }, rootNode.id);
  rootNode.children.push(move1);
  
  const move2 = createMoveNode(2, 'white', { x: 6, y: 3 }, move1.id);
  move1.children.push(move2);
  
  const move3 = createMoveNode(3, 'black', { x: 3, y: 6 }, move2.id, '小飞应，稳健的下法');
  move2.children.push(move3);
  
  const move4 = createMoveNode(4, 'white', { x: 5, y: 6 }, move3.id);
  move3.children.push(move4);
  
  const move5 = createMoveNode(5, 'black', { x: 2, y: 5 }, move4.id, '拆二，基本定式完成');
  move4.children.push(move5);
  
  const variation1 = createMoveNode(3, 'black', { x: 4, y: 5 }, move2.id, '尖顶，更积极的下法', false);
  move2.children.push(variation1);
  
  const v1Move2 = createMoveNode(4, 'white', { x: 3, y: 6 }, variation1.id);
  variation1.children.push(v1Move2);
  
  const v1Move3 = createMoveNode(5, 'black', { x: 5, y: 6 }, v1Move2.id, '长，形成另一种定式变化');
  v1Move2.children.push(v1Move3);
  
  const id = nanoid();
  return {
    id,
    title: '星定式 - 小飞挂角',
    blackPlayer: '黑方',
    whitePlayer: '白方',
    date: '2024-01-15',
    category: 'joseki',
    tags: ['星定式', '小飞挂', '基础'],
    description: '经典星位小飞挂角定式，包含两种主要变化',
    sgfContent: '',
    rootNode,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 10,
  };
}

function buildSmallAvalanche(): GameRecord {
  const rootNode = createMoveNode(0, 'black', null, null, '小目定式 - 小雪崩');
  
  const move1 = createMoveNode(1, 'black', { x: 3, y: 2 }, rootNode.id);
  rootNode.children.push(move1);
  
  const move2 = createMoveNode(2, 'white', { x: 5, y: 3 }, move1.id);
  move1.children.push(move2);
  
  const move3 = createMoveNode(3, 'black', { x: 4, y: 4 }, move2.id, '高挂');
  move2.children.push(move3);
  
  const move4 = createMoveNode(4, 'white', { x: 4, y: 6 }, move3.id);
  move3.children.push(move4);
  
  const move5 = createMoveNode(5, 'black', { x: 3, y: 5 }, move4.id, '托，开始小雪崩');
  move4.children.push(move5);
  
  const move6 = createMoveNode(6, 'white', { x: 2, y: 5 }, move5.id);
  move5.children.push(move6);
  
  const move7 = createMoveNode(7, 'black', { x: 4, y: 5 }, move6.id, '扳，形成雪崩型');
  move6.children.push(move7);
  
  const id = nanoid();
  return {
    id,
    title: '小目定式 - 小雪崩',
    blackPlayer: '黑方',
    whitePlayer: '白方',
    date: '2024-02-20',
    category: 'joseki',
    tags: ['小目', '高挂', '雪崩型', '中级'],
    description: '经典小雪崩定式，变化复杂',
    sgfContent: '',
    rootNode,
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 86400000 * 8,
  };
}

function buildFamousGame(): GameRecord {
  const rootNode = createMoveNode(0, 'black', null, null, '名局欣赏：经典对局');
  
  const move1 = createMoveNode(1, 'black', { x: 3, y: 3 }, rootNode.id, '星位开局');
  rootNode.children.push(move1);
  
  const move2 = createMoveNode(2, 'white', { x: 15, y: 3 }, move1.id);
  move1.children.push(move2);
  
  const move3 = createMoveNode(3, 'black', { x: 15, y: 15 }, move2.id);
  move2.children.push(move3);
  
  const move4 = createMoveNode(4, 'white', { x: 3, y: 15 }, move3.id, '对角星布局');
  move3.children.push(move4);
  
  const move5 = createMoveNode(5, 'black', { x: 9, y: 9 }, move4.id, '天元！大胆的一手');
  move4.children.push(move5);
  
  const id = nanoid();
  return {
    id,
    title: '经典名局 - 天元之局',
    blackPlayer: '古代名人',
    whitePlayer: '本因坊',
    result: '黑胜',
    date: '2023-12-01',
    category: 'famous',
    tags: ['名局', '天元', '经典'],
    description: '著名的天元开局名局，气势磅礴',
    sgfContent: '',
    rootNode,
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 30,
  };
}

function buildLifeDeathProblem1(): GameRecord {
  const rootNode = createMoveNode(0, 'black', null, null, '死活题：角上死活');
  
  const move1 = createMoveNode(1, 'black', { x: 0, y: 0 }, rootNode.id, '黑先，白死');
  rootNode.children.push(move1);
  
  const move2 = createMoveNode(2, 'white', { x: 1, y: 0 }, move1.id);
  move1.children.push(move2);
  
  const move3 = createMoveNode(3, 'black', { x: 2, y: 1 }, move2.id, '正解：点入');
  move2.children.push(move3);
  
  const id = nanoid();
  return {
    id,
    title: '角上死活 - 初级',
    blackPlayer: '黑方',
    whitePlayer: '白方',
    date: '2024-03-01',
    category: 'problem',
    tags: ['死活', '角部', '初级'],
    description: '基础角部死活题，黑先杀白',
    sgfContent: '',
    rootNode,
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 5,
  };
}

function buildTeachingGame(): GameRecord {
  const rootNode = createMoveNode(0, 'black', null, null, '教学棋谱：布局基础');
  
  const move1 = createMoveNode(1, 'black', { x: 3, y: 3 }, rootNode.id, '星位');
  rootNode.children.push(move1);
  
  const move2 = createMoveNode(2, 'white', { x: 3, y: 15 }, move1.id);
  move1.children.push(move2);
  
  const move3 = createMoveNode(3, 'black', { x: 15, y: 3 }, move2.id);
  move2.children.push(move3);
  
  const move4 = createMoveNode(4, 'white', { x: 15, y: 15 }, move3.id, '四连星布局');
  move3.children.push(move4);
  
  const id = nanoid();
  return {
    id,
    title: '教学棋谱 - 布局入门',
    blackPlayer: '老师',
    whitePlayer: '学生',
    date: '2024-03-10',
    category: 'teaching',
    tags: ['教学', '布局', '入门'],
    description: '基础布局教学棋谱',
    sgfContent: '',
    rootNode,
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 3,
  };
}

function buildSelfGame(): GameRecord {
  const rootNode = createMoveNode(0, 'black', null, null, '我的对局记录');
  
  const move1 = createMoveNode(1, 'black', { x: 3, y: 3 }, rootNode.id);
  rootNode.children.push(move1);
  
  const move2 = createMoveNode(2, 'white', { x: 15, y: 15 }, move1.id);
  move1.children.push(move2);
  
  const move3 = createMoveNode(3, 'black', { x: 9, y: 3 }, move2.id);
  move2.children.push(move3);
  
  const id = nanoid();
  return {
    id,
    title: '网络对局 #23',
    blackPlayer: '我',
    whitePlayer: '棋友A',
    result: '白中盘胜',
    date: '2024-06-10',
    category: 'self',
    tags: ['网络对局', '让先'],
    description: '今天的练习对局',
    sgfContent: '',
    rootNode,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 2,
  };
}

export const mockGames: GameRecord[] = [
  buildJosekiGame(),
  buildSmallAvalanche(),
  buildFamousGame(),
  buildLifeDeathProblem1(),
  buildTeachingGame(),
  buildSelfGame(),
];

export const mockProblems: LifeDeathProblem[] = [
  {
    id: nanoid(),
    title: '角部死活 - 直三',
    difficulty: 'easy',
    initialBoard: '',
    correctAnswer: '',
    practiceRecords: [
      { id: nanoid(), date: Date.now() - 86400000 * 5, isCorrect: true, timeSpent: 45 },
      { id: nanoid(), date: Date.now() - 86400000 * 3, isCorrect: true, timeSpent: 30 },
      { id: nanoid(), date: Date.now() - 86400000 * 1, isCorrect: false, timeSpent: 60, notes: '粗心了' },
    ],
  },
  {
    id: nanoid(),
    title: '边上死活 - 刀五',
    difficulty: 'medium',
    initialBoard: '',
    correctAnswer: '',
    practiceRecords: [
      { id: nanoid(), date: Date.now() - 86400000 * 4, isCorrect: false, timeSpent: 120 },
      { id: nanoid(), date: Date.now() - 86400000 * 2, isCorrect: true, timeSpent: 90 },
    ],
  },
  {
    id: nanoid(),
    title: '角部死活 - 大猪嘴',
    difficulty: 'hard',
    initialBoard: '',
    correctAnswer: '',
    practiceRecords: [
      { id: nanoid(), date: Date.now() - 86400000 * 6, isCorrect: false, timeSpent: 180, notes: '没找到要点' },
    ],
  },
  {
    id: nanoid(),
    title: '经典死活 - 金柜角',
    difficulty: 'expert',
    initialBoard: '',
    correctAnswer: '',
    practiceRecords: [],
  },
  {
    id: nanoid(),
    title: '边死活 - 方四',
    difficulty: 'easy',
    initialBoard: '',
    correctAnswer: '',
    practiceRecords: [
      { id: nanoid(), date: Date.now() - 86400000 * 7, isCorrect: true, timeSpent: 25 },
      { id: nanoid(), date: Date.now() - 86400000 * 2, isCorrect: true, timeSpent: 20 },
    ],
  },
];

export const mockJosekis: Joseki[] = [
  {
    id: nanoid(),
    name: '星定式 - 小飞挂角',
    gameId: mockGames[0].id,
    mastery: 'memorized',
    lastPracticedAt: Date.now() - 86400000 * 2,
  },
  {
    id: nanoid(),
    name: '小目定式 - 小雪崩',
    gameId: mockGames[1].id,
    mastery: 'familiar',
    lastPracticedAt: Date.now() - 86400000 * 5,
  },
  {
    id: nanoid(),
    name: '星定式 - 一间高挂',
    gameId: '',
    mastery: 'understood',
    lastPracticedAt: Date.now() - 86400000 * 1,
  },
  {
    id: nanoid(),
    name: '三三定式 - 肩冲',
    gameId: '',
    mastery: 'familiar',
  },
  {
    id: nanoid(),
    name: '小目定式 - 小飞挂',
    gameId: '',
    mastery: 'memorized',
    lastPracticedAt: Date.now() - 86400000 * 3,
  },
];

const today = getTodayString();

export const mockDailyTasks: DailyTask[] = [
  {
    id: nanoid(),
    date: today,
    type: 'problem',
    title: '完成5道死活题',
    isCompleted: false,
    targetCount: 5,
    currentCount: 2,
  },
  {
    id: nanoid(),
    date: today,
    type: 'joseki',
    title: '复习3个定式',
    isCompleted: true,
    completedAt: Date.now() - 3600000,
    targetCount: 3,
    currentCount: 3,
  },
  {
    id: nanoid(),
    date: today,
    type: 'game',
    title: '打谱1局名局',
    isCompleted: false,
  },
  {
    id: nanoid(),
    date: today,
    type: 'custom',
    title: '复盘昨天的对局',
    isCompleted: false,
  },
];

export const mockMatches: MatchRecord[] = [
  {
    id: nanoid(),
    opponentName: '棋友小王',
    opponentRank: '业余3段',
    result: 'win',
    myColor: 'black',
    handicap: 0,
    playedAt: Date.now() - 86400000 * 2,
    reviewNotes: '今天发挥不错，中盘战斗很激烈。第87手是关键的转折点，抓住了对方的失误。',
    keyMoments: [
      { id: nanoid(), moveNumber: 45, description: '打入上边，开始战斗', reflection: '时机选择不错' },
      { id: nanoid(), moveNumber: 87, description: '断，制造头绪', reflection: '妙手！对方应对失误' },
      { id: nanoid(), moveNumber: 132, description: '收官阶段，稳扎稳打', reflection: '收官还要加强' },
    ],
  },
  {
    id: nanoid(),
    opponentName: '围棋高手',
    opponentRank: '业余5段',
    result: 'loss',
    myColor: 'white',
    handicap: 2,
    playedAt: Date.now() - 86400000 * 5,
    reviewNotes: '差距还是比较明显，布局阶段就落后了。需要加强定式和布局的学习。',
    keyMoments: [
      { id: nanoid(), moveNumber: 23, description: '定式选择不当', reflection: '这个变化不太熟' },
      { id: nanoid(), moveNumber: 67, description: '打入过深', reflection: '太冒进了' },
    ],
  },
  {
    id: nanoid(),
    opponentName: '小李',
    opponentRank: '业余2段',
    result: 'win',
    myColor: 'white',
    handicap: 0,
    playedAt: Date.now() - 86400000 * 8,
    keyMoments: [],
  },
  {
    id: nanoid(),
    opponentName: '棋圣',
    opponentRank: '业余6段',
    result: 'loss',
    myColor: 'black',
    handicap: 3,
    playedAt: Date.now() - 86400000 * 15,
    reviewNotes: '让3子还是输了，继续努力！',
    keyMoments: [],
  },
  {
    id: nanoid(),
    opponentName: '老张',
    opponentRank: '业余3段',
    result: 'draw',
    myColor: 'black',
    handicap: 0,
    playedAt: Date.now() - 86400000 * 20,
    keyMoments: [],
  },
];

export const mockRanks: RankRecord[] = [
  {
    id: nanoid(),
    rank: '业余1段',
    date: Date.now() - 86400000 * 365,
    event: '升段赛',
    notes: '第一次参加升段赛，成功升段！',
  },
  {
    id: nanoid(),
    rank: '业余2段',
    date: Date.now() - 86400000 * 200,
    event: '网络定级赛',
    notes: '网络对局积累，成功升级',
  },
  {
    id: nanoid(),
    rank: '业余3段',
    date: Date.now() - 86400000 * 60,
    event: '升段赛',
    notes: '经过半年努力，终于升3段了',
  },
];
