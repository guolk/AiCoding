import type { Player, PlayerStat } from '../types';

export const mockPlayers: Player[] = [
  {
    id: 'player-1',
    teamId: 'team-1',
    name: '维尼修斯',
    age: 24,
    position: '左边锋',
    story: '维尼修斯2018年从弗拉门戈加盟皇马，经历了几年的成长后，如今已成为世界足坛最具威胁的边路攻击手之一。他的速度和盘带技术让任何后卫都感到头疼。2022年欧冠决赛的进球让他成为球队的英雄。',
    characteristics: ['速度极快', '盘带出色', '内切射门', '防守积极']
  },
  {
    id: 'player-2',
    teamId: 'team-1',
    name: '贝林厄姆',
    age: 21,
    position: '中场',
    story: '贝林厄姆2023年夏天从多特蒙德转会至皇家马德里，迅速成为球队中场核心。他的全能表现让人们看到了下一位传奇中场的影子。年仅21岁的他已经展现出超越年龄的成熟。',
    characteristics: ['全能中场', '后插上得分', '防守覆盖', '领袖气质']
  },
  {
    id: 'player-3',
    teamId: 'team-1',
    name: '莫德里奇',
    age: 39,
    position: '中场',
    story: '莫德里奇是皇马的传奇中场，2018年金球奖得主。尽管年事已高，但他依然保持着顶级的竞技状态。他的传球视野和大局观是皇马中场最宝贵的财富。',
    characteristics: ['传球大师', '节奏掌控', '远射能力', '大赛型球员']
  },
  {
    id: 'player-4',
    teamId: 'team-2',
    name: '莱万多夫斯基',
    age: 36,
    position: '中锋',
    story: '莱万多夫斯基是当代最伟大的射手之一，保持着多项进球纪录。从多特蒙德到拜仁，再到巴塞罗那，他在每支球队都证明了自己的得分能力。',
    characteristics: ['禁区杀手', '头球出色', '做球能力', '职业典范']
  },
  {
    id: 'player-5',
    teamId: 'team-2',
    name: '佩德里',
    age: 22,
    position: '中场',
    story: '佩德里被誉为伊涅斯塔的接班人，他的控球和传球风格完美契合巴萨的传控哲学。年纪轻轻就已经是西班牙国家队的中场核心。',
    characteristics: ['控球优雅', '传球精准', '跑动积极', '战术意识强']
  },
  {
    id: 'player-6',
    teamId: 'team-2',
    name: '加维',
    age: 20,
    position: '中场',
    story: '加维是巴萨青训的又一杰出产品，以其顽强的拼搏精神和不惜体力的奔跑著称。他是那种每支球队都想要的球员。',
    characteristics: ['奔跑不倦', '抢断凶狠', '斗志昂扬', '传球稳健']
  },
  {
    id: 'player-7',
    teamId: 'team-3',
    name: '哈兰德',
    age: 24,
    position: '中锋',
    story: '哈兰德是足坛现象级的存在，他的身体素质和进球效率让人想到了年轻的伊布。从多特蒙德转会曼城后，他的进球数更是达到了惊人的水平。',
    characteristics: ['身体强壮', '射术精湛', '跑位鬼魅', '空中优势']
  },
  {
    id: 'player-8',
    teamId: 'team-3',
    name: '德布劳内',
    age: 33,
    position: '中场',
    story: '德布劳内是曼城的中场发动机，他的传球能力堪称世界顶级。无论是直塞球还是传中，他总能找到最精准的路线。',
    characteristics: ['传球大师', '远射威胁', '视野开阔', '定位球专家']
  },
  {
    id: 'player-9',
    teamId: 'team-3',
    name: '罗德里',
    age: 28,
    position: '后腰',
    story: '罗德里是曼城的中场屏障，他的防守覆盖和出球能力是球队攻守转换的关键。2023年欧冠决赛的进球让他成为球队的英雄。',
    characteristics: ['防守稳健', '出球精准', '阅读比赛', '领导能力']
  },
  {
    id: 'player-10',
    teamId: 'team-4',
    name: '萨拉赫',
    age: 32,
    position: '右边锋',
    story: '萨拉赫是利物浦的"埃及国王"，他的进球和助攻数据连年稳定输出。从罗马加盟利物浦后，他用表现证明了自己是世界级球星。',
    characteristics: ['内切射门', '速度飞快', '盘带犀利', '大心脏']
  },
  {
    id: 'player-11',
    teamId: 'team-4',
    name: '范戴克',
    age: 33,
    position: '中后卫',
    story: '范戴克是利物浦后防的定海神针，他的加盟让利物浦的防线提升了一个档次。他是那种可以凭一己之力改变比赛的后卫。',
    characteristics: ['空中霸主', '抢断精准', '出球冷静', '后防领袖']
  },
  {
    id: 'player-12',
    teamId: 'team-4',
    name: '麦卡利斯特',
    age: 26,
    position: '中场',
    story: '麦卡利斯特是阿根廷世界杯冠军成员，从布莱顿转会利物浦后迅速成为球队中场核心。他的远射和传球能力为利物浦的中场注入了新的活力。',
    characteristics: ['远射出色', '传球精准', '跑动积极', '大赛经验']
  },
  {
    id: 'player-13',
    teamId: 'team-5',
    name: '凯恩',
    age: 31,
    position: '中锋',
    story: '凯恩是英格兰历史最佳射手，从热刺转会拜仁后继续保持着高效的进球率。他不仅能进球，还能回撤做球，是现代中锋的完美模板。',
    characteristics: ['射术精湛', '做球能力', '点球专家', '大赛发挥']
  },
  {
    id: 'player-14',
    teamId: 'team-5',
    name: '穆西亚拉',
    age: 21,
    position: '前腰',
    story: '穆西亚拉是拜仁青训的瑰宝，年纪轻轻就已经是球队的核心球员。他的盘带和创造力让人看到了下一位超级巨星的潜质。',
    characteristics: ['盘带华丽', '创造力强', '射门精准', '年轻有为']
  },
  {
    id: 'player-15',
    teamId: 'team-5',
    name: '诺伊尔',
    age: 38,
    position: '门将',
    story: '诺伊尔重新定义了门将的位置，他是"门卫"踢法的开创者。尽管年事已高，但他依然是世界最佳门将之一。',
    characteristics: ['出击果断', '脚下技术好', '指挥防线', '反应神速']
  },
  {
    id: 'player-16',
    teamId: 'team-6',
    name: '姆巴佩',
    age: 26,
    position: '前锋',
    story: '姆巴佩是当今足坛最具价值的球员之一，他的速度和终结能力让所有后卫闻风丧胆。世界杯冠军的荣誉让他的职业生涯更加辉煌。',
    characteristics: ['速度惊人', '终结冷静', '盘带犀利', '大场面先生']
  },
  {
    id: 'player-17',
    teamId: 'team-6',
    name: '登贝莱',
    age: 27,
    position: '边锋',
    story: '登贝莱拥有世界顶级的天赋，他的双脚均衡和盘带能力让人惊叹。虽然伤病曾困扰他，但健康的登贝莱是任何防守的噩梦。',
    characteristics: ['双足球员', '盘带顶级', '速度飞快', '内切射门']
  },
  {
    id: 'player-18',
    teamId: 'team-6',
    name: '多纳鲁马',
    age: 26,
    position: '门将',
    story: '多纳鲁马是意大利欧洲杯冠军的主力门将，年纪轻轻就已经展现出世界级门将的潜质。他的身高和反应能力是他最大的优势。',
    characteristics: ['身高臂长', '反应神速', '扑点专家', '年轻稳定']
  },
  {
    id: 'player-19',
    teamId: 'team-7',
    name: '弗拉霍维奇',
    age: 25,
    position: '中锋',
    story: '弗拉霍维奇从佛罗伦萨转会尤文图斯后成为球队的锋线支柱。他的身高和射门能力让他成为意甲最具威胁的射手之一。',
    characteristics: ['身材高大', '射术精湛', '头球出色', '跑动积极']
  },
  {
    id: 'player-20',
    teamId: 'team-7',
    name: '拉比奥',
    age: 30,
    position: '中场',
    story: '拉比奥从巴黎圣日耳曼自由转会尤文图斯后逐渐证明了自己的价值。他的身体素质和传球能力是尤文中场的重要支撑。',
    characteristics: ['身体强壮', '传球准确', '后插上得分', '防守覆盖']
  },
  {
    id: 'player-21',
    teamId: 'team-7',
    name: '基耶萨',
    age: 27,
    position: '边锋',
    story: '基耶萨是意大利欧洲杯冠军的功臣，他的速度和突破能力是尤文进攻的重要武器。虽然伤病曾影响他的发展，但复出后依然保持高水准。',
    characteristics: ['速度快', '突破犀利', '内切射门', '斗志旺盛']
  },
  {
    id: 'player-22',
    teamId: 'team-8',
    name: '莱奥',
    age: 25,
    position: '左边锋',
    story: '莱奥是AC米兰的进攻核心，他的个人能力和创造力是米兰最锐利的武器。他帮助球队重夺意甲冠军，个人也获得了意甲MVP的荣誉。',
    characteristics: ['盘带过人', '速度爆发', '内切射门', '创造力强']
  },
  {
    id: 'player-23',
    teamId: 'team-8',
    name: '特奥',
    age: 27,
    position: '左后卫',
    story: '特奥是当今足坛最具攻击性的边后卫之一，他的速度和前插能力是米兰进攻的重要组成部分。从皇马转会米兰后，他的进步有目共睹。',
    characteristics: ['助攻能力强', '速度飞快', '远射威胁', '体能充沛']
  },
  {
    id: 'player-24',
    teamId: 'team-8',
    name: '迈尼昂',
    age: 30,
    position: '门将',
    story: '迈尼昂从里尔转会AC米兰后迅速成为球队一号门将，他的稳定表现是米兰后防的保障。他也是法国国家队的重要成员。',
    characteristics: ['门线技术好', '出球能力强', '指挥防线', '心理素质佳']
  }
];

export const mockPlayerStats: PlayerStat[] = [
  { id: 'stat-1', playerId: 'player-1', season: '2025/26', games: 42, goals: 18, assists: 15, minutes: 3500 },
  { id: 'stat-2', playerId: 'player-2', season: '2025/26', games: 38, goals: 22, assists: 10, minutes: 3200 },
  { id: 'stat-3', playerId: 'player-3', season: '2025/26', games: 35, goals: 5, assists: 12, minutes: 2800 },
  { id: 'stat-4', playerId: 'player-4', season: '2025/26', games: 40, goals: 35, assists: 8, minutes: 3400 },
  { id: 'stat-5', playerId: 'player-5', season: '2025/26', games: 36, goals: 8, assists: 14, minutes: 3000 },
  { id: 'stat-6', playerId: 'player-6', season: '2025/26', games: 34, goals: 4, assists: 7, minutes: 2700 },
  { id: 'stat-7', playerId: 'player-7', season: '2025/26', games: 45, goals: 42, assists: 11, minutes: 3800 },
  { id: 'stat-8', playerId: 'player-8', season: '2025/26', games: 39, goals: 12, assists: 20, minutes: 3300 },
  { id: 'stat-9', playerId: 'player-9', season: '2025/26', games: 44, goals: 7, assists: 9, minutes: 3700 },
  { id: 'stat-10', playerId: 'player-10', season: '2025/26', games: 43, goals: 28, assists: 16, minutes: 3600 },
  { id: 'stat-11', playerId: 'player-11', season: '2025/26', games: 38, goals: 3, assists: 5, minutes: 3200 },
  { id: 'stat-12', playerId: 'player-12', season: '2025/26', games: 36, goals: 10, assists: 8, minutes: 2900 },
  { id: 'stat-13', playerId: 'player-13', season: '2025/26', games: 41, goals: 38, assists: 12, minutes: 3400 },
  { id: 'stat-14', playerId: 'player-14', season: '2025/26', games: 37, goals: 15, assists: 18, minutes: 3100 },
  { id: 'stat-15', playerId: 'player-15', season: '2025/26', games: 40, goals: 0, assists: 2, minutes: 3600 },
  { id: 'stat-16', playerId: 'player-16', season: '2025/26', games: 44, goals: 45, assists: 14, minutes: 3700 },
  { id: 'stat-17', playerId: 'player-17', season: '2025/26', games: 35, goals: 12, assists: 16, minutes: 2800 },
  { id: 'stat-18', playerId: 'player-18', season: '2025/26', games: 39, goals: 0, assists: 1, minutes: 3500 },
  { id: 'stat-19', playerId: 'player-19', season: '2025/26', games: 36, goals: 22, assists: 6, minutes: 3000 },
  { id: 'stat-20', playerId: 'player-20', season: '2025/26', games: 34, goals: 6, assists: 10, minutes: 2700 },
  { id: 'stat-21', playerId: 'player-21', season: '2025/26', games: 32, goals: 10, assists: 8, minutes: 2500 },
  { id: 'stat-22', playerId: 'player-22', season: '2025/26', games: 38, goals: 16, assists: 12, minutes: 3100 },
  { id: 'stat-23', playerId: 'player-23', season: '2025/26', games: 37, goals: 8, assists: 15, minutes: 3000 },
  { id: 'stat-24', playerId: 'player-24', season: '2025/26', games: 40, goals: 0, assists: 3, minutes: 3600 },
];
