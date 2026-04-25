import { PhysicsFormula } from '../types';

export const physicsFormulas: PhysicsFormula[] = [
  {
    id: 'uniform-linear-motion',
    name: '匀速直线运动',
    category: '物理',
    formula: 's = s₀ + v·t',
    latex: 's = s_0 + v \\cdot t',
    description: '匀速直线运动是最简单的机械运动，指物体在一条直线上运动，且在任意相等的时间间隔内通过的位移相等。速度 v 保持不变。',
    explanation: [
      {
        title: '公式含义',
        content: '在匀速直线运动公式 s = s₀ + v·t 中，s 是 t 时刻的位置，s₀ 是初始位置（t=0 时的位置），v 是速度，t 是时间。速度表示物体在单位时间内通过的位移。'
      },
      {
        title: '参数说明',
        content: '初始位置 s₀：物体在 t=0 时刻的位置。速度 v：物体运动的快慢和方向，v > 0 表示向正方向运动，v < 0 表示向负方向运动。时间 t：运动的持续时间。'
      },
      {
        title: '应用场景',
        content: '匀速直线运动在实际生活中有很多应用，如火车在平直轨道上匀速行驶、汽车在高速公路上定速巡航、传送带匀速传送物品等。'
      }
    ],
    parameters: [
      {
        name: 's0',
        label: '初始位置',
        symbol: 's₀',
        defaultValue: 0,
        min: -50,
        max: 50,
        step: 1,
        unit: 'm',
        description: '初始时刻的位置'
      },
      {
        name: 'v',
        label: '速度',
        symbol: 'v',
        defaultValue: 5,
        min: -10,
        max: 10,
        step: 0.5,
        unit: 'm/s',
        description: '物体运动的速度'
      }
    ],
    chartType: 'line',
    animationType: 'point',
    variables: [
      {
        name: 'time',
        symbol: 't',
        default: 10,
        unit: 's',
        description: '运动时间'
      }
    ],
    simulate: (time: number, params: Record<string, number>) => {
      const s = params.s0 + params.v * time;
      return {
        position: s,
        velocity: params.v,
        displacement: s - params.s0
      };
    },
    applicationScenarios: [
      '火车在平直轨道上匀速行驶',
      '汽车在高速公路上定速巡航',
      '传送带匀速传送物品'
    ]
  },
  {
    id: 'free-fall-motion',
    name: '自由落体运动',
    category: '物理',
    formula: 'h = h₀ - ½·g·t², v = g·t',
    latex: 'h = h_0 - \\frac{1}{2} \\cdot g \\cdot t^2, \\quad v = g \\cdot t',
    description: '自由落体运动是指物体只在重力作用下从静止开始下落的运动。这是初速度为 0、加速度为重力加速度 g 的匀加速直线运动。',
    explanation: [
      {
        title: '公式含义',
        content: '自由落体运动中，高度 h = h₀ - ½·g·t²，速度 v = g·t。其中 h₀ 是初始高度，g 是重力加速度（约为 9.8 m/s²），t 是下落时间。物体下落的距离与时间的平方成正比。'
      },
      {
        title: '参数说明',
        content: '初始高度 h₀：物体开始下落时的高度。重力加速度 g：地球上的重力加速度约为 9.8 m/s²。时间 t：物体下落的时间。'
      },
      {
        title: '应用场景',
        content: '自由落体运动在实际生活中有很多应用，如跳伞运动、物体从高处掉落、建筑施工中的重物下落等。'
      }
    ],
    parameters: [
      {
        name: 'h0',
        label: '初始高度',
        symbol: 'h₀',
        defaultValue: 100,
        min: 10,
        max: 500,
        step: 1,
        unit: 'm',
        description: '物体开始下落时的高度'
      },
      {
        name: 'g',
        label: '重力加速度',
        symbol: 'g',
        defaultValue: 9.8,
        min: 1,
        max: 20,
        step: 0.1,
        unit: 'm/s²',
        description: '重力加速度'
      }
    ],
    chartType: 'line',
    animationType: 'point',
    variables: [
      {
        name: 'time',
        symbol: 't',
        default: 5,
        unit: 's',
        description: '下落时间'
      }
    ],
    simulate: (time: number, params: Record<string, number>) => {
      const h = Math.max(0, params.h0 - 0.5 * params.g * time * time);
      const v = h > 0 ? params.g * time : 0;
      return {
        height: h,
        velocity: v,
        distanceFallen: params.h0 - h
      };
    },
    applicationScenarios: [
      '跳伞运动（打开降落伞前）',
      '物体从高处掉落',
      '建筑施工中的重物下落'
    ]
  },
  {
    id: 'ohms-law',
    name: '欧姆定律',
    category: '物理',
    formula: 'I = U / R',
    latex: 'I = \\frac{U}{R}',
    description: '欧姆定律是电路学中的基本定律之一，由德国物理学家欧姆于 1827 年发现。该定律指出，在同一电路中，通过某段导体的电流与这段导体两端的电压成正比，与这段导体的电阻成反比。',
    explanation: [
      {
        title: '公式含义',
        content: '欧姆定律 I = U / R 中，I 是电流强度（单位：安培 A），U 是电压（单位：伏特 V），R 是电阻（单位：欧姆 Ω）。这个公式也可以写成 U = I·R 或 R = U / I，分别用于计算电压和电阻。'
      },
      {
        title: '参数说明',
        content: '电压 U：推动电荷流动的电势差。电阻 R：导体对电流的阻碍作用。电流 I：单位时间内通过导体横截面的电荷量。当电阻不变时，电流与电压成正比；当电压不变时，电流与电阻成反比。'
      },
      {
        title: '应用场景',
        content: '欧姆定律是电路分析的基础，广泛应用于电子电路设计、电力系统分析、家用电器设计等领域。'
      }
    ],
    parameters: [
      {
        name: 'U',
        label: '电压',
        symbol: 'U',
        defaultValue: 12,
        min: 0,
        max: 100,
        step: 0.5,
        unit: 'V',
        description: '导体两端的电压'
      },
      {
        name: 'R',
        label: '电阻',
        symbol: 'R',
        defaultValue: 4,
        min: 0.1,
        max: 100,
        step: 0.1,
        unit: 'Ω',
        description: '导体的电阻'
      }
    ],
    chartType: 'line',
    animationType: 'curve',
    variables: [],
    simulate: (_time: number, params: Record<string, number>) => {
      const I = params.U / params.R;
      const P = params.U * I;
      return {
        current: I,
        voltage: params.U,
        resistance: params.R,
        power: P
      };
    },
    applicationScenarios: [
      '电子电路设计与分析',
      '电力系统计算',
      '家用电器设计'
    ]
  },
  {
    id: 'simple-harmonic-motion',
    name: '简谐运动',
    category: '物理',
    formula: 'x = A·cos(ωt + φ), v = -Aω·sin(ωt + φ)',
    latex: 'x = A \\cdot \\cos(\\omega t + \\phi), \\quad v = -A\\omega \\cdot \\sin(\\omega t + \\phi)',
    description: '简谐运动是最基本、最简单的机械振动。当物体进行简谐运动时，物体所受的力与位移成正比，并且力总是指向平衡位置。典型的简谐运动包括弹簧振子和单摆（小角度摆动）。',
    explanation: [
      {
        title: '公式含义',
        content: '简谐运动的位移公式 x = A·cos(ωt + φ) 中，A 是振幅（最大位移），ω 是角频率（ω = 2πf = 2π/T），φ 是初相位，t 是时间。速度公式 v = -Aω·sin(ωt + φ)，加速度 a = -ω²·x。'
      },
      {
        title: '参数说明',
        content: '振幅 A：物体偏离平衡位置的最大距离。角频率 ω：描述振动的快慢，ω 越大振动越快。初相位 φ：描述 t=0 时刻物体的位置和运动方向。周期 T = 2π/ω，频率 f = 1/T。'
      },
      {
        title: '应用场景',
        content: '简谐运动广泛存在于自然界和工程中，如弹簧振子、单摆、乐器的振动、交流电的电压电流变化等。'
      }
    ],
    parameters: [
      {
        name: 'A',
        label: '振幅',
        symbol: 'A',
        defaultValue: 5,
        min: 0.1,
        max: 20,
        step: 0.1,
        unit: 'm',
        description: '最大位移'
      },
      {
        name: 'omega',
        label: '角频率',
        symbol: 'ω',
        defaultValue: 2,
        min: 0.1,
        max: 10,
        step: 0.1,
        unit: 'rad/s',
        description: '振动的角频率'
      },
      {
        name: 'phi',
        label: '初相位',
        symbol: 'φ',
        defaultValue: 0,
        min: 0,
        max: 2 * Math.PI,
        step: 0.1,
        unit: 'rad',
        description: '初始相位'
      }
    ],
    chartType: 'line',
    animationType: 'wave',
    variables: [
      {
        name: 'time',
        symbol: 't',
        default: 10,
        unit: 's',
        description: '振动时间'
      }
    ],
    simulate: (time: number, params: Record<string, number>) => {
      const x = params.A * Math.cos(params.omega * time + params.phi);
      const v = -params.A * params.omega * Math.sin(params.omega * time + params.phi);
      const a = -params.omega * params.omega * x;
      const T = (2 * Math.PI) / params.omega;
      const f = 1 / T;
      return {
        position: x,
        velocity: v,
        acceleration: a,
        period: T,
        frequency: f
      };
    },
    applicationScenarios: [
      '弹簧振子的振动',
      '单摆的小角度摆动',
      '乐器的振动发声'
    ]
  },
  {
    id: 'projectile-motion',
    name: '抛体运动',
    category: '物理',
    formula: 'x = v₀·cosθ·t, y = h₀ + v₀·sinθ·t - ½·g·t²',
    latex: 'x = v_0 \\cdot \\cos\\theta \\cdot t, \\quad y = h_0 + v_0 \\cdot \\sin\\theta \\cdot t - \\frac{1}{2} \\cdot g \\cdot t^2',
    description: '抛体运动是指物体以一定的初速度抛出后，只在重力作用下所做的运动。抛体运动可以分解为水平方向的匀速直线运动和竖直方向的匀变速直线运动（自由落体或竖直上抛）。',
    explanation: [
      {
        title: '公式含义',
        content: '抛体运动的水平位移 x = v₀·cosθ·t，竖直位移 y = h₀ + v₀·sinθ·t - ½·g·t²。其中 v₀ 是初速度，θ 是抛射角，h₀ 是初始高度，g 是重力加速度。水平方向速度不变，竖直方向速度 v_y = v₀·sinθ - g·t。'
      },
      {
        title: '参数说明',
        content: '初速度 v₀：物体被抛出时的速度大小。抛射角 θ：初速度方向与水平方向的夹角。初始高度 h₀：物体被抛出时的高度。当 θ = 0° 时是平抛运动，当 θ = 90° 时是竖直上抛运动。'
      },
      {
        title: '应用场景',
        content: '抛体运动在实际生活中有很多应用，如体育运动中的投掷项目（铅球、标枪等）、炮弹发射、篮球投篮、喷泉的水流轨迹等。'
      }
    ],
    parameters: [
      {
        name: 'v0',
        label: '初速度',
        symbol: 'v₀',
        defaultValue: 20,
        min: 5,
        max: 50,
        step: 0.5,
        unit: 'm/s',
        description: '物体被抛出时的速度'
      },
      {
        name: 'theta',
        label: '抛射角',
        symbol: 'θ',
        defaultValue: 45,
        min: 0,
        max: 90,
        step: 1,
        unit: '°',
        description: '初速度与水平方向的夹角'
      },
      {
        name: 'h0',
        label: '初始高度',
        symbol: 'h₀',
        defaultValue: 0,
        min: 0,
        max: 100,
        step: 1,
        unit: 'm',
        description: '初始高度'
      },
      {
        name: 'g',
        label: '重力加速度',
        symbol: 'g',
        defaultValue: 9.8,
        min: 1,
        max: 20,
        step: 0.1,
        unit: 'm/s²',
        description: '重力加速度'
      }
    ],
    chartType: 'line',
    animationType: 'point',
    variables: [
      {
        name: 'time',
        symbol: 't',
        default: 5,
        unit: 's',
        description: '运动时间'
      }
    ],
    simulate: (time: number, params: Record<string, number>) => {
      const thetaRad = (params.theta * Math.PI) / 180;
      const x = params.v0 * Math.cos(thetaRad) * time;
      const y = params.h0 + params.v0 * Math.sin(thetaRad) * time - 0.5 * params.g * time * time;
      const vx = params.v0 * Math.cos(thetaRad);
      const vy = params.v0 * Math.sin(thetaRad) - params.g * time;
      const v = Math.sqrt(vx * vx + vy * vy);
      return {
        x,
        y,
        vx,
        vy,
        velocity: v
      };
    },
    applicationScenarios: [
      '体育运动中的投掷项目',
      '炮弹发射',
      '篮球投篮'
    ]
  }
];
