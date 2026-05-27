import type {
  DesignToken,
  NamingRule,
  VersionRecord,
  ComponentDoc,
  DesignDecision,
  ReviewRecord,
  DesignPrinciple,
  IconItem,
  IllustrationItem,
  FontItem,
  ChecklistItem,
  DesignReviewItem,
} from '../types'

export const designTokens: DesignToken[] = [
  {
    id: '1',
    name: 'Primary Color',
    semanticName: 'primary-color',
    category: 'color',
    value: '#3B82F6',
    description: '主色调，用于主要按钮、链接等关键元素',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-20',
  },
  {
    id: '2',
    name: 'Secondary Color',
    semanticName: 'secondary-color',
    category: 'color',
    value: '#6B7280',
    description: '次要颜色，用于次要按钮和文本',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '3',
    name: 'Success Color',
    semanticName: 'success-color',
    category: 'color',
    value: '#10B981',
    description: '成功状态颜色',
    createdAt: '2024-01-15',
    updatedAt: '2024-02-10',
  },
  {
    id: '4',
    name: 'Error Color',
    semanticName: 'error-color',
    category: 'color',
    value: '#EF4444',
    description: '错误状态颜色',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '5',
    name: 'Warning Color',
    semanticName: 'warning-color',
    category: 'color',
    value: '#F59E0B',
    description: '警告状态颜色',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '6',
    name: 'Primary Text',
    semanticName: 'text-primary',
    category: 'color',
    value: '#111827',
    description: '主要文字颜色',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '7',
    name: 'Secondary Text',
    semanticName: 'text-secondary',
    category: 'color',
    value: '#6B7280',
    description: '次要文字颜色',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '8',
    name: 'Base Spacing',
    semanticName: 'spacing-base',
    category: 'spacing',
    value: '16px',
    description: '基础间距单位',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '9',
    name: 'Small Spacing',
    semanticName: 'spacing-sm',
    category: 'spacing',
    value: '8px',
    description: '小间距',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '10',
    name: 'Large Spacing',
    semanticName: 'spacing-lg',
    category: 'spacing',
    value: '24px',
    description: '大间距',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '11',
    name: 'Default Radius',
    semanticName: 'radius-default',
    category: 'radius',
    value: '8px',
    description: '默认圆角',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-01',
  },
  {
    id: '12',
    name: 'Small Radius',
    semanticName: 'radius-sm',
    category: 'radius',
    value: '4px',
    description: '小圆角',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '13',
    name: 'Default Shadow',
    semanticName: 'shadow-default',
    category: 'shadow',
    value: '0 1px 3px rgba(0,0,0,0.1)',
    description: '默认阴影',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '14',
    name: 'Large Shadow',
    semanticName: 'shadow-lg',
    category: 'shadow',
    value: '0 10px 15px rgba(0,0,0,0.1)',
    description: '大阴影',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '15',
    name: 'Font Size Base',
    semanticName: 'font-size-base',
    category: 'typography',
    value: '14px',
    description: '基础字体大小',
    createdAt: '2024-01-15',
    updatedAt: '2024-02-20',
  },
]

export const namingRules: NamingRule[] = [
  {
    id: '1',
    category: '颜色',
    pattern: '{用途}-{属性}-{级别?}',
    example: 'primary-color, text-secondary, bg-success',
    description: '颜色命名遵循用途优先原则，语义化命名便于理解和维护',
  },
  {
    id: '2',
    category: '间距',
    pattern: 'spacing-{尺寸}',
    example: 'spacing-xs, spacing-sm, spacing-base, spacing-lg',
    description: '间距使用统一的尺寸级别，从 xs 到 xl',
  },
  {
    id: '3',
    category: '圆角',
    pattern: 'radius-{尺寸}',
    example: 'radius-none, radius-sm, radius-default, radius-full',
    description: '圆角尺寸分级，none 表示无圆角，full 表示圆形',
  },
  {
    id: '4',
    category: '阴影',
    pattern: 'shadow-{级别}',
    example: 'shadow-none, shadow-default, shadow-lg, shadow-xl',
    description: '阴影级别对应不同的视觉层级',
  },
  {
    id: '5',
    category: '字体',
    pattern: 'font-{属性}-{值}',
    example: 'font-size-base, font-weight-medium',
    description: '字体相关变量明确属性类型',
  },
  {
    id: '6',
    category: '组件',
    pattern: '{组件名}-{状态?}-{属性}',
    example: 'button-primary-bg, input-border-focus',
    description: '组件级变量以组件名开头，便于识别归属',
  },
]

export const versionHistory: VersionRecord[] = [
  {
    id: '1',
    version: '2.1.0',
    date: '2024-03-20',
    author: '张三',
    changes: [
      { type: 'modify', item: 'primary-color', detail: '主色调从 #2563EB 调整为 #3B82F6' },
      { type: 'modify', item: 'radius-default', detail: '默认圆角从 6px 调整为 8px' },
    ],
    impactScope: ['所有按钮组件', '卡片组件', '输入框组件'],
    description: '品牌色升级，提升视觉亲和力',
  },
  {
    id: '2',
    version: '2.0.0',
    date: '2024-02-15',
    author: '李四',
    changes: [
      { type: 'add', item: 'success-color', detail: '新增成功状态色 #10B981' },
      { type: 'add', item: 'font-size-base', detail: '新增基础字体大小变量' },
      { type: 'modify', item: 'text-primary', detail: '主文字颜色加深' },
    ],
    impactScope: ['全局样式', '表单组件', '通知组件'],
    description: '重大版本更新，完善设计系统',
  },
  {
    id: '3',
    version: '1.2.0',
    date: '2024-01-20',
    author: '王五',
    changes: [
      { type: 'add', item: 'shadow-lg', detail: '新增大阴影效果' },
      { type: 'delete', item: 'old-shadow', detail: '移除旧的阴影变量' },
    ],
    impactScope: ['弹窗组件', '下拉菜单'],
    description: '阴影系统优化',
  },
]

export const components: ComponentDoc[] = [
  {
    id: '1',
    name: 'Button',
    category: '通用',
    description: '按钮用于触发一个操作，如提交表单、打开对话框等。',
    usage: '按钮应该清晰地表达其功能。主按钮用于主要操作，次按钮用于次要操作。',
    forbidden: [
      '不要在同一区域使用多个主按钮',
      '按钮文字不要超过4个字',
      '不要使用与背景对比度不足的颜色',
    ],
    codeExample: `<Button type="primary" onClick={handleClick}>
  确认
</Button>

<Button type="secondary">
  取消
</Button>`,
    designLink: 'https://figma.com/file/xxx/Button',
    status: [
      { name: '默认', preview: 'default', description: '正常状态' },
      { name: '悬停', preview: 'hover', description: '鼠标悬停状态' },
      { name: '激活', preview: 'active', description: '点击激活状态' },
      { name: '禁用', preview: 'disabled', description: '不可用状态' },
      { name: '加载中', preview: 'loading', description: '异步加载状态' },
    ],
    relatedComponents: ['Icon', 'Tooltip'],
    tags: ['基础', '交互'],
  },
  {
    id: '2',
    name: 'Input',
    category: '表单',
    description: '输入框用于获取用户输入的文本信息。',
    usage: '输入框应该有清晰的标签，必要时提供占位符提示。',
    forbidden: [
      '不要省略输入框标签',
      '不要在输入框内放置图标而不说明含义',
    ],
    codeExample: `<Input
  label="用户名"
  placeholder="请输入用户名"
  value={value}
  onChange={handleChange}
/>`,
    designLink: 'https://figma.com/file/xxx/Input',
    status: [
      { name: '默认', preview: 'default', description: '正常状态' },
      { name: '悬停', preview: 'hover', description: '鼠标悬停' },
      { name: '聚焦', preview: 'focus', description: '输入聚焦' },
      { name: '禁用', preview: 'disabled', description: '禁用状态' },
      { name: '错误', preview: 'error', description: '校验错误' },
    ],
    relatedComponents: ['Form', 'Button'],
    tags: ['表单', '输入'],
  },
  {
    id: '3',
    name: 'Card',
    category: '数据展示',
    description: '卡片用于展示一组相关信息，是一种容器组件。',
    usage: '卡片用于将信息分组展示，便于用户理解和操作。',
    forbidden: [
      '不要在卡片内嵌套过多层级',
      '卡片阴影不要过重',
    ],
    codeExample: `<Card title="卡片标题">
  <p>卡片内容...</p>
</Card>`,
    designLink: 'https://figma.com/file/xxx/Card',
    status: [
      { name: '默认', preview: 'default', description: '正常状态' },
      { name: '悬停', preview: 'hover', description: '可点击卡片悬停' },
    ],
    relatedComponents: ['Button', 'Avatar'],
    tags: ['容器', '展示'],
  },
  {
    id: '4',
    name: 'Modal',
    category: '反馈',
    description: '模态对话框用于中断用户当前流程，执行特定操作。',
    usage: '模态框应包含明确的标题、内容和操作按钮。',
    forbidden: [
      '不要在模态框内再打开模态框',
      '模态框内容不要过多',
    ],
    codeExample: `<Modal
  visible={visible}
  title="确认删除"
  onOk={handleOk}
  onCancel={handleCancel}
>
  <p>确定要删除这条记录吗？</p>
</Modal>`,
    designLink: 'https://figma.com/file/xxx/Modal',
    status: [
      { name: '默认', preview: 'default', description: '正常显示' },
      { name: '加载中', preview: 'loading', description: '确认按钮加载' },
    ],
    relatedComponents: ['Button'],
    tags: ['弹窗', '反馈'],
  },
  {
    id: '5',
    name: 'Table',
    category: '数据展示',
    description: '表格用于展示结构化数据，支持排序、筛选等操作。',
    usage: '表格列数不宜过多，重要信息前置。',
    forbidden: [
      '不要在移动端使用过多列',
      '行高不要过小影响可读性',
    ],
    codeExample: `<Table columns={columns} dataSource={data} />`,
    designLink: 'https://figma.com/file/xxx/Table',
    status: [
      { name: '默认', preview: 'default', description: '正常状态' },
      { name: '加载中', preview: 'loading', description: '数据加载' },
      { name: '空状态', preview: 'empty', description: '无数据' },
    ],
    relatedComponents: ['Pagination', 'Button'],
    tags: ['数据', '表格'],
  },
]

export const designDecisions: DesignDecision[] = [
  {
    id: '1',
    title: '主色调选择',
    date: '2024-01-10',
    author: '张三',
    background: '产品需要确定品牌主色调，用于主要按钮、链接等关键元素的展示。',
    alternatives: [
      {
        name: '方案A：深蓝色 #1E40AF',
        pros: ['专业稳重', '科技感强', '与竞品区分度高'],
        cons: ['略显严肃', '亲和力不足'],
      },
      {
        name: '方案B：天蓝色 #3B82F6',
        pros: ['现代感强', '亲和力好', '用户接受度高'],
        cons: ['竞品使用较多'],
      },
      {
        name: '方案C：紫色 #8B5CF6',
        pros: ['独特性强', '记忆点深刻'],
        cons: ['适用场景有限', '部分用户可能不喜欢'],
      },
    ],
    decision: '选择方案B：天蓝色 #3B82F6',
    reason: '天蓝色在保持专业感的同时具有较好的亲和力，符合产品面向年轻用户的定位。虽然竞品有使用，但可以通过搭配其他颜色形成差异化。',
  },
  {
    id: '2',
    title: '圆角大小规范',
    date: '2024-01-15',
    author: '李四',
    background: '需要确定界面元素的圆角大小规范，统一设计风格。',
    alternatives: [
      {
        name: '方案A：小圆角 4px',
        pros: ['简洁干练', '适合企业级产品'],
        cons: ['略显生硬'],
      },
      {
        name: '方案B：中等圆角 8px',
        pros: ['友好现代', '视觉舒适'],
        cons: ['需要注意元素间的协调'],
      },
      {
        name: '方案C：大圆角 12px',
        pros: ['活泼可爱', '亲和力强'],
        cons: ['可能显得不够专业'],
      },
    ],
    decision: '选择方案B：中等圆角 8px',
    reason: '8px的圆角在保持专业感的同时具有现代感，适用于大多数场景。特殊场景可使用 4px 或 16px 作为补充。',
  },
  {
    id: '3',
    title: '图标风格统一',
    date: '2024-02-01',
    author: '王五',
    background: '产品需要统一的图标风格，提升用户体验和品牌识别度。',
    alternatives: [
      {
        name: '方案A：线性图标',
        pros: ['简洁现代', '文件体积小'],
        cons: ['辨识度可能较低'],
      },
      {
        name: '方案B：填充图标',
        pros: ['辨识度高', '视觉存在感强'],
        cons: ['可能显得厚重'],
      },
      {
        name: '方案C：双色图标',
        pros: ['视觉层次丰富', '品牌特征强'],
        cons: ['设计成本高', '实现复杂'],
      },
    ],
    decision: '选择方案A：线性图标，选中态使用填充',
    reason: '线性图标简洁现代，适合产品整体风格。选中态切换为填充样式，既保持了统一性又提供了清晰的状态反馈。',
  },
]

export const reviewRecords: ReviewRecord[] = [
  {
    id: '1',
    title: '首页改版设计评审',
    date: '2024-03-15',
    participants: ['张三', '李四', '王五', '赵六', '钱七'],
    discussionPoints: [
      '顶部导航栏信息层级需要优化',
      '卡片间距建议从 16px 调整为 20px',
      '数据可视化图表颜色需要增加对比度',
      '移动端适配方案需要进一步细化',
    ],
    finalDecision: '按照讨论意见修改后进入开发阶段，移动端适配下周补充评审。',
    attachments: ['首页设计稿v2.fig', '数据规范文档.pdf'],
  },
  {
    id: '2',
    title: '表单组件交互评审',
    date: '2024-02-28',
    participants: ['张三', '李四', '赵六'],
    discussionPoints: [
      '输入框错误提示位置需要统一',
      '表单提交按钮的加载状态需要明确',
      '必填项标识建议使用红色星号',
      '建议增加表单输入实时校验',
    ],
    finalDecision: '全部建议采纳，更新组件库文档。',
    attachments: ['表单组件规范.docx'],
  },
  {
    id: '3',
    title: '暗黑模式设计评审',
    date: '2024-02-10',
    participants: ['李四', '王五', '钱七'],
    discussionPoints: [
      '暗色背景色值需要再降低亮度',
      '文字对比度需要符合 WCAG 标准',
      '图片在暗黑模式下的处理方式',
      '切换动画建议使用 300ms 过渡',
    ],
    finalDecision: '按照评审意见优化后，先在小范围内测。',
    attachments: ['暗黑模式设计规范.pdf'],
  },
]

export const designPrinciples: DesignPrinciple[] = [
  {
    id: '1',
    title: '一致性',
    description: '保持设计的一致性是提升用户体验的基础。相同的功能应该使用相同的交互模式和视觉表现。',
    examples: [
      '相同功能的按钮在不同页面保持一致的样式和位置',
      '信息提示使用统一的颜色和图标',
      '交互反馈遵循相同的动画规范',
    ],
  },
  {
    id: '2',
    title: '简洁高效',
    description: '设计应该简洁明了，帮助用户快速完成任务。去除不必要的元素，突出核心内容。',
    examples: [
      '减少不必要的弹窗和干扰信息',
      '操作步骤尽可能简化',
      '信息层级清晰，重要内容优先展示',
    ],
  },
  {
    id: '3',
    title: '可访问性',
    description: '设计应该考虑所有用户的需求，包括有视觉或操作障碍的用户。遵循可访问性标准。',
    examples: [
      '文字与背景对比度符合 WCAG AA 标准',
      '所有交互元素支持键盘操作',
      '图片提供替代文本说明',
    ],
  },
  {
    id: '4',
    title: '反馈及时',
    description: '用户的每一个操作都应该得到及时的反馈，让用户知道系统正在响应。',
    examples: [
      '按钮点击有明确的视觉反馈',
      '数据加载时显示加载状态',
      '操作成功或失败有清晰的提示',
    ],
  },
  {
    id: '5',
    title: '容错性',
    description: '设计应该允许用户犯错，并提供简单的方式从错误中恢复。',
    examples: [
      '重要操作提供二次确认',
      '支持撤销操作',
      '错误提示清晰说明问题和解决方法',
    ],
  },
]

export const icons: IconItem[] = [
  {
    id: '1',
    name: 'home',
    category: '导航',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    tags: ['首页', '主页'],
  },
  {
    id: '2',
    name: 'user',
    category: '用户',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    tags: ['用户', '个人'],
  },
  {
    id: '3',
    name: 'settings',
    category: '系统',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    tags: ['设置', '配置'],
  },
  {
    id: '4',
    name: 'search',
    category: '操作',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    tags: ['搜索', '查找'],
  },
  {
    id: '5',
    name: 'bell',
    category: '通知',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
    tags: ['通知', '提醒'],
  },
  {
    id: '6',
    name: 'mail',
    category: '通讯',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
    tags: ['邮件', '消息'],
  },
  {
    id: '7',
    name: 'heart',
    category: '反馈',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    tags: ['收藏', '喜欢'],
  },
  {
    id: '8',
    name: 'star',
    category: '反馈',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    tags: ['收藏', '评分'],
  },
  {
    id: '9',
    name: 'edit',
    category: '操作',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    tags: ['编辑', '修改'],
  },
  {
    id: '10',
    name: 'trash',
    category: '操作',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
    tags: ['删除', '移除'],
  },
  {
    id: '11',
    name: 'plus',
    category: '操作',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    tags: ['添加', '新增'],
  },
  {
    id: '12',
    name: 'check',
    category: '状态',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    tags: ['确认', '完成'],
  },
]

export const illustrations: IllustrationItem[] = [
  {
    id: '1',
    name: '空状态-无数据',
    category: '空状态',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
    copyright: 'Unsplash 免费授权',
    usageScope: ['空状态页面', '引导页', '营销素材'],
  },
  {
    id: '2',
    name: '404 页面',
    category: '错误页',
    url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400&h=300&fit=crop',
    copyright: 'Unsplash 免费授权',
    usageScope: ['404 错误页面'],
  },
  {
    id: '3',
    name: '成功状态',
    category: '反馈',
    url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
    copyright: 'Unsplash 免费授权',
    usageScope: ['成功提示', '完成页面'],
  },
  {
    id: '4',
    name: '团队协作',
    category: '营销',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    copyright: 'Unsplash 免费授权',
    usageScope: ['首页 Banner', '关于我们', '营销素材'],
  },
  {
    id: '5',
    name: '数据分析',
    category: '功能',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    copyright: 'Unsplash 免费授权',
    usageScope: ['数据产品介绍', '功能展示'],
  },
]

export const fonts: FontItem[] = [
  {
    id: '1',
    name: 'Inter',
    family: 'Inter, sans-serif',
    weights: [300, 400, 500, 600, 700],
    license: 'SIL Open Font License',
    licenseUrl: 'https://scripts.sil.org/OFL',
  },
  {
    id: '2',
    name: 'PingFang SC',
    family: 'PingFang SC, -apple-system, sans-serif',
    weights: [300, 400, 500, 600, 700],
    license: 'Apple 系统字体',
    licenseUrl: 'https://www.apple.com/legal/sla/',
  },
  {
    id: '3',
    name: 'Roboto',
    family: 'Roboto, sans-serif',
    weights: [300, 400, 500, 700],
    license: 'Apache License, Version 2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
  },
]

export const checklists: ChecklistItem[] = [
  {
    id: '1',
    feature: '用户注册登录功能',
    items: [
      { name: '页面设计稿', checked: true },
      { name: '交互原型', checked: true },
      { name: '组件规范文档', checked: true },
      { name: '设计 Token 定义', checked: false },
      { name: '暗黑模式适配', checked: false },
      { name: '移动端适配设计', checked: true },
      { name: '图标资源', checked: true },
      { name: '设计评审记录', checked: true },
    ],
    assignee: '张三',
    deadline: '2024-04-01',
    status: 'in-progress',
  },
  {
    id: '2',
    feature: '数据报表模块',
    items: [
      { name: '页面设计稿', checked: true },
      { name: '图表组件规范', checked: true },
      { name: '数据可视化颜色规范', checked: true },
      { name: '响应式布局设计', checked: true },
      { name: '空状态设计', checked: true },
      { name: '加载状态设计', checked: false },
    ],
    assignee: '李四',
    deadline: '2024-04-15',
    status: 'in-progress',
  },
  {
    id: '3',
    feature: '个人中心改版',
    items: [
      { name: '页面设计稿', checked: true },
      { name: '交互原型', checked: true },
      { name: '组件规范文档', checked: true },
      { name: '设计 Token 定义', checked: true },
      { name: '暗黑模式适配', checked: true },
      { name: '移动端适配设计', checked: true },
      { name: '设计评审记录', checked: true },
    ],
    assignee: '王五',
    deadline: '2024-03-20',
    status: 'completed',
  },
]

export const designReviews: DesignReviewItem[] = [
  {
    id: '1',
    feature: '首页改版',
    designer: '张三',
    developer: '赵六',
    differences: [
      {
        location: '顶部导航栏',
        design: '高度 64px，阴影 0 2px 8px rgba(0,0,0,0.08)',
        implementation: '高度 60px，无阴影',
        suggestion: '按照设计稿调整高度和阴影',
        resolved: true,
      },
      {
        location: '卡片间距',
        design: '20px',
        implementation: '16px',
        suggestion: '调整为 20px 以保证呼吸感',
        resolved: false,
      },
    ],
    status: 'pending',
    date: '2024-03-22',
  },
  {
    id: '2',
    feature: '用户列表页',
    designer: '李四',
    developer: '钱七',
    differences: [
      {
        location: '表格行高',
        design: '56px',
        implementation: '48px',
        suggestion: '调整为 56px 提高可读性',
        resolved: true,
      },
    ],
    status: 'resolved',
    date: '2024-03-18',
  },
  {
    id: '3',
    feature: '表单页',
    designer: '王五',
    developer: '孙八',
    differences: [
      {
        location: '输入框圆角',
        design: '8px',
        implementation: '4px',
        suggestion: '统一为 8px',
        resolved: true,
      },
      {
        location: '错误提示颜色',
        design: '#EF4444',
        implementation: '#FF0000',
        suggestion: '使用设计系统定义的 error-color',
        resolved: true,
      },
    ],
    status: 'confirmed',
    date: '2024-03-10',
  },
]