import dayjs from 'dayjs'
import type { User } from '@/types/common'
import type { Itinerary, Destination, Transportation, Accommodation, Visit, ItineraryStatus, TransportationType } from '@/types/itinerary'
import type { Expense, ExpenseCategory, ExpenseStatus } from '@/types/expense'
import type { Reimbursement, ReimbursementItem, ReimbursementStatus } from '@/types/reimbursement'

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const generateUser = (): User => {
  return {
    id: 'user_001',
    name: '张明',
    email: 'zhangming@company.com',
    avatar: '',
    role: 'employee',
    department: '技术部'
  }
}

const cityNames = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆', '天津', '苏州', '青岛', '厦门']

const itineraryTitles = [
  '华东区域客户拜访',
  '华南市场调研',
  '西南项目启动会',
  '华北技术交流',
  '供应商考察',
  '产品发布会',
  '季度业务回顾',
  '新客户洽谈'
]

const itineraryPurposes = [
  '客户关系维护与需求沟通',
  '市场趋势调研与竞品分析',
  '项目启动与技术方案确认',
  '技术架构交流与合作洽谈',
  '供应商资质审核与合作谈判',
  '新产品发布与客户培训',
  '季度业绩回顾与下季度规划',
  '新客户拓展与商务洽谈'
]

const hotelNames = [
  '希尔顿酒店', '万豪酒店', '洲际酒店', '香格里拉酒店',
  '喜来登酒店', '皇冠假日酒店', '凯悦酒店', '威斯汀酒店'
]

const clientNames = [
  '阿里巴巴集团', '腾讯科技', '字节跳动', '华为技术',
  '小米科技', '京东集团', '美团点评', '网易公司',
  '百度公司', '滴滴出行', '拼多多', '快手科技'
]

const visitPurposes = [
  '需求沟通与方案确认',
  '项目进度汇报',
  '技术方案评审',
  '合同签署与商务谈判',
  '产品演示与培训',
  '售后支持与问题解决'
]

const transportTypes: TransportationType[] = ['flight', 'train', 'car', 'taxi', 'other']

const transportNoMap: Record<TransportationType, string[]> = {
  flight: ['CA1234', 'MU5678', 'CZ9012', 'HU3456', 'SC7890'],
  train: ['G101', 'D302', 'C503', 'Z804', 'K605'],
  car: ['京A12345', '沪B67890', '粤C13579', '浙D24680'],
  taxi: ['出租车', '网约车'],
  other: ['大巴', '地铁', '轮渡']
}

const expenseDescriptions: Record<ExpenseCategory, string[]> = {
  transport: ['机票费用', '高铁票', '打车费', '租车费用', '地铁票', '机场大巴'],
  accommodation: ['酒店住宿费', '酒店服务费', '迷你吧消费'],
  food: ['商务宴请', '工作餐', '早餐', '午餐', '晚餐', '咖啡茶水'],
  entertainment: ['客户招待', '礼品购买', '娱乐活动'],
  other: ['办公用品', '快递费', '打印复印', '签证费用', '保险费']
}

const merchantNames = [
  '中国国际航空', '中国东方航空', '中国南方航空',
  '12306火车票', '滴滴出行', '美团打车',
  '携程旅行', '飞猪旅行', '同程旅行',
  '海底捞', '西贝莜面村', '外婆家',
  '星巴克', '瑞幸咖啡', '便利店',
  '顺丰速运', '京东快递', '办公用品店'
]

const statusSequence: ItineraryStatus[] = ['draft', 'pending', 'approved', 'in_progress', 'completed', 'draft', 'pending']

const reimbursementStatusSequence: ReimbursementStatus[] = ['draft', 'submitted', 'reviewing', 'paid', 'submitted']

const generateDestinations = (itineraryId: string, startDate: dayjs.Dayjs, cityCount: number): Destination[] => {
  const destinations: Destination[] = []
  const selectedCities: string[] = []
  let currentDate = startDate

  for (let i = 0; i < cityCount; i++) {
    let city: string
    do {
      city = cityNames[Math.floor(Math.random() * cityNames.length)]
    } while (selectedCities.includes(city))
    selectedCities.push(city)

    const stayDays = Math.floor(Math.random() * 2) + 1
    const arriveDate = currentDate.format('YYYY-MM-DD')
    const leaveDate = currentDate.add(stayDays, 'day').format('YYYY-MM-DD')

    destinations.push({
      id: generateId(),
      itineraryId,
      city,
      sequence: i + 1,
      arriveDate,
      leaveDate
    })

    currentDate = currentDate.add(stayDays, 'day')
  }

  return destinations
}

const generateTransportations = (itineraryId: string, destinations: Destination[]): Transportation[] => {
  const transportations: Transportation[] = []
  const baseCity = '北京'

  for (let i = 0; i < destinations.length; i++) {
    const dest = destinations[i]
    const fromCity = i === 0 ? baseCity : destinations[i - 1].city
    const toCity = dest.city
    const type = i === 0 && fromCity !== toCity
      ? (Math.random() > 0.5 ? 'flight' : 'train')
      : (Math.random() > 0.3 ? 'train' : 'car')

    const departTime = dayjs(dest.arriveDate).subtract(1, 'day').hour(9 + Math.floor(Math.random() * 4)).minute(0).format('YYYY-MM-DD HH:mm')
    const arriveTime = dayjs(departTime).add(Math.random() > 0.5 ? 2 : 4, 'hour').format('YYYY-MM-DD HH:mm')
    const transportNo = transportNoMap[type][Math.floor(Math.random() * transportNoMap[type].length)]
    const cost = type === 'flight'
      ? Math.floor(Math.random() * 1000) + 800
      : type === 'train'
        ? Math.floor(Math.random() * 400) + 300
        : Math.floor(Math.random() * 300) + 100

    transportations.push({
      id: generateId(),
      itineraryId,
      type,
      fromCity,
      toCity,
      departTime,
      arriveTime,
      transportNo,
      cost
    })
  }

  const lastDest = destinations[destinations.length - 1]
  const returnType = Math.random() > 0.5 ? 'flight' : 'train'
  const returnDepartTime = dayjs(lastDest.leaveDate).hour(14 + Math.floor(Math.random() * 3)).minute(0).format('YYYY-MM-DD HH:mm')
  const returnArriveTime = dayjs(returnDepartTime).add(Math.random() > 0.5 ? 2 : 4, 'hour').format('YYYY-MM-DD HH:mm')
  const returnCost = returnType === 'flight'
    ? Math.floor(Math.random() * 1000) + 800
    : Math.floor(Math.random() * 400) + 300

  transportations.push({
    id: generateId(),
    itineraryId,
    type: returnType,
    fromCity: lastDest.city,
    toCity: baseCity,
    departTime: returnDepartTime,
    arriveTime: returnArriveTime,
    transportNo: transportNoMap[returnType][Math.floor(Math.random() * transportNoMap[returnType].length)],
    cost: returnCost
  })

  return transportations
}

const generateAccommodations = (itineraryId: string, destinations: Destination[]): Accommodation[] => {
  const accommodations: Accommodation[] = []

  destinations.forEach(dest => {
    const checkIn = dayjs(dest.arriveDate).hour(14).minute(0).format('YYYY-MM-DD HH:mm')
    const checkOut = dayjs(dest.leaveDate).hour(12).minute(0).format('YYYY-MM-DD HH:mm')
    const nights = dayjs(dest.leaveDate).diff(dayjs(dest.arriveDate), 'day')
    const cost = (Math.floor(Math.random() * 300) + 400) * nights

    accommodations.push({
      id: generateId(),
      itineraryId,
      hotelName: hotelNames[Math.floor(Math.random() * hotelNames.length)] + '(' + dest.city + '店)',
      address: dest.city + '市' + ['朝阳区', '浦东新区', '天河区', '南山区', '西湖区'][Math.floor(Math.random() * 5)] + '某某路' + Math.floor(Math.random() * 100 + 1) + '号',
      checkIn,
      checkOut,
      cost
    })
  })

  return accommodations
}

const generateVisits = (itineraryId: string, destinations: Destination[]): Visit[] => {
  const visits: Visit[] = []

  destinations.forEach(dest => {
    const visitCount = Math.floor(Math.random() * 2) + 1
    for (let i = 0; i < visitCount; i++) {
      const visitDate = dayjs(dest.arriveDate).add(Math.floor(Math.random() * dayjs(dest.leaveDate).diff(dayjs(dest.arriveDate), 'day')), 'day')
      visits.push({
        id: generateId(),
        itineraryId,
        clientName: clientNames[Math.floor(Math.random() * clientNames.length)] + '(' + dest.city + '分公司)',
        address: dest.city + '市' + ['高新区', '经济开发区', '科技园', '商务中心'][Math.floor(Math.random() * 4)] + '某某大厦' + Math.floor(Math.random() * 20 + 5) + '层',
        time: visitDate.hour(9 + Math.floor(Math.random() * 6)).minute(0).format('YYYY-MM-DD HH:mm'),
        purpose: visitPurposes[Math.floor(Math.random() * visitPurposes.length)],
        contact: ['李经理', '王总监', '张主管', '刘工程师', '陈商务'][Math.floor(Math.random() * 5)]
      })
    }
  })

  return visits
}

const generateItineraries = (userId: string): Itinerary[] => {
  const itineraries: Itinerary[] = []
  const baseDate = dayjs().subtract(2, 'month')

  for (let i = 0; i < 7; i++) {
    const startDate = baseDate.add(i * 10, 'day')
    const cityCount = Math.floor(Math.random() * 3) + 2
    const destinations = generateDestinations(generateId(), startDate, cityCount)
    const itineraryId = generateId()

    destinations.forEach(d => d.itineraryId = itineraryId)

    const transportations = generateTransportations(itineraryId, destinations)
    const accommodations = generateAccommodations(itineraryId, destinations)
    const visits = generateVisits(itineraryId, destinations)

    const endDate = dayjs(destinations[destinations.length - 1].leaveDate)
    const budget = Math.floor(
      transportations.reduce((sum, t) => sum + t.cost, 0) +
      accommodations.reduce((sum, a) => sum + a.cost, 0) +
      (visits.length * 500) +
      2000
    )

    itineraries.push({
      id: itineraryId,
      userId,
      title: itineraryTitles[i % itineraryTitles.length],
      purpose: itineraryPurposes[i % itineraryPurposes.length],
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      budget,
      status: statusSequence[i % statusSequence.length],
      destinations,
      transportations,
      accommodations,
      visits,
      createdAt: startDate.subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss')
    })
  }

  return itineraries
}

const generateExpenses = (itineraries: Itinerary[]): Expense[] => {
  const expenses: Expense[] = []
  const categories: ExpenseCategory[] = ['transport', 'accommodation', 'food', 'entertainment', 'other']

  itineraries.forEach(itinerary => {
    const expenseCount = Math.floor(Math.random() * 4) + 2

    itinerary.transportations.forEach(transport => {
      const expenseDate = dayjs(transport.departTime).format('YYYY-MM-DD')
      expenses.push({
        id: generateId(),
        itineraryId: itinerary.id,
        category: 'transport',
        amount: transport.cost,
        expenseDate,
        description: `${transport.type === 'flight' ? '机票' : transport.type === 'train' ? '火车票' : '交通'}: ${transport.fromCity} → ${transport.toCity}`,
        merchant: transport.type === 'flight' ? '中国国际航空' : transport.type === 'train' ? '12306' : '滴滴出行',
        images: [],
        status: itinerary.status === 'completed' ? 'reimbursed' : 'unsubmitted',
        createdAt: expenseDate + ' 12:00:00'
      })
    })

    itinerary.accommodations.forEach(acc => {
      const expenseDate = dayjs(acc.checkIn).format('YYYY-MM-DD')
      expenses.push({
        id: generateId(),
        itineraryId: itinerary.id,
        category: 'accommodation',
        amount: acc.cost,
        expenseDate,
        description: `住宿: ${acc.hotelName}`,
        merchant: acc.hotelName,
        images: [],
        status: itinerary.status === 'completed' ? 'reimbursed' : 'unsubmitted',
        createdAt: expenseDate + ' 14:00:00'
      })
    })

    for (let i = 0; i < expenseCount; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      if (category === 'transport' || category === 'accommodation') continue

      const descriptions = expenseDescriptions[category]
      const description = descriptions[Math.floor(Math.random() * descriptions.length)]
      const expenseDate = dayjs(itinerary.startDate).add(Math.floor(Math.random() * dayjs(itinerary.endDate).diff(dayjs(itinerary.startDate), 'day')), 'day').format('YYYY-MM-DD')

      let amount: number
      switch (category) {
        case 'food':
          amount = Math.floor(Math.random() * 400) + 80
          break
        case 'entertainment':
          amount = Math.floor(Math.random() * 800) + 200
          break
        default:
          amount = Math.floor(Math.random() * 200) + 50
      }

      expenses.push({
        id: generateId(),
        itineraryId: itinerary.id,
        category,
        amount,
        expenseDate,
        description,
        merchant: merchantNames[Math.floor(Math.random() * merchantNames.length)],
        images: [],
        status: itinerary.status === 'completed' ? 'reimbursed' : 'unsubmitted',
        createdAt: expenseDate + ' ' + (10 + Math.floor(Math.random() * 10)) + ':00:00'
      })
    }
  })

  while (expenses.length < 22) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const descriptions = expenseDescriptions[category]
    const description = descriptions[Math.floor(Math.random() * descriptions.length)]
    const expenseDate = dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD')

    let amount: number
    switch (category) {
      case 'transport':
        amount = Math.floor(Math.random() * 500) + 100
        break
      case 'accommodation':
        amount = Math.floor(Math.random() * 800) + 400
        break
      case 'food':
        amount = Math.floor(Math.random() * 400) + 80
        break
      case 'entertainment':
        amount = Math.floor(Math.random() * 800) + 200
        break
      default:
        amount = Math.floor(Math.random() * 200) + 50
    }

    expenses.push({
      id: generateId(),
      category,
      amount,
      expenseDate,
      description,
      merchant: merchantNames[Math.floor(Math.random() * merchantNames.length)],
      images: [],
      status: 'unsubmitted',
      createdAt: expenseDate + ' 12:00:00'
    })
  }

  return expenses
}

const generateReimbursements = (userId: string, expenses: Expense[]): Reimbursement[] => {
  const reimbursements: Reimbursement[] = []
  const reimbursedExpenses = expenses.filter(e => e.status === 'reimbursed')
  const unsubmittedExpenses = expenses.filter(e => e.status === 'unsubmitted').slice(0, 8)

  const reimbursementTitles = [
    '2026年3月差旅报销',
    '2026年4月华东出差报销',
    '华南市场调研费用报销',
    '西南项目启动费用报销',
    '日常办公费用报销'
  ]

  for (let i = 0; i < 5; i++) {
    const reimbursementId = generateId()
    const status = reimbursementStatusSequence[i % reimbursementStatusSequence.length]

    let items: ReimbursementItem[] = []
    let totalAmount = 0

    if (status === 'paid' || status === 'reviewing') {
      const startIdx = i * 3
      const endIdx = Math.min(startIdx + 3, reimbursedExpenses.length)
      const selectedExpenses = reimbursedExpenses.slice(startIdx, endIdx)

      items = selectedExpenses.map(expense => {
        totalAmount += expense.amount
        return {
          id: generateId(),
          reimbursementId,
          expenseId: expense.id,
          amount: expense.amount
        }
      })
    } else if (status === 'submitted') {
      const selectedExpenses = unsubmittedExpenses.slice(i * 2, i * 2 + 2)
      items = selectedExpenses.map(expense => {
        totalAmount += expense.amount
        return {
          id: generateId(),
          reimbursementId,
          expenseId: expense.id,
          amount: expense.amount
        }
      })
    } else {
      items = []
      totalAmount = 0
    }

    const createdAt = dayjs().subtract(30 + i * 10, 'day')
    const submitTime = status !== 'draft' ? createdAt.add(2, 'day').format('YYYY-MM-DD HH:mm:ss') : undefined
    const reviewTime = status === 'reviewing' || status === 'paid' ? createdAt.add(3, 'day').format('YYYY-MM-DD HH:mm:ss') : undefined
    const paidTime = status === 'paid' ? createdAt.add(5, 'day').format('YYYY-MM-DD HH:mm:ss') : undefined
    const rejectReason = status === 'rejected' ? '发票不完整，请补充相关凭证' : undefined

    const statusLogs = []
    statusLogs.push({
      id: generateId(),
      reimbursementId,
      status: 'draft' as const,
      operatorId: userId,
      operatorName: '张明',
      time: createdAt.format('YYYY-MM-DD HH:mm:ss'),
      comment: '创建报销单'
    })
    if (status !== 'draft') {
      statusLogs.push({
        id: generateId(),
        reimbursementId,
        status: 'submitted' as const,
        operatorId: userId,
        operatorName: '张明',
        time: submitTime || createdAt.add(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
        comment: '提交报销单'
      })
    }
    if (status === 'reviewing' || status === 'paid') {
      statusLogs.push({
        id: generateId(),
        reimbursementId,
        status: 'reviewing' as const,
        operatorId: 'user_002',
        operatorName: '李华',
        time: reviewTime || createdAt.add(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
        comment: '开始审核'
      })
    }
    if (status === 'paid') {
      statusLogs.push({
        id: generateId(),
        reimbursementId,
        status: 'paid' as const,
        operatorId: 'user_003',
        operatorName: '王芳',
        time: paidTime || createdAt.add(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
        comment: '已完成付款'
      })
    }
    if (status === 'rejected') {
      statusLogs.push({
        id: generateId(),
        reimbursementId,
        status: 'rejected' as const,
        operatorId: 'user_002',
        operatorName: '李华',
        time: createdAt.add(4, 'day').format('YYYY-MM-DD HH:mm:ss'),
        comment: rejectReason
      })
    }

    reimbursements.push({
      id: reimbursementId,
      applicantId: userId,
      applicantName: '张明',
      title: reimbursementTitles[i % reimbursementTitles.length],
      totalAmount,
      items,
      status,
      submitTime,
      reviewTime,
      paidTime,
      paidAmount: status === 'paid' ? totalAmount : undefined,
      rejectReason,
      approvals: (status === 'paid' || status === 'reviewing') ? [
        {
          id: generateId(),
          reimbursementId,
          approverId: 'user_002',
          action: 'approve',
          comment: '费用合理，同意报销',
          time: createdAt.add(3, 'day').format('YYYY-MM-DD HH:mm:ss')
        },
        {
          id: generateId(),
          reimbursementId,
          approverId: 'user_003',
          action: status === 'paid' ? 'approve' : 'approve',
          comment: status === 'paid' ? '已完成付款' : '审核通过，待付款',
          time: createdAt.add(5, 'day').format('YYYY-MM-DD HH:mm:ss')
        }
      ] : [],
      statusLogs,
      createdAt: createdAt.format('YYYY-MM-DD HH:mm:ss')
    })
  }

  return reimbursements
}

export interface MockData {
  currentUser: User
  itineraries: Itinerary[]
  expenses: Expense[]
  reimbursements: Reimbursement[]
}

export const generateMockData = (): MockData => {
  const currentUser = generateUser()
  const itineraries = generateItineraries(currentUser.id)
  const expenses = generateExpenses(itineraries)
  const reimbursements = generateReimbursements(currentUser.id, expenses)

  return {
    currentUser,
    itineraries,
    expenses,
    reimbursements
  }
}
