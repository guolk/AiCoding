// 微生物菌株管理系统 - 全局类型定义
// 基于技术架构文档ER图字段设计

// UUID字符串类型别名
export type UUID = string;

// 菌株档案实体
export interface Strain {
  id: UUID;                    // 主键UUID
  code: string;                // 菌株编号
  name: string;                // 菌株名称
  source: string;              // 菌株来源
  taxonomy: string;            // 分类学信息（门纲目科属种）
  cultureConditions: string;   // 培养条件（温度、pH等）
  safetyLevel: number;         // 生物安全等级（1-4级）
  createdAt: string;           // 创建日期（ISO格式）
  operator: string;            // 操作人
}

// 传代记录实体
export interface Passage {
  id: UUID;                    // 主键UUID
  strainId: UUID;              // 外键：关联菌株ID
  passageDate: string;         // 传代日期（ISO格式）
  generation: number;          // 代数（第几代）
  operator: string;            // 操作人
  notes: string;               // 备注信息
}

// 表型特征实体
export interface Phenotype {
  id: UUID;                    // 主键UUID
  strainId: UUID;              // 外键：关联菌株ID
  colonyMorphology: string;    // 菌落形态描述
  gramStain: string;           // 革兰氏染色结果（阳性/阴性/不适用）
  motility: string;            // 运动性（有/无/弱）
  size: string;                // 菌体大小（μm级）
  shape: string;               // 菌体形状（杆状/球状/弧形等）
  color: string;               // 菌落颜色
  otherFeatures: string;       // 其他特征描述
}

// 培养基配方实体
export interface Medium {
  id: UUID;                    // 主键UUID
  name: string;                // 培养基名称
  formula: string;             // 配方成分及比例
  sterilizationMethod: string; // 灭菌方法（高压蒸汽/过滤/干热等）
  phValue: number;             // pH值
  createdAt: string;           // 创建日期（ISO格式）
}

// 培养记录实体
export interface Culture {
  id: UUID;                    // 主键UUID
  strainId: UUID;              // 外键：关联菌株ID
  mediumId: UUID;              // 外键：关联培养基ID
  inoculumVolume: number;      // 接种量（mL）
  temperature: number;         // 培养温度（℃）
  durationHours: number;       // 培养时长（小时）
  aeration: string;            // 通气条件（好氧/厌氧/微需氧）
  growthRate: string;          // 生长速率评级（快/中/慢）
  morphologyObservation: string; // 形态观察记录
  densityOd600: number;        // OD600光密度值
  notes: string;               // 备注信息
}

// 实验记录实体
export interface Experiment {
  id: UUID;                    // 主键UUID
  strainId: UUID;              // 外键：关联菌株ID
  title: string;               // 实验标题
  purpose: string;             // 实验目的
  protocol: string;            // 实验方案/步骤
  data: string;                // 原始数据记录
  conclusion: string;          // 实验结论
  status: string;              // 实验状态（进行中/已完成/已取消/待审核）
  date: string;                // 实验日期（ISO格式）
  operator: string;            // 操作人
}

// 实验重复性记录实体
export interface ExperimentRepeat {
  id: UUID;                    // 主键UUID
  experimentId: UUID;          // 外键：关联实验ID
  repeatNo: number;            // 重复次数编号（第几次重复）
  dataSummary: string;         // 本次重复数据摘要
  consistencyScore: number;    // 一致性评分（0-100分）
  date: string;                // 重复实验日期（ISO格式）
}

// 对照组记录实体
export interface Control {
  id: UUID;                    // 主键UUID
  experimentId: UUID;          // 外键：关联实验ID
  type: string;                // 对照类型（空白对照/阳性对照/阴性对照）
  setup: string;               // 对照组设置说明
  result: string;              // 对照组结果
}

// 储存位置实体
export interface Storage {
  id: UUID;                    // 主键UUID
  strainId: UUID | null;       // 外键：关联菌株ID（空表示空位）
  fridgeCode: string;          // 冰箱编号
  boxCode: string;             // 冻存盒编号
  position: string;            // 位置坐标（如A1、B5等）
  status: string;              // 储存状态（正常/已取出/需补充）
}

// 冻存核查记录实体
export interface AuditLog {
  id: UUID;                    // 主键UUID
  storageId: UUID;             // 外键：关联储存位置ID
  auditDate: string;           // 核查日期（ISO格式）
  viability: string;           // 活性检测结果（良好/一般/较差/失效）
  needsRefresh: boolean;       // 是否需要传代补充
  operator: string;            // 核查操作人
}

// 销毁记录实体
export interface Disposal {
  id: UUID;                    // 主键UUID
  strainId: UUID;              // 外键：关联菌株ID
  reason: string;              // 销毁原因
  operator: string;            // 申请人/操作人
  approver: string;            // 审批人
  date: string;                // 销毁日期（ISO格式）
}
