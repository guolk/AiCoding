/**
 * 用户角色类型
 * employee: 普通员工
 * manager: 部门经理
 * finance: 财务人员
 * admin: 系统管理员
 */
export type UserRole = 'employee' | 'manager' | 'finance' | 'admin'

/**
 * 用户信息接口
 */
export interface User {
  /** 用户ID */
  id: string
  /** 用户姓名 */
  name: string
  /** 用户邮箱 */
  email: string
  /** 用户头像URL（可选） */
  avatar?: string
  /** 用户角色 */
  role: UserRole
  /** 所属部门 */
  department: string
}

/**
 * 发票图片接口
 */
export interface InvoiceImage {
  /** 图片ID */
  id: string
  /** 关联的费用ID */
  expenseId: string
  /** 图片URL */
  url: string
  /** 文件名称 */
  fileName: string
  /** 文件大小（字节） */
  fileSize: number
  /** 上传时间 */
  uploadTime: string
}

/**
 * 审批记录接口
 */
export interface Approval {
  /** 审批记录ID */
  id: string
  /** 关联的报销单ID */
  reimbursementId: string
  /** 审批人ID */
  approverId: string
  /** 审批动作：approve-同意 reject-拒绝 */
  action: 'approve' | 'reject'
  /** 审批意见 */
  comment: string
  /** 审批时间 */
  time: string
}
