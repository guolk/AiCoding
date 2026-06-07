/**
 * 项目类型定义
 * 包含民宿改造项目管理系统的所有数据模型
 */

// 项目状态枚举
export type ProjectStatus = 'planning' | 'design' | 'construction' | 'completed';

// 房间类型枚举
export type RoomType = 'bedroom' | 'living' | 'kitchen' | 'bathroom' | 'balcony' | 'other';

// 功能区域类型枚举
export type FunctionAreaType = 'bed' | 'work' | 'rest' | 'bath' | 'storage' | 'other';

// 设计版本状态枚举
export type DesignVersionStatus = 'draft' | 'review' | 'approved' | 'final';

// 设计元素分类枚举
export type DesignElementCategory = 'furniture' | 'soft-decor' | 'lighting' | 'decoration' | 'appliance';

// 设计元素状态枚举
export type DesignElementStatus = 'pending' | 'ordered' | 'delivered' | 'installed';

// 预算分类名称枚举
export type BudgetCategoryName = '硬装' | '软装' | '家具' | '家电' | '装饰';

// 施工任务类型枚举
export type ConstructionTaskType = 'waterproof' | 'electrical' | 'tiling' | 'carpentry' | 'painting' | 'soft-decoration';

// 施工任务状态枚举
export type ConstructionTaskStatus = 'pending' | 'in-progress' | 'completed' | 'delayed';

// 问题严重程度枚举
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

// 问题状态枚举
export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

/**
 * 项目接口
 * 存储项目的基本信息
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  totalBudget: number;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * 房间接口
 * 存储房间的基本信息和平面图数据
 */
export interface Room {
  id: string;
  projectId: string;
  name: string;
  type: RoomType;
  width: number;
  height: number;
  floorPlanData: string;
  functionAreas: FunctionArea[];
}

/**
 * 功能区域接口
 * 存储房间内的功能区域划分信息
 */
export interface FunctionArea {
  id: string;
  roomId: string;
  type: FunctionAreaType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  efficiencyScore?: number;
}

/**
 * 设计版本接口
 * 存储设计方案的版本信息
 */
export interface DesignVersion {
  id: string;
  projectId: string;
  versionNumber: string;
  name: string;
  description: string;
  status: DesignVersionStatus;
  createdAt: string;
  elements: DesignElement[];
  moodBoardImages: MoodBoardImage[];
}

/**
 * 设计元素接口
 * 存储设计方案中的具体元素信息
 */
export interface DesignElement {
  id: string;
  versionId: string;
  roomId: string;
  category: DesignElementCategory;
  name: string;
  description: string;
  quantity: number;
  estimatedPrice: number;
  supplier?: string;
  status: DesignElementStatus;
}

/**
 * 风格图板图片接口
 * 存储设计版本中的参考图片信息
 */
export interface MoodBoardImage {
  id: string;
  versionId: string;
  url: string;
  name: string;
  description?: string;
  createdAt: string;
}

/**
 * 预算分类接口
 * 存储预算的分类信息
 */
export interface BudgetCategory {
  id: string;
  projectId: string;
  name: BudgetCategoryName;
  allocatedAmount: number;
  spentAmount: number;
}

/**
 * 支出记录接口
 * 存储具体的支出信息
 */
export interface Expense {
  id: string;
  projectId: string;
  categoryId: string;
  description: string;
  amount: number;
  date: string;
  supplier: string;
  receiptUrl?: string;
  notes?: string;
}

/**
 * 施工任务接口
 * 存储施工任务的进度信息
 */
export interface ConstructionTask {
  id: string;
  projectId: string;
  name: string;
  type: ConstructionTaskType;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  progress: number;
  status: ConstructionTaskStatus;
  dependencies: string[];
  assignee?: string;
}

/**
 * 施工问题接口
 * 存储施工过程中发现的问题信息
 */
export interface Issue {
  id: string;
  projectId: string;
  taskId?: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  images: string[];
  rectificationRequired: string;
  createdAt: string;
  resolvedAt?: string;
}

/**
 * 供应商接口
 * 存储供应商的基本信息
 */
export interface Supplier {
  id: string;
  projectId: string;
  name: string;
  contact: string;
  phone: string;
  category: string;
  rating: number;
  quotations: Quotation[];
}

/**
 * 报价接口
 * 存储供应商提供的报价信息
 */
export interface Quotation {
  id: string;
  supplierId: string;
  itemName: string;
  price: number;
  specs: string;
  validUntil: string;
  isRecommended: boolean;
}
