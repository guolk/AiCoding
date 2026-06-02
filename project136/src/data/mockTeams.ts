import type { Team } from '../types';

export const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: '皇家马德里',
    history: '皇家马德里成立于1902年，是世界上最成功的足球俱乐部之一，曾获得14次欧冠冠军、36次西甲冠军。球队以其优雅的足球风格和巨星政策闻名于世，历史上涌现出迪斯蒂法诺、C罗、齐达内等传奇球星。',
    coach: '安切洛蒂',
    corePlayers: ['player-1', 'player-2', 'player-3'],
    recentResults: '近5场比赛3胜1平1负，状态稳定。上轮联赛客场3-1击败巴塞罗那，展现出强大的攻击力。',
    league: '西甲'
  },
  {
    id: 'team-2',
    name: '巴塞罗那',
    history: '巴塞罗那成立于1899年，以传控足球哲学闻名于世。俱乐部拥有27次西甲冠军和5次欧冠冠军，梅西、哈维、伊涅斯塔等球星塑造了俱乐部的黄金时代。',
    coach: '哈维',
    corePlayers: ['player-4', 'player-5', 'player-6'],
    recentResults: '近5场比赛2胜2平1负，主场表现强势但客场稳定性有待提升。欧冠小组赛首轮2-0战胜拜仁。',
    league: '西甲'
  },
  {
    id: 'team-3',
    name: '曼城',
    history: '曼城成立于1880年，近年来在阿布扎比财团的支持下迅速崛起，已获得9次英超冠军和1次欧冠冠军。瓜迪奥拉打造的传控体系让球队成为欧洲最具统治力的球队之一。',
    coach: '瓜迪奥拉',
    corePlayers: ['player-7', 'player-8', 'player-9'],
    recentResults: '近5场比赛4胜1平保持不败，攻防两端表现均衡。新赛季英超开局三连胜领跑积分榜。',
    league: '英超'
  },
  {
    id: 'team-4',
    name: '利物浦',
    history: '利物浦成立于1892年，是英格兰最成功的俱乐部之一，拥有19次联赛冠军和6次欧冠冠军。球队以其激情四射的足球风格和"你永远不会独行"的口号闻名世界。',
    coach: '克洛普',
    corePlayers: ['player-10', 'player-11', 'player-12'],
    recentResults: '近5场比赛3胜2负，表现起伏较大。主场5-1大胜西汉姆联，但客场0-1不敌伯恩茅斯。',
    league: '英超'
  },
  {
    id: 'team-5',
    name: '拜仁慕尼黑',
    history: '拜仁慕尼黑成立于1900年，是德国足球的霸主，获得过33次德甲冠军和6次欧冠冠军。球队以其严谨的战术纪律和强大的青训体系著称。',
    coach: '图赫尔',
    corePlayers: ['player-13', 'player-14', 'player-15'],
    recentResults: '近5场比赛3胜1平1负，上轮德甲2-2战平勒沃库森，终结了联赛四连胜。',
    league: '德甲'
  },
  {
    id: 'team-6',
    name: '巴黎圣日耳曼',
    history: '巴黎圣日耳曼成立于1970年，近年来在卡塔尔财团的投资下成为欧洲豪门。俱乐部拥有12次法甲冠军，MNM组合曾威震欧洲。',
    coach: '恩里克',
    corePlayers: ['player-16', 'player-17', 'player-18'],
    recentResults: '近5场比赛4胜0平1负，攻击火力强大。法甲联赛前四轮全胜，净胜球达到12个。',
    league: '法甲'
  },
  {
    id: 'team-7',
    name: '尤文图斯',
    history: '尤文图斯成立于1897年，是意大利最成功的俱乐部，获得过36次意甲冠军和2次欧冠冠军。球队以"老妇人"的绰号和稳健的防守传统闻名。',
    coach: '阿莱格里',
    corePlayers: ['player-19', 'player-20', 'player-21'],
    recentResults: '近5场比赛2胜2平1负，防守端表现稳定但进攻效率有待提高。意甲排名第四位。',
    league: '意甲'
  },
  {
    id: 'team-8',
    name: 'AC米兰',
    history: 'AC米兰成立于1899年，拥有19次意甲冠军和7次欧冠冠军，是世界上最成功的俱乐部之一。马尔蒂尼、巴雷西、卡卡等传奇球星载入史册。',
    coach: '皮奥利',
    corePlayers: ['player-22', 'player-23', 'player-24'],
    recentResults: '近5场比赛3胜1平1负，状态回暖。上轮意甲客场3-2力克罗马，取得关键三分。',
    league: '意甲'
  }
];
