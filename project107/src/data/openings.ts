export interface Opening {
  id: string;
  name: string;
  category: string;
  description: string;
  variations: Variation[];
  traps: Trap[];
}

export interface Variation {
  id: string;
  name: string;
  moves: string;
  strategy: string;
  goals: string;
}

export interface Trap {
  id: string;
  name: string;
  description: string;
  counterplay: string;
  moves: string;
}

export const openings: Opening[] = [
  {
    id: "ruy-lopez",
    name: "西班牙开局",
    category: "王翼开局",
    description: "西班牙开局是国际象棋中最经典的开局之一，以1.e4 e5 2.Nf3 Nc6 3.Bb5开始。白方通过威胁e5兵来间接控制中心，同时发展子力并准备王车易位。",
    variations: [
      {
        id: "ruy-lopez-main",
        name: "主变",
        moves: "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 9.h3",
        strategy: "白方建立稳固的中心控制，准备后续的d4推进。黑方通过...a6和...b5扩大后翼空间，同时保持中心的灵活性。",
        goals: "控制d4和f4格，为子力创造活动空间；限制黑方...Nf6-d5的反击；为f2-f4的王翼进攻做准备。"
      },
      {
        id: "ruy-lopez-closed",
        name: "封闭式变例",
        moves: "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 9.h3 Na5 10.Bc2 c5 11.d4 Qc7",
        strategy: "这是最深刻的西班牙变例之一。黑方通过...Na5-Bc2-c5-d4的序列迫使白方在中心做出决定。双方都准备进行复杂的中局战斗。",
        goals: "白方：保持中心紧张，准备d4-d5封闭中心后转向王翼进攻；黑方：在后翼争取空间，利用c5格的马进行反击。"
      },
      {
        id: "ruy-lopez-open",
        name: "开放式变例",
        moves: "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Nxe4 6.d4 b5 7.Bb3 d5 8.dxe5 Be6",
        strategy: "黑方在第5回合直接吃掉e4兵，接受复杂的战术斗争。白方通过d4和dxe5打开中心，获得发展领先和进攻机会。",
        goals: "白方：利用发展优势对黑方未易位的王发起进攻；黑方：保持物质优势，组织防御并寻找反击机会。"
      }
    ],
    traps: [
      {
        id: "ruy-lopez-noah-s-ark",
        name: "诺亚方舟陷阱",
        description: "这是西班牙开局中最著名的陷阱之一。黑方通过...a6和...b5将白方的b3象困在一个\"方舟\"中。",
        counterplay: "白方应该避免将象退到b3后不做保护，或者在黑方准备...b4之前提前将象移到安全位置。",
        moves: "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.d3 b5 6.Bb3 d6 7.c3 g6 8.O-O Bg7 9.Nbd2 O-O 10.Re1 Na5 11.Bc2 c5 12.Nf1 Nc6 13.Ne3 b4"
      }
    ]
  },
  {
    id: "sicilian-defense",
    name: "西西里防御",
    category: "半开放性开局",
    description: "西西里防御是应对1.e4最流行的防御体系，以1...c5开始。黑方不对称地争夺中心，为反击创造机会，常导致复杂激烈的战斗。",
    variations: [
      {
        id: "sicilian-najdorf",
        name: "纳道尔夫变例",
        moves: "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6",
        strategy: "纳道尔夫变例是西西里防御中最复杂、最理论化的变例。黑方通过...a6控制b5格，同时准备...e5、...g6或...b5等多种计划。",
        goals: "黑方：在后翼争取空间，准备...b5-b4驱赶白方的c3马；在中心和王翼保持灵活性，根据白方的选择做出应对。"
      },
      {
        id: "sicilian-dragon",
        name: "龙式变例",
        moves: "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6",
        strategy: "黑方通过...g6和...Bg7发展王翼象，形成龙式防御结构。这一变例以其激烈的攻王战斗著称，双方通常向相反方向易位。",
        goals: "黑方：利用g7象控制a1-h8斜线；在半开放的c线和后翼寻求反击；如果白方王翼易位，准备...h5-h4的进攻。"
      },
      {
        id: "sicilian-scheveningen",
        name: "舍维宁根变例",
        moves: "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6",
        strategy: "黑方用...e6加强d5格，形成坚固的中心结构。这一变例以其灵活性著称，黑方可以根据情况选择...a6、...Be7或...Nc6等发展方式。",
        goals: "黑方：建立稳固的中心，准备...Nc6和...Be7发展；在适当时候推进...d5或...b5寻求反击；限制白方的空间优势。"
      }
    ],
    traps: [
      {
        id: "sicilian-poisoned-pawn",
        name: "毒兵陷阱",
        description: "这是纳道尔夫变例中的著名陷阱。白方在Qd8-b6之后走Qf3xb7吃掉b7兵，看似获得物质优势，实则陷入危险。",
        counterplay: "白方应该避免贪婪地吃掉b7兵，或者在吃兵前仔细计算后续变化。更安全的选择是继续发展或准备王车易位。",
        moves: "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Bg5 e6 7.f4 Qb6 8.Qd2 Qxb2 9.Rb1 Qa3"
      }
    ]
  },
  {
    id: "french-defense",
    name: "法兰西防御",
    category: "半开放性开局",
    description: "法兰西防御以1...e6应对1.e4，是一种稳固的防御体系。黑方通过...d5在中心建立坚固的堡垒，但可能面临b8-c8象被封锁的问题。",
    variations: [
      {
        id: "french-winawer",
        name: "温纳维尔变例",
        moves: "1.e4 e6 2.d4 d5 3.Nc3 Bb4",
        strategy: "温纳维尔变例是法兰西防御中最尖锐的变例。黑方用...Bb4牵制c3马，迫使白方在中心做出决定。白方通常走e4-e5封闭中心，然后转向王翼进攻。",
        goals: "黑方：通过...Bb4牵制白方马，削弱其对e4的保护；如果白方走a3，准备...Bxc3造成白方后翼兵结构弱点。"
      },
      {
        id: "french-tarrasch",
        name: "塔塔科维尔变例（塔拉什体系）",
        moves: "1.e4 e6 2.d4 d5 3.Nd2",
        strategy: "这是法兰西防御的一个重要分支。白方用Nd2而不是Nc3，避免了温纳维尔变例中的...Bb4牵制。这一体系更加稳健，白方准备后续的c2-c3和Ngf3。",
        goals: "白方：保持中心的灵活性，准备c2-c3加强d4兵；避免温纳维尔变例的复杂战术，转向更具战略性的战斗。"
      }
    ],
    traps: [
      {
        id: "french-mckenzie-trap",
        name: "麦肯齐陷阱",
        description: "这是法兰西防御中一个经典的战术陷阱。黑方看似白白送掉e6兵，实则设置了一个漂亮的将死组合。",
        counterplay: "白方应该避免贪婪地吃掉e6兵，或者在吃兵前仔细计算。更安全的选择是继续发展子力或加强中心。",
        moves: "1.e4 e6 2.d4 d5 3.Nc3 Nf6 4.Bg5 dxe4 5.Nxe4 Be7 6.Bxf6 Bxf6 7.Qh5 g6 8.Qxe6+ Kf8 9.Qxf6 Qe7+"
      }
    ]
  }
];

export const getOpeningById = (id: string): Opening | undefined => {
  return openings.find(opening => opening.id === id);
};

export const getVariationById = (openingId: string, variationId: string): Variation | undefined => {
  const opening = getOpeningById(openingId);
  return opening?.variations.find(variation => variation.id === variationId);
};

export const getTrapById = (openingId: string, trapId: string): Trap | undefined => {
  const opening = getOpeningById(openingId);
  return opening?.traps.find(trap => trap.id === trapId);
};
