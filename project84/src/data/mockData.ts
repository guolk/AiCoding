import type { User, Badge, Tag, Question, Answer, Category, DailyChallenge, QuizQuestion, KnowledgeArea } from '../types'

export const categories: Category[] = [
  { id: 'cat-1', name: '编程语言', icon: 'Code2', description: '各种编程语言相关问题' },
  { id: 'cat-2', name: '数据科学', icon: 'BarChart3', description: '数据分析、机器学习、AI' },
  { id: 'cat-3', name: '前端开发', icon: 'Globe', description: 'Web前端技术' },
  { id: 'cat-4', name: '后端开发', icon: 'Server', description: '服务端开发技术' },
  { id: 'cat-5', name: '数据库', icon: 'Database', description: '数据库设计与优化' },
  { id: 'cat-6', name: '算法与数据结构', icon: 'Binary', description: '算法和数据结构' },
]

export const tags: Tag[] = [
  { id: 'tag-1', name: 'JavaScript', description: 'JS相关问题', category: '编程语言', color: '#f7df1e', questionCount: 3240, followerCount: 15600 },
  { id: 'tag-2', name: 'TypeScript', description: 'TS类型安全', category: '编程语言', color: '#3178c6', questionCount: 2180, followerCount: 12000 },
  { id: 'tag-3', name: 'Python', description: 'Python编程', category: '编程语言', color: '#3776ab', questionCount: 4520, followerCount: 22000 },
  { id: 'tag-4', name: 'React', description: 'React框架', category: '前端开发', color: '#61dafb', questionCount: 3890, followerCount: 18500 },
  { id: 'tag-5', name: 'Vue', description: 'Vue框架', category: '前端开发', color: '#42b883', questionCount: 2450, followerCount: 11200 },
  { id: 'tag-6', name: 'Node.js', description: 'Node.js服务端', category: '后端开发', color: '#339933', questionCount: 2100, followerCount: 9800 },
  { id: 'tag-7', name: 'MySQL', description: 'MySQL数据库', category: '数据库', color: '#4479a1', questionCount: 1800, followerCount: 8500 },
  { id: 'tag-8', name: '算法', description: '算法问题', category: '算法与数据结构', color: '#ff6b35', questionCount: 2900, followerCount: 14200 },
  { id: 'tag-9', name: '机器学习', description: 'ML相关', category: '数据科学', color: '#9b59b6', questionCount: 1650, followerCount: 7800 },
  { id: 'tag-10', name: 'CSS', description: '样式设计', category: '前端开发', color: '#264de4', questionCount: 1900, followerCount: 9200 },
  { id: 'tag-11', name: 'Docker', description: '容器化技术', category: '后端开发', color: '#2496ed', questionCount: 1200, followerCount: 6500 },
  { id: 'tag-12', name: 'Git', description: '版本控制', category: '编程语言', color: '#f05032', questionCount: 1450, followerCount: 7200 },
]

export const mockBadges: Badge[] = [
  { id: 'badge-1', name: '初出茅庐', description: '首次回答问题', icon: 'Star', rarity: 'common', unlockedAt: new Date('2025-01-15') },
  { id: 'badge-2', name: 'JavaScript达人', description: '在JavaScript标签下回答10个问题', icon: 'Code2', tagId: 'tag-1', rarity: 'rare', unlockedAt: new Date('2025-02-20') },
  { id: 'badge-3', name: 'React专家', description: '在React标签下回答20个问题', icon: 'Atom', tagId: 'tag-4', rarity: 'epic', unlockedAt: new Date('2025-03-10') },
  { id: 'badge-4', name: 'Python达人', description: '在Python标签下回答10个问题', icon: 'Snake', tagId: 'tag-3', rarity: 'rare', unlockedAt: new Date('2025-03-25') },
  { id: 'badge-5', name: '算法能手', description: '在算法标签下回答15个问题', icon: 'Binary', tagId: 'tag-8', rarity: 'rare', unlockedAt: new Date('2025-04-05') },
  { id: 'badge-6', name: '知识分享者', description: '累计回答50个问题', icon: 'Share2', rarity: 'epic', unlockedAt: new Date('2025-04-15') },
  { id: 'badge-7', name: '社区之星', description: '回答被采纳20次', icon: 'Trophy', rarity: 'legendary', unlockedAt: new Date('2025-04-20') },
  { id: 'badge-8', name: 'TypeScript达人', description: '在TypeScript标签下回答10个问题', icon: 'FileCode2', tagId: 'tag-2', rarity: 'rare', unlockedAt: new Date('2025-05-01') },
]

export const mockUser: User = {
  id: 'user-1',
  username: '知识探索者',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
  bio: '热爱编程，专注于前端开发和算法研究。相信知识分享的力量，乐于帮助他人解决技术难题。',
  level: 12,
  points: 3580,
  totalPoints: 12580,
  joinedAt: new Date('2024-06-01'),
  expertiseTags: ['tag-1', 'tag-2', 'tag-4', 'tag-8'],
  helpedUsers: 156,
  questionsAsked: 23,
  questionsAnswered: 87,
  acceptedAnswers: 42,
  followedTags: ['tag-1', 'tag-2', 'tag-3', 'tag-4', 'tag-8', 'tag-9'],
  badges: mockBadges,
}

export const otherUsers: User[] = [
  {
    id: 'user-2',
    username: 'Python达人',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
    bio: 'Python全栈开发工程师',
    level: 18,
    points: 5200,
    totalPoints: 18200,
    joinedAt: new Date('2024-03-15'),
    expertiseTags: ['tag-3', 'tag-6'],
    helpedUsers: 234,
    questionsAsked: 45,
    questionsAnswered: 156,
    acceptedAnswers: 89,
    followedTags: ['tag-3', 'tag-6', 'tag-9'],
    badges: [],
  },
  {
    id: 'user-3',
    username: '算法王者',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
    bio: 'ACM-ICPC选手，算法竞赛爱好者',
    level: 22,
    points: 7800,
    totalPoints: 25800,
    joinedAt: new Date('2024-01-20'),
    expertiseTags: ['tag-8'],
    helpedUsers: 312,
    questionsAsked: 12,
    questionsAnswered: 234,
    acceptedAnswers: 156,
    followedTags: ['tag-8', 'tag-3'],
    badges: [],
  },
  {
    id: 'user-4',
    username: '前端小精灵',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100',
    bio: 'React/Vue前端开发',
    level: 8,
    points: 2100,
    totalPoints: 6100,
    joinedAt: new Date('2024-08-10'),
    expertiseTags: ['tag-4', 'tag-5', 'tag-10'],
    helpedUsers: 89,
    questionsAsked: 34,
    questionsAnswered: 45,
    acceptedAnswers: 23,
    followedTags: ['tag-4', 'tag-5', 'tag-10', 'tag-1', 'tag-2'],
    badges: [],
  },
]

export const mockQuestions: Question[] = [
  {
    id: 'q-1',
    title: 'React中如何正确使用useEffect处理异步操作？',
    content: `## 问题描述

我在React组件中使用\`useEffect\`来获取数据，但是经常遇到以下问题：

1. 组件卸载时异步操作还在进行，导致内存泄漏
2. 依赖项管理不当导致无限循环渲染

\`\`\`jsx
useEffect(() => {
  const fetchData = async () => {
    const result = await fetch('/api/data')
    setData(result)
  }
  fetchData()
}, [])
\`\`\`

请问有什么最佳实践来处理这种情况？`,
    authorId: 'user-2',
    author: otherUsers[0],
    tags: ['tag-1', 'tag-4'],
    category: '前端开发',
    difficulty: 'intermediate',
    voteCount: 128,
    answerCount: 5,
    viewCount: 2340,
    hasAcceptedAnswer: true,
    createdAt: new Date('2025-05-20T10:30:00'),
    updatedAt: new Date('2025-05-20T10:30:00'),
  },
  {
    id: 'q-2',
    title: 'TypeScript中泛型约束如何实现类型安全的工厂函数？',
    content: `## 问题背景

我想要创建一个通用的工厂函数，但不确定如何正确使用泛型约束：

\`\`\`typescript
interface Creatable {
  create(): void
}

function createInstance<T>(constructor: new () => T): T {
  return new constructor()
}
\`\`\`

如何让这个工厂函数只接受实现了\`Creatable\`接口的类？`,
    authorId: 'user-3',
    author: otherUsers[1],
    tags: ['tag-2'],
    category: '编程语言',
    difficulty: 'advanced',
    voteCount: 89,
    answerCount: 3,
    viewCount: 1560,
    hasAcceptedAnswer: true,
    createdAt: new Date('2025-05-22T14:20:00'),
    updatedAt: new Date('2025-05-22T14:20:00'),
  },
  {
    id: 'q-3',
    title: '如何用Python实现一个高效的LRU缓存？',
    content: `## 需求

需要实现一个LRU（最近最少使用）缓存，要求：
- 支持\`get(key)\`和\`put(key, value)\`操作
- 时间复杂度O(1)
- 容量可配置

我知道可以用\`OrderedDict\`，但想了解更底层的实现方式。`,
    authorId: 'user-4',
    author: otherUsers[2],
    tags: ['tag-3', 'tag-8'],
    category: '算法与数据结构',
    difficulty: 'intermediate',
    voteCount: 156,
    answerCount: 4,
    viewCount: 3120,
    hasAcceptedAnswer: true,
    createdAt: new Date('2025-05-18T09:15:00'),
    updatedAt: new Date('2025-05-18T09:15:00'),
  },
  {
    id: 'q-4',
    title: 'Vue3组合式API中如何实现响应式的计算属性？',
    content: `## 问题

在Vue3中，我想使用组合式API实现一个基于多个响应式变量的计算属性：

\`\`\`javascript
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

// 如何实现全名的计算属性？
\`\`\`

同时想了解\`computed\`和\`watch\`的使用场景区别。`,
    authorId: 'user-1',
    author: mockUser,
    tags: ['tag-5'],
    category: '前端开发',
    difficulty: 'beginner',
    voteCount: 45,
    answerCount: 2,
    viewCount: 890,
    hasAcceptedAnswer: false,
    createdAt: new Date('2025-05-24T16:45:00'),
    updatedAt: new Date('2025-05-24T16:45:00'),
  },
  {
    id: 'q-5',
    title: 'MySQL中如何优化包含多个JOIN的复杂查询？',
    content: `## 问题描述

有一个查询涉及5个表的JOIN操作，执行时间超过10秒。表结构大致如下：

- orders (id, user_id, product_id, amount, created_at)
- users (id, name, email)
- products (id, name, price, category_id)
- categories (id, name)
- order_items (id, order_id, quantity, price)

查询要统计每个用户在每个类别下的消费总额。请问有什么优化建议？`,
    authorId: 'user-2',
    author: otherUsers[0],
    tags: ['tag-7'],
    category: '数据库',
    difficulty: 'advanced',
    voteCount: 203,
    answerCount: 6,
    viewCount: 4500,
    hasAcceptedAnswer: true,
    createdAt: new Date('2025-05-15T11:00:00'),
    updatedAt: new Date('2025-05-15T11:00:00'),
  },
  {
    id: 'q-6',
    title: 'Docker容器之间如何实现高效通信？',
    content: `## 场景

我的应用包含以下服务：
- Web应用（Node.js）
- 数据库（PostgreSQL）
- 缓存（Redis）
- 消息队列（RabbitMQ）

这些服务都运行在Docker容器中。请问：
1. 使用Docker Compose时服务间如何通信？
2. 如何配置网络以提高性能？
3. 生产环境有什么最佳实践？`,
    authorId: 'user-3',
    author: otherUsers[1],
    tags: ['tag-11', 'tag-6'],
    category: '后端开发',
    difficulty: 'intermediate',
    voteCount: 78,
    answerCount: 3,
    viewCount: 1200,
    hasAcceptedAnswer: false,
    createdAt: new Date('2025-05-23T08:30:00'),
    updatedAt: new Date('2025-05-23T08:30:00'),
  },
  {
    id: 'q-7',
    title: '机器学习中如何处理类别不平衡问题？',
    content: `## 问题

在做一个欺诈检测项目，正负样本比例约为1:100。尝试了以下方法但效果不理想：

- 直接训练模型（偏向多数类）
- 过采样少数类（过拟合）
- 欠采样多数类（信息损失）

请问有什么更高级的处理方法？SMOTE算法如何正确使用？`,
    authorId: 'user-4',
    author: otherUsers[2],
    tags: ['tag-9', 'tag-3'],
    category: '数据科学',
    difficulty: 'advanced',
    voteCount: 167,
    answerCount: 4,
    viewCount: 2800,
    hasAcceptedAnswer: true,
    createdAt: new Date('2025-05-19T15:00:00'),
    updatedAt: new Date('2025-05-19T15:00:00'),
  },
  {
    id: 'q-8',
    title: 'Git如何撤销已经push的错误提交？',
    content: `## 问题

不小心把包含敏感信息的代码push到了远程仓库。现在需要：

1. 撤销这次提交
2. 不影响其他同事的工作
3. 清理历史记录中的敏感信息

\`git revert\`和\`git reset\`应该用哪个？具体操作步骤是什么？`,
    authorId: 'user-1',
    author: mockUser,
    tags: ['tag-12'],
    category: '编程语言',
    difficulty: 'beginner',
    voteCount: 234,
    answerCount: 7,
    viewCount: 5600,
    hasAcceptedAnswer: true,
    createdAt: new Date('2025-05-17T13:20:00'),
    updatedAt: new Date('2025-05-17T13:20:00'),
  },
  {
    id: 'q-9',
    title: 'CSS Grid vs Flexbox：什么时候该用哪个？',
    content: `## 困惑

CSS Grid和Flexbox都是强大的布局工具，但我经常纠结该选哪个：

- 一维布局用Flexbox？
- 二维布局用Grid？
- 它们可以结合使用吗？

请分享一下你的选择策略和实际案例。`,
    authorId: 'user-2',
    author: otherUsers[0],
    tags: ['tag-10'],
    category: '前端开发',
    difficulty: 'beginner',
    voteCount: 312,
    answerCount: 8,
    viewCount: 6800,
    hasAcceptedAnswer: true,
    createdAt: new Date('2025-05-16T10:00:00'),
    updatedAt: new Date('2025-05-16T10:00:00'),
  },
  {
    id: 'q-10',
    title: '如何用动态规划解决「打家劫舍」系列问题？',
    content: `## 问题

经典的打家劫舍问题：
1. 不能同时抢劫相邻的房屋
2. 求最大抢劫金额

进阶版本：
- 房屋是环形排列的
- 二叉树结构的房屋

请系统讲解这三种情况的动态规划解法思路。`,
    authorId: 'user-3',
    author: otherUsers[1],
    tags: ['tag-8'],
    category: '算法与数据结构',
    difficulty: 'intermediate',
    voteCount: 178,
    answerCount: 5,
    viewCount: 3200,
    hasAcceptedAnswer: true,
    createdAt: new Date('2025-05-21T14:30:00'),
    updatedAt: new Date('2025-05-21T14:30:00'),
  },
]

export const mockAnswers: Answer[] = [
  {
    id: 'a-1',
    questionId: 'q-1',
    content: `## useEffect 处理异步操作的最佳实践

### 1. 使用 AbortController 取消请求

\`\`\`jsx
useEffect(() => {
  const controller = new AbortController()
  
  const fetchData = async () => {
    try {
      const result = await fetch('/api/data', {
        signal: controller.signal
      })
      setData(result)
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error)
      }
    }
  }
  
  fetchData()
  
  return () => controller.abort()
}, [])
\`\`\`

### 2. 使用 useRef 追踪组件挂载状态

\`\`\`jsx
const isMounted = useRef(true)

useEffect(() => {
  isMounted.current = true
  return () => { isMounted.current = false }
}, [])

useEffect(() => {
  fetchData().then(result => {
    if (isMounted.current) {
      setData(result)
    }
  })
}, [])
\`\`\`

### 3. 自定义 Hook 封装

\`\`\`jsx
function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  
  useEffect(() => {
    let isCancelled = false
    setState(s => ({ ...s, loading: true }))
    
    asyncFn()
      .then(data => !isCancelled && setState({ data, loading: false, error: null }))
      .catch(error => !isCancelled && setState({ data: null, loading: false, error }))
    
    return () => { isCancelled = true }
  }, deps)
  
  return state
}
\`\`\`

关键要点：
- 始终在 cleanup 函数中清理副作用
- 使用 \`useCallback\` 稳定依赖项引用
- 考虑使用 \`React Query\` 或 \`SWR\` 等库管理服务器状态`,
    authorId: 'user-1',
    author: mockUser,
    voteCount: 89,
    isAccepted: true,
    isBestAnswer: true,
    createdAt: new Date('2025-05-20T11:00:00'),
    updatedAt: new Date('2025-05-20T11:00:00'),
  },
  {
    id: 'a-2',
    questionId: 'q-1',
    content: `### 简单的解决方案

如果你的环境支持可选链操作符，可以这样：

\`\`\`jsx
useEffect(() => {
  let active = true
  fetchData().then(data => {
    if (active) setData(data)
  })
  return () => { active = false }
}, [])
\`\`\`

这种方式简单有效，适合大多数场景。`,
    authorId: 'user-2',
    author: otherUsers[0],
    voteCount: 23,
    isAccepted: false,
    isBestAnswer: false,
    createdAt: new Date('2025-05-20T12:30:00'),
    updatedAt: new Date('2025-05-20T12:30:00'),
  },
  {
    id: 'a-3',
    questionId: 'q-2',
    content: `## 泛型约束实现类型安全的工厂函数

使用 \`extends\` 关键字来约束泛型参数：

\`\`\`typescript
interface Creatable {
  create(): void
}

function createInstance<T extends Creatable>(constructor: new () => T): T {
  const instance = new constructor()
  instance.create()
  return instance
}
\`\`\`

这样就确保了传入的类必须实现 \`Creatable\` 接口：

\`\`\`typescript
class ValidClass implements Creatable {
  create() { console.log('created') }
}

class InvalidClass {
  // 没有 create 方法
}

createInstance(ValidClass)    // ✓ 正确
createInstance(InvalidClass)  // ✗ 编译错误
\`\`\`

更进一步，可以使用工厂模式：

\`\`\`typescript
interface Factory<T extends Creatable> {
  create(): T
}

class ConcreteFactory<T extends Creatable> implements Factory<T> {
  constructor(private ctor: new () => T) {}
  create(): T {
    return new this.ctor()
  }
}
\`\`\``,
    authorId: 'user-1',
    author: mockUser,
    voteCount: 56,
    isAccepted: true,
    isBestAnswer: true,
    createdAt: new Date('2025-05-22T15:00:00'),
    updatedAt: new Date('2025-05-22T15:00:00'),
  },
  {
    id: 'a-4',
    questionId: 'q-3',
    content: `## Python实现高效LRU缓存

### 双向链表 + 哈希表方案

\`\`\`python
class ListNode:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.head = ListNode()
        self.tail = ListNode()
        self.head.next = self.tail
        self.tail.prev = self.head
    
    def _remove_node(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev
    
    def _add_to_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node
    
    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove_node(node)
        self._add_to_front(node)
        return node.value
    
    def put(self, key: int, value: int):
        if key in self.cache:
            self._remove_node(self.cache[key])
        node = ListNode(key, value)
        self._add_to_front(node)
        self.cache[key] = node
        if len(self.cache) > self.capacity:
            lru = self.tail.prev
            self._remove_node(lru)
            del self.cache[lru.key]
\`\`\`

### OrderedDict简化实现

\`\`\`python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()
    
    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]
    
    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
\`\`\`

两种实现的时间复杂度都是O(1)。`,
    authorId: 'user-1',
    author: mockUser,
    voteCount: 124,
    isAccepted: true,
    isBestAnswer: true,
    createdAt: new Date('2025-05-18T10:30:00'),
    updatedAt: new Date('2025-05-18T10:30:00'),
  },
  {
    id: 'a-5',
    questionId: 'q-4',
    content: `## Vue3组合式API计算属性

使用\`computed\`函数创建计算属性：

\`\`\`javascript
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

const fullName = computed(() => {
  return firstName.value + lastName.value
})

console.log(fullName.value) // 输出：张三
\`\`\`

### computed vs watch

| 特性 | computed | watch |
|------|----------|-------|
| 用途 | 派生状态 | 副作用 |
| 缓存 | ✓ 有缓存 | ✗ 无缓存 |
| 返回值 | ✓ 有返回值 | ✗ 无返回值 |
| 懒执行 | ✓ 懒执行 | ✗ 立即执行 |

**选择建议**：
- 需要从已有状态派生新状态 → 用 \`computed\`
- 需要在状态变化时执行操作 → 用 \`watch\`
- 需要异步操作 → 用 \`watch\` 或 \`watchEffect\``,
    authorId: 'user-2',
    author: otherUsers[0],
    voteCount: 34,
    isAccepted: false,
    isBestAnswer: false,
    createdAt: new Date('2025-05-24T17:00:00'),
    updatedAt: new Date('2025-05-24T17:00:00'),
  },
  {
    id: 'a-6',
    questionId: 'q-5',
    content: `## MySQL多表查询优化

### 1. 添加适当的索引

确保JOIN条件和WHERE条件的列上有索引：

\`\`\`sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_products_category_id ON products(category_id);
\`\`\`

### 2. 使用EXPLAIN分析执行计划

\`\`\`sql
EXPLAIN SELECT 
  u.name,
  c.name as category,
  SUM(oi.quantity * oi.price) as total
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN products p ON o.product_id = p.id
JOIN categories c ON p.category_id = c.id
JOIN order_items oi ON o.id = oi.order_id
GROUP BY u.id, c.id;
\`\`\`

### 3. 考虑反范式化设计

如果查询频率高，可以在orders表中冗余category_id字段，减少JOIN。

### 4. 使用覆盖索引

创建包含所需字段的复合索引，避免回表查询。

### 5. 考虑使用汇总表

预先计算汇总数据，定时更新。`,
    authorId: 'user-1',
    author: mockUser,
    voteCount: 145,
    isAccepted: true,
    isBestAnswer: true,
    createdAt: new Date('2025-05-15T12:00:00'),
    updatedAt: new Date('2025-05-15T12:00:00'),
  },
  {
    id: 'a-7',
    questionId: 'q-7',
    content: `## 处理类别不平衡的高级方法

### 1. SMOTE (Synthetic Minority Over-sampling Technique)

\`\`\`python
from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

smote = SMOTE(sampling_strategy='auto', random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
\`\`\`

### 2. SMOTE变体

- **SMOTENC**：处理混合类型特征
- **SMOTEN**：处理纯类别特征
- **BorderlineSMOTE**：只对边界样本过采样
- **SVMSMOTE**：使用SVM确定过采样区域

### 3. 集成方法

\`\`\`python
from imblearn.ensemble import BalancedRandomForestClassifier

clf = BalancedRandomForestClassifier(
  n_estimators=100,
  sampling_strategy='auto',
  random_state=42
)
\`\`\`

### 4. 成本敏感学习

\`\`\`python
from sklearn.ensemble import RandomForestClassifier

# 通过class_weight设置类别权重
clf = RandomForestClassifier(
  class_weight='balanced',  # 自动调整权重
  n_estimators=100
)
\`\`\`

### 5. 评估指标选择

不要使用准确率，使用：
- **Precision-Recall AUC**
- **F1-Score**
- **ROC AUC**
- **混淆矩阵**`,
    authorId: 'user-2',
    author: otherUsers[0],
    voteCount: 98,
    isAccepted: true,
    isBestAnswer: true,
    createdAt: new Date('2025-05-19T16:00:00'),
    updatedAt: new Date('2025-05-19T16:00:00'),
  },
  {
    id: 'a-8',
    questionId: 'q-8',
    content: `## 撤销已push的提交

### 安全方法：git revert

\`git revert\`创建一个新的提交来撤销更改，保留历史记录：

\`\`\`bash
# 撤销最近一次提交
git revert HEAD

# 撤销特定提交
git revert abc1234

# 推送到远程
git push origin main
\`\`\`

### 彻底删除：git reset + force push

\`\`\`bash
# 回退到上一个提交（保留更改在工作区）
git reset --soft HEAD~1

# 或者彻底删除（不保留更改）
git reset --hard HEAD~1

# 强制推送（⚠️ 会修改远程历史）
git push --force origin main
\`\`\`

### 清除敏感信息

如果敏感信息已被他人拉取，需要使用git filter-repo：

\`\`\`bash
# 安装 git-filter-repo
pip install git-filter-repo

# 从历史中删除敏感文件
git filter-repo --path sensitive-file.txt --invert-paths

# 强制推送
git push --force --all
\`\`\`

### 建议

- 公开仓库 → 用\`git revert\`，不要force push
- 私有仓库且未被他人拉取 → 可以\`git reset --force\`
- 敏感信息已泄露 → 更换密钥 + 使用git-filter-repo清理历史`,
    authorId: 'user-3',
    author: otherUsers[1],
    voteCount: 189,
    isAccepted: true,
    isBestAnswer: true,
    createdAt: new Date('2025-05-17T14:00:00'),
    updatedAt: new Date('2025-05-17T14:00:00'),
  },
  {
    id: 'a-9',
    questionId: 'q-9',
    content: `## CSS Grid vs Flexbox 选择指南

### Flexbox适用场景

- **一维布局**：一行或一列
- **导航栏/工具栏**
- **卡片列表**（单行）
- **对齐元素**

\`\`\`css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
\`\`\`

### Grid适用场景

- **二维布局**：多行多列
- **整页布局**（header/sidebar/main/footer）
- **图片画廊**
- **仪表盘**

\`\`\`css
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}
\`\`\`

### 结合使用

Grid用于整体布局，Flexbox用于组件内部：

\`\`\`css
.page {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 20px;
}

.card {
  display: flex;
  flex-direction: column;
  padding: 16px;
}
\`\`\`

### 速查表

| 需求 | 推荐 |
|------|------|
| 单行/单列 | Flexbox |
| 多行多列 | Grid |
| 元素对齐 | 都可以 |
| 内容自适应 | Flexbox |
| 精确控制位置 | Grid |
| 重叠元素 | Grid |`,
    authorId: 'user-4',
    author: otherUsers[2],
    voteCount: 234,
    isAccepted: true,
    isBestAnswer: true,
    createdAt: new Date('2025-05-16T11:00:00'),
    updatedAt: new Date('2025-05-16T11:00:00'),
  },
  {
    id: 'a-10',
    questionId: 'q-10',
    content: `## 打家劫舍系列动态规划解法

### 1. 基础版本（线性排列）

\`\`\`python
def rob(nums):
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    
    dp = [0] * len(nums)
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])
    
    for i in range(2, len(nums)):
        dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    
    return dp[-1]
\`\`\`

状态转移：\`dp[i] = max(dp[i-1], dp[i-2] + nums[i])\`

### 2. 环形排列

环形意味着首尾相连，不能同时抢劫。分解为两个子问题：

\`\`\`python
def rob(nums):
    if len(nums) == 1:
        return nums[0]
    
    def rob_linear(arr):
        prev, curr = 0, 0
        for num in arr:
            prev, curr = curr, max(curr, prev + num)
        return curr
    
    return max(rob_linear(nums[:-1]), rob_linear(nums[1:]))
\`\`\`

### 3. 二叉树结构

\`\`\`python
def rob(root):
    def dfs(node):
        if not node:
            return (0, 0)
        
        left = dfs(node.left)
        right = dfs(node.right)
        
        # 当前节点被抢劫：不能抢劫子节点
        rob_curr = node.val + left[1] + right[1]
        
        # 当前节点不被抢劫：子节点可选
        not_rob_curr = max(left) + max(right)
        
        return (rob_curr, not_rob_curr)
    
    return max(dfs(root))
\`\`\`

### 核心思想

每种情况都是"选或不选"的决策，关键在于找到正确的状态定义和转移方程。`,
    authorId: 'user-3',
    author: otherUsers[1],
    voteCount: 134,
    isAccepted: true,
    isBestAnswer: true,
    createdAt: new Date('2025-05-21T15:00:00'),
    updatedAt: new Date('2025-05-21T15:00:00'),
  },
]

export const mockDailyChallenges: DailyChallenge[] = [
  {
    id: 'dc-1',
    questionId: 'q-1',
    question: mockQuestions[0],
    date: new Date('2025-05-26'),
    isCompleted: false,
    isCorrect: null,
  },
]

export const mockQuizHistory: QuizQuestion[] = [
  {
    id: 'quiz-1',
    questionId: 'q-2',
    question: mockQuestions[1],
    userAnswer: '使用 extends 关键字',
    isCorrect: true,
    attemptedAt: new Date('2025-05-25T10:00:00'),
  },
  {
    id: 'quiz-2',
    questionId: 'q-5',
    question: mockQuestions[4],
    userAnswer: '添加索引',
    isCorrect: false,
    attemptedAt: new Date('2025-05-24T15:30:00'),
    correctAnswer: '添加索引 + 优化执行计划 + 考虑反范式化',
  },
  {
    id: 'quiz-3',
    questionId: 'q-6',
    question: mockQuestions[5],
    userAnswer: '使用网络配置',
    isCorrect: true,
    attemptedAt: new Date('2025-05-23T12:00:00'),
  },
]

export const mockKnowledgeAreas: KnowledgeArea[] = [
  { tagId: 'tag-1', tagName: 'JavaScript', score: 85, questionsAnswered: 28, answersAccepted: 15 },
  { tagId: 'tag-2', tagName: 'TypeScript', score: 78, questionsAnswered: 22, answersAccepted: 12 },
  { tagId: 'tag-4', tagName: 'React', score: 82, questionsAnswered: 25, answersAccepted: 14 },
  { tagId: 'tag-8', tagName: '算法', score: 75, questionsAnswered: 20, answersAccepted: 11 },
  { tagId: 'tag-3', tagName: 'Python', score: 45, questionsAnswered: 10, answersAccepted: 4 },
  { tagId: 'tag-7', tagName: 'MySQL', score: 38, questionsAnswered: 8, answersAccepted: 3 },
]

export const mockPointsHistory = [
  { date: '2025-05-20', points: 150, reason: '回答被采纳' },
  { date: '2025-05-21', points: 80, reason: '回答问题' },
  { date: '2025-05-22', points: 120, reason: '回答被采纳' },
  { date: '2025-05-23', points: 50, reason: '每日挑战完成' },
  { date: '2025-05-24', points: 200, reason: '回答被采纳' },
  { date: '2025-05-25', points: 30, reason: '回答问题' },
  { date: '2025-05-26', points: 100, reason: '徽章解锁奖励' },
]

export const levelConfig = {
  1: { name: '新手', minPoints: 0, icon: 'Seedling' },
  2: { name: '学徒', minPoints: 100, icon: 'Sprout' },
  3: { name: '初学者', minPoints: 300, icon: 'Flower' },
  4: { name: '进阶者', minPoints: 600, icon: 'Flower2' },
  5: { name: '熟练者', minPoints: 1000, icon: 'Trees' },
  6: { name: '高手', minPoints: 1500, icon: 'TreeDeciduous' },
  7: { name: '精英', minPoints: 2100, icon: 'TreePine' },
  8: { name: '专家', minPoints: 2800, icon: 'Award' },
  9: { name: '资深专家', minPoints: 3600, icon: 'Medal' },
  10: { name: '大师', minPoints: 4500, icon: 'Trophy' },
  11: { name: '宗师', minPoints: 5500, icon: 'Crown' },
  12: { name: '传奇', minPoints: 6600, icon: 'Gem' },
}
