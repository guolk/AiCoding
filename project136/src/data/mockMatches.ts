import type { Match, Commentator } from '../types';

export const mockCommentators: Commentator[] = [
  {
    id: 'comm-1',
    name: '张指导',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
    style: ['激情型', '专业型'],
    specialty: '足球解说专家',
    experience: 8,
    rating: 4.8,
    skills: {
      speechSpeed: 85,
      expertise: 92,
      emotion: 88,
      interaction: 78,
      improvisation: 82
    },
    reviews: [
      {
        id: 'rev-1',
        reviewer: '李编辑',
        rating: 5,
        comment: '专业、有激情，战术分析非常到位，观众反响热烈！',
        date: '2026-05-28',
        match: '皇马vs巴萨'
      },
      {
        id: 'rev-2',
        reviewer: '王主管',
        rating: 5,
        comment: '声音洪亮有感染力，控场能力强，关键时刻点评精准。',
        date: '2026-05-20',
        match: '曼城vs利物浦'
      },
      {
        id: 'rev-3',
        reviewer: '观众代表',
        rating: 4,
        comment: '解说很专业，希望能多一些互动环节。',
        date: '2026-05-15',
        match: '拜仁vs巴黎'
      }
    ]
  },
  {
    id: 'comm-2',
    name: '李老师',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
    style: ['专业型', '温和型'],
    specialty: '数据分析师',
    experience: 12,
    rating: 4.6,
    skills: {
      speechSpeed: 72,
      expertise: 95,
      emotion: 68,
      interaction: 75,
      improvisation: 70
    },
    reviews: [
      {
        id: 'rev-4',
        reviewer: '张监制',
        rating: 5,
        comment: '数据控最爱，分析专业客观，深受资深球迷喜爱。',
        date: '2026-05-25',
        match: '尤文vsAC米兰'
      },
      {
        id: 'rev-5',
        reviewer: '李编辑',
        rating: 4,
        comment: '知识储备丰富，就是语速可以稍微快一点。',
        date: '2026-05-18',
        match: '拜仁vs多特'
      }
    ]
  },
  {
    id: 'comm-3',
    name: '王老师',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
    style: ['幽默型', '激情型'],
    specialty: '脱口秀式解说',
    experience: 6,
    rating: 4.7,
    skills: {
      speechSpeed: 88,
      expertise: 78,
      emotion: 92,
      interaction: 90,
      improvisation: 85
    },
    reviews: [
      {
        id: 'rev-6',
        reviewer: '观众代表',
        rating: 5,
        comment: '金句频出，看球的快乐源泉！',
        date: '2026-05-26',
        match: '中超联赛'
      },
      {
        id: 'rev-7',
        reviewer: '王主管',
        rating: 4,
        comment: '解说像说段子，互动感强，深受年轻观众喜爱。',
        date: '2026-05-22',
        match: '亚冠联赛'
      }
    ]
  }
];

export const mockMatches: Match[] = [
  {
    id: 'match-1',
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    commentatorId: 'comm-1',
    startTime: '2026-06-05T20:00:00',
    league: '欧冠半决赛',
    status: 'upcoming'
  },
  {
    id: 'match-2',
    homeTeamId: 'team-3',
    awayTeamId: 'team-4',
    commentatorId: 'comm-2',
    startTime: '2026-06-04T19:30:00',
    league: '英超联赛',
    status: 'live',
    homeScore: 2,
    awayScore: 1
  },
  {
    id: 'match-3',
    homeTeamId: 'team-5',
    awayTeamId: 'team-6',
    commentatorId: 'comm-1',
    startTime: '2026-06-03T21:00:00',
    league: '欧冠小组赛',
    status: 'completed',
    homeScore: 3,
    awayScore: 2
  },
  {
    id: 'match-4',
    homeTeamId: 'team-7',
    awayTeamId: 'team-8',
    commentatorId: 'comm-3',
    startTime: '2026-06-06T18:00:00',
    league: '意甲联赛',
    status: 'upcoming'
  },
  {
    id: 'match-5',
    homeTeamId: 'team-2',
    awayTeamId: 'team-6',
    commentatorId: 'comm-2',
    startTime: '2026-06-07T20:00:00',
    league: '欧冠四分之一决赛',
    status: 'upcoming'
  },
  {
    id: 'match-6',
    homeTeamId: 'team-1',
    awayTeamId: 'team-3',
    commentatorId: 'comm-1',
    startTime: '2026-06-10T21:00:00',
    league: '欧冠决赛',
    status: 'upcoming'
  },
  {
    id: 'match-7',
    homeTeamId: 'team-4',
    awayTeamId: 'team-5',
    commentatorId: 'comm-3',
    startTime: '2026-06-08T19:45:00',
    league: '友谊赛',
    status: 'upcoming'
  },
  {
    id: 'match-8',
    homeTeamId: 'team-8',
    awayTeamId: 'team-7',
    commentatorId: 'comm-2',
    startTime: '2026-06-01T20:30:00',
    league: '意大利杯',
    status: 'completed',
    homeScore: 1,
    awayScore: 0
  }
];
