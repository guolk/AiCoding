import type { InvoiceImage } from './common'

/**
 * 费用类别类型
 * transport: 交通
 * accommodation: 住宿
 * food: 餐饮
 * entertainment: 招待
 * other: 其他
 */
export type ExpenseCategory = 'transport' | 'accommodation' | 'food' | 'entertainment' | 'other'

/**
 * 费用状态类型
 * unsubmitted: 未提交
 * pending: 待审批
 * approved: 已批准
 * rejected: 已拒绝
 * reimbursed: 已报销
 */
export type ExpenseStatus = 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'reimbursed'

/**
 * 费用记录接口
 */
export interface Expense {
  /** 费用ID */
  id: string
  /** 关联的行程ID（可选） */
  itineraryId?: string
  /** 费用类别 */
  category: ExpenseCategory
  /** 金额 */
  amount: number
  /** 消费日期 */
  expenseDate: string
  /** 费用说明 */
  description: string
  /** 商家名称（可选） */
  merchant?: string
  /** 发票图片列表 */
  images: InvoiceImage[]
  /** 费用状态 */
  status: ExpenseStatus
  /** 创建时间 */
  createdAt: string
}
