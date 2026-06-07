/**
 * 行程状态类型
 * draft: 草稿
 * pending: 待审批
 * approved: 已批准
 * rejected: 已拒绝
 * in_progress: 进行中
 * completed: 已完成
 */
export type ItineraryStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed'

/**
 * 交通方式类型
 * flight: 飞机
 * train: 火车
 * car: 自驾
 * taxi: 出租车
 * other: 其他
 */
export type TransportationType = 'flight' | 'train' | 'car' | 'taxi' | 'other'

/**
 * 目的地接口
 */
export interface Destination {
  /** 目的地ID */
  id: string
  /** 关联的行程ID */
  itineraryId: string
  /** 城市名称 */
  city: string
  /** 行程顺序 */
  sequence: number
  /** 到达日期 */
  arriveDate: string
  /** 离开日期 */
  leaveDate: string
}

/**
 * 交通信息接口
 */
export interface Transportation {
  /** 交通记录ID */
  id: string
  /** 关联的行程ID */
  itineraryId: string
  /** 交通方式 */
  type: TransportationType
  /** 出发城市 */
  fromCity: string
  /** 到达城市 */
  toCity: string
  /** 出发时间 */
  departTime: string
  /** 到达时间 */
  arriveTime: string
  /** 班次/车牌号 */
  transportNo: string
  /** 费用 */
  cost: number
}

/**
 * 住宿信息接口
 */
export interface Accommodation {
  /** 住宿记录ID */
  id: string
  /** 关联的行程ID */
  itineraryId: string
  /** 酒店名称 */
  hotelName: string
  /** 酒店地址 */
  address: string
  /** 入住时间 */
  checkIn: string
  /** 退房时间 */
  checkOut: string
  /** 住宿费用 */
  cost: number
}

/**
 * 拜访记录接口
 */
export interface Visit {
  /** 拜访记录ID */
  id: string
  /** 关联的行程ID */
  itineraryId: string
  /** 客户名称 */
  clientName: string
  /** 拜访地址 */
  address: string
  /** 拜访时间 */
  time: string
  /** 拜访目的 */
  purpose: string
  /** 联系人 */
  contact: string
}

/**
 * 行程接口
 */
export interface Itinerary {
  /** 行程ID */
  id: string
  /** 用户ID */
  userId: string
  /** 行程标题 */
  title: string
  /** 行程目的 */
  purpose: string
  /** 开始日期 */
  startDate: string
  /** 结束日期 */
  endDate: string
  /** 预算 */
  budget: number
  /** 行程状态 */
  status: ItineraryStatus
  /** 目的地列表 */
  destinations: Destination[]
  /** 交通列表 */
  transportations: Transportation[]
  /** 住宿列表 */
  accommodations: Accommodation[]
  /** 拜访列表 */
  visits: Visit[]
  /** 创建时间 */
  createdAt: string
}
