import { MathFormula } from '../types';

export const mathFormulas: MathFormula[] = [
  {
    id: 'linear-function',
    name: '一次函数',
    category: '数学',
    formula: 'y = kx + b',
    latex: 'y = kx + b',
    description: '一次函数是函数的一种，一般形如 y = kx + b（k，b 是常数，k≠0），其中 x 是自变量，y 是因变量。',
    explanation: [
      {
        title: '公式含义',
        content: '在一次函数 y = kx + b 中，k 称为斜率，表示直线的倾斜程度；b 称为截距，表示直线与 y 轴的交点。当 k > 0 时，直线从左下方向右上方倾斜；当 k < 0 时，直线从左上方向右下方倾斜。'
      },
      {
        title: '参数说明',
        content: '斜率 k：决定直线的倾斜程度，k 的绝对值越大，直线越陡峭。截距 b：决定直线与 y 轴的交点位置，b > 0 时交点在 y 轴正方向，b < 0 时在负方向。'
      },
      {
        title: '应用场景',
        content: '一次函数在实际生活中有广泛应用，如匀速直线运动的路程计算、物品单价与总价的关系、弹簧的伸长量与拉力的关系等。'
      }
    ],
    parameters: [
      {
        name: 'k',
        label: '斜率',
        symbol: 'k',
        defaultValue: 1,
        min: -5,
        max: 5,
        step: 0.1,
        description: '直线的斜率，决定倾斜程度'
      },
      {
        name: 'b',
        label: '截距',
        symbol: 'b',
        defaultValue: 0,
        min: -10,
        max: 10,
        step: 0.5,
        description: '直线与 y 轴的截距'
      }
    ],
    chartType: 'line',
    animationType: 'point',
    domain: { min: -10, max: 10 },
    calculate: (x: number, params: Record<string, number>) => {
      return params.k * x + params.b;
    },
    applicationScenarios: [
      '匀速运动：路程 = 速度 × 时间 + 初始位置',
      '成本计算：总成本 = 单位成本 × 数量 + 固定成本',
      '温度转换：华氏温度 = 9/5 × 摄氏温度 + 32'
    ]
  },
  {
    id: 'quadratic-function',
    name: '二次函数',
    category: '数学',
    formula: 'y = ax² + bx + c',
    latex: 'y = ax^2 + bx + c',
    description: '二次函数的基本表示形式为 y = ax² + bx + c（a≠0）。二次函数的图像是一条对称轴与 y 轴平行或重合于 y 轴的抛物线。',
    explanation: [
      {
        title: '公式含义',
        content: '二次函数 y = ax² + bx + c 中，a 决定抛物线的开口方向和大小：a > 0 时开口向上，a < 0 时开口向下。对称轴为 x = -b/(2a)，顶点坐标为 (-b/(2a), (4ac - b²)/(4a))。'
      },
      {
        title: '参数说明',
        content: '参数 a：决定抛物线的开口方向和陡峭程度。参数 b：影响抛物线的对称轴位置。参数 c：决定抛物线与 y 轴的交点。'
      },
      {
        title: '应用场景',
        content: '二次函数常用于描述抛物运动、利润最大化问题、面积优化问题等实际应用场景。'
      }
    ],
    parameters: [
      {
        name: 'a',
        label: '二次项系数',
        symbol: 'a',
        defaultValue: 1,
        min: -3,
        max: 3,
        step: 0.1,
        description: '决定抛物线开口方向和大小'
      },
      {
        name: 'b',
        label: '一次项系数',
        symbol: 'b',
        defaultValue: 0,
        min: -10,
        max: 10,
        step: 0.5,
        description: '影响对称轴位置'
      },
      {
        name: 'c',
        label: '常数项',
        symbol: 'c',
        defaultValue: 0,
        min: -10,
        max: 10,
        step: 0.5,
        description: '与 y 轴的截距'
      }
    ],
    chartType: 'line',
    animationType: 'curve',
    domain: { min: -10, max: 10 },
    calculate: (x: number, params: Record<string, number>) => {
      return params.a * x * x + params.b * x + params.c;
    },
    applicationScenarios: [
      '抛体运动：物体高度随时间的变化',
      '利润最大化：销售价格与利润的关系',
      '面积优化：给定周长时面积最大的矩形'
    ]
  },
  {
    id: 'sine-function',
    name: '正弦函数',
    category: '数学',
    formula: 'y = A sin(Bx + C) + D',
    latex: 'y = A \\sin(Bx + C) + D',
    description: '正弦函数是三角函数的一种，在直角三角形中，对边与斜边的比值称为正弦。正弦函数是周期函数，其最小正周期为 2π。',
    explanation: [
      {
        title: '公式含义',
        content: '正弦函数 y = A sin(Bx + C) + D 中，A 是振幅（最大值与最小值之差的一半），B 影响周期（周期 T = 2π/|B|），C 是相位偏移，D 是垂直偏移。'
      },
      {
        title: '参数说明',
        content: '振幅 A：决定波形的高度，A > 0。周期参数 B：B 越大，周期越短，波形越密集。相位 C：左右移动波形。偏移 D：上下移动波形。'
      },
      {
        title: '应用场景',
        content: '正弦函数广泛应用于描述周期性现象，如简谐运动、交流电、声波、光波等。'
      }
    ],
    parameters: [
      {
        name: 'A',
        label: '振幅',
        symbol: 'A',
        defaultValue: 1,
        min: 0.1,
        max: 5,
        step: 0.1,
        description: '波形的振幅，决定高度'
      },
      {
        name: 'B',
        label: '频率参数',
        symbol: 'B',
        defaultValue: 1,
        min: 0.1,
        max: 5,
        step: 0.1,
        description: '影响周期，B越大周期越短'
      },
      {
        name: 'C',
        label: '相位',
        symbol: 'C',
        defaultValue: 0,
        min: -2 * Math.PI,
        max: 2 * Math.PI,
        step: 0.1,
        description: '相位偏移，左右移动'
      },
      {
        name: 'D',
        label: '垂直偏移',
        symbol: 'D',
        defaultValue: 0,
        min: -5,
        max: 5,
        step: 0.5,
        description: '垂直方向的偏移量'
      }
    ],
    chartType: 'line',
    animationType: 'wave',
    domain: { min: -4 * Math.PI, max: 4 * Math.PI },
    calculate: (x: number, params: Record<string, number>) => {
      return params.A * Math.sin(params.B * x + params.C) + params.D;
    },
    applicationScenarios: [
      '简谐运动：弹簧振子、单摆的运动',
      '交流电：电压和电流的周期性变化',
      '声波：声音的传播和振动'
    ]
  },
  {
    id: 'exponential-function',
    name: '指数函数',
    category: '数学',
    formula: 'y = a · b^x',
    latex: 'y = a \\cdot b^x',
    description: '指数函数是数学中重要的函数，一般形式为 y = a · b^x（其中 a > 0，b > 0 且 b ≠ 1）。当 b > 1 时，指数函数单调递增；当 0 < b < 1 时，单调递减。',
    explanation: [
      {
        title: '公式含义',
        content: '指数函数 y = a · b^x 中，a 是初始值（当 x = 0 时，y = a），b 是底数。当 b > 1 时，函数值随着 x 的增加而呈指数增长；当 0 < b < 1 时，函数值随着 x 的增加而呈指数衰减。'
      },
      {
        title: '参数说明',
        content: '底数 b：决定增长或衰减的速率。b > 1 时增长，b 越大增长越快；0 < b < 1 时衰减，b 越接近 0 衰减越快。系数 a：决定初始值和函数的缩放。'
      },
      {
        title: '应用场景',
        content: '指数函数常用于描述复利增长、人口增长、放射性衰变、细菌繁殖等现象。'
      }
    ],
    parameters: [
      {
        name: 'a',
        label: '初始值',
        symbol: 'a',
        defaultValue: 1,
        min: 0.1,
        max: 10,
        step: 0.1,
        description: '初始值，x=0时的函数值'
      },
      {
        name: 'b',
        label: '底数',
        symbol: 'b',
        defaultValue: 2,
        min: 0.1,
        max: 5,
        step: 0.1,
        description: '底数，决定增长/衰减速率'
      }
    ],
    chartType: 'line',
    animationType: 'curve',
    domain: { min: -5, max: 5 },
    calculate: (x: number, params: Record<string, number>) => {
      return params.a * Math.pow(params.b, x);
    },
    applicationScenarios: [
      '复利计算：本金 + 利息的增长',
      '人口增长：不受限制的人口增长模型',
      '放射性衰变：放射性物质的衰变过程'
    ]
  },
  {
    id: 'logarithmic-function',
    name: '对数函数',
    category: '数学',
    formula: 'y = a · log_b(x) + c',
    latex: 'y = a \\cdot \\log_b(x) + c',
    description: '对数函数是指数函数的反函数，一般形式为 y = log_b(x)（其中 b > 0 且 b ≠ 1）。对数函数的定义域是 x > 0，值域是全体实数。',
    explanation: [
      {
        title: '公式含义',
        content: '对数函数 y = a · log_b(x) + c 中，b 是底数，a 是垂直缩放因子，c 是垂直偏移。当 b > 1 时，函数单调递增；当 0 < b < 1 时，函数单调递减。'
      },
      {
        title: '参数说明',
        content: '底数 b：决定函数的增长速率。b > 1 时递增，b 越接近 1 增长越快；0 < b < 1 时递减。系数 a：决定垂直缩放，a < 0 时函数关于 x 轴对称。偏移 c：决定垂直偏移。'
      },
      {
        title: '应用场景',
        content: '对数函数常用于描述地震震级（里氏震级）、声音强度（分贝）、pH 值等需要压缩刻度的场景。'
      }
    ],
    parameters: [
      {
        name: 'a',
        label: '缩放因子',
        symbol: 'a',
        defaultValue: 1,
        min: -5,
        max: 5,
        step: 0.1,
        description: '垂直缩放因子'
      },
      {
        name: 'b',
        label: '底数',
        symbol: 'b',
        defaultValue: Math.E,
        min: 0.5,
        max: 10,
        step: 0.1,
        description: '对数的底数'
      },
      {
        name: 'c',
        label: '垂直偏移',
        symbol: 'c',
        defaultValue: 0,
        min: -5,
        max: 5,
        step: 0.5,
        description: '垂直方向的偏移量'
      }
    ],
    chartType: 'line',
    animationType: 'curve',
    domain: { min: 0.01, max: 10 },
    calculate: (x: number, params: Record<string, number>) => {
      if (params.b === Math.E) {
        return params.a * Math.log(x) + params.c;
      }
      return params.a * (Math.log(x) / Math.log(params.b)) + params.c;
    },
    applicationScenarios: [
      '里氏震级：地震能量的对数表示',
      '分贝：声音强度的对数刻度',
      'pH 值：溶液酸碱度的对数表示'
    ]
  }
];
