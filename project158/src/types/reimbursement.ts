import type { Approval } from './common'

/**
 * 报销单状态类型
 * draft: 草稿
 * submitted: 已提交
 * reviewing: 审批中
 * paid: 已付款
 * rejected: 已拒绝
 */
export type ReimbursementStatus = 'draft' | 'submitted' | 'reviewing' | 'paid' | 'rejected'

/**
 * 报销明细接口
 */
export interface ReimbursementItem {
  /** 明细ID */
  id: string
  /** 关联的报销单ID */
  reimbursementId: string
  /** 关联的费用ID */
  expenseId: string
  /** 报销金额 */
  amount: number
}

/**
 * 报销单状态流转记录
 */
export interface ReimbursementStatusLog {
  /** 记录ID */
  id: string
  /** 关联的报销单ID */
  reimbursementId: string
  /** 状态 */
  status: ReimbursementStatus
  /** 操作人ID */
  operatorId: string
  /** 操作人姓名 */
  operatorName: string
  /** 操作时间 */
  time: string
  /** 备注/意见 */
  comment?: string
}

/**
 * 报销单接口
 */
export interface Reimbursement {
  /** 报销单ID */
  id: string
  /** 申请人ID */
  applicantId: string
  /** 申请人姓名 */
  applicantName?: string
  /** 报销单标题 */
  title: string
  /** 报销总金额 */
  totalAmount: number
  /** 报销明细列表 */
  items: ReimbursementItem[]
  /** 报销单状态 */
  status: ReimbursementStatus
  /** 提交时间（可选） */
  submitTime?: string
  /** 审核时间 */
  reviewTime?: string
  /** 打款时间 */
  paidTime?: string
  /** 打款金额 */
  paidAmount?: number
  /** 驳回原因 */
  rejectReason?: string
  /** 审批记录列表 */
  approvals: Approval[]
  /** 状态流转记录 */
  statusLogs: ReimbursementStatusLog[]
  /** 关联的行程ID（可选） */
  itineraryId?: string
  /** 创建时间 */
  createdAt: string
}
