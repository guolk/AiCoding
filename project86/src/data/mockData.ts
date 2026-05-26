import { AppState } from '../types';

export const mockData: AppState = {
  techStacks: [
    {
      id: 'ts1',
      name: '前端开发',
      icon: '🖥️',
      description: '从HTML/CSS基础到现代前端框架的完整学习路径',
      roadmap: [
        {
          id: 'node1',
          name: 'HTML & CSS基础',
          description: '学习网页结构和样式设计基础',
          status: 'mastered',
          level: 1,
          position: { x: 50, y: 50 },
          prerequisites: [],
          resources: [
            {
              id: 'r1',
              name: 'MDN Web文档',
              type: 'document',
              url: 'https://developer.mozilla.org',
              rating: 5,
              review: '最权威的前端学习资源，内容详实',
              completed: true
            }
          ],
          notes: [
            {
              id: 'n1',
              title: 'CSS Flexbox布局笔记',
              content: 'Flexbox是一维布局模型，非常适合处理行或列中的元素排列。',
              codeExamples: [
                {
                  id: 'ce1',
                  title: 'Flex容器基础',
                  language: 'css',
                  code: '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}',
                  description: '水平垂直居中的经典实现'
                }
              ],
              createdAt: '2026-01-15',
              updatedAt: '2026-01-15'
            }
          ]
        },
        {
          id: 'node2',
          name: 'JavaScript核心',
          description: '深入学习JavaScript语言特性和编程范式',
          status: 'completed',
          level: 1,
          position: { x: 250, y: 50 },
          prerequisites: ['node1'],
          resources: [
            {
              id: 'r2',
              name: 'JavaScript高级程序设计',
              type: 'book',
              url: 'https://example.com',
              rating: 5,
              review: '红宝书，JS必备经典',
              completed: true
            }
          ],
          notes: []
        },
        {
          id: 'node3',
          name: 'TypeScript',
          description: '类型安全的JavaScript超集',
          status: 'in_progress',
          level: 2,
          position: { x: 150, y: 150 },
          prerequisites: ['node2'],
          resources: [
            {
              id: 'r3',
              name: 'TypeScript官方文档',
              type: 'document',
              url: 'https://www.typescriptlang.org',
              rating: 4,
              review: '文档清晰，示例丰富',
              completed: false
            }
          ],
          notes: []
        },
        {
          id: 'node4',
          name: 'React框架',
          description: '构建用户界面的JavaScript库',
          status: 'in_progress',
          level: 2,
          position: { x: 350, y: 150 },
          prerequisites: ['node2'],
          resources: [
            {
              id: 'r4',
              name: 'React官方教程',
              type: 'course',
              url: 'https://react.dev',
              rating: 5,
              review: '官方教程深入浅出',
              completed: true
            }
          ],
          notes: []
        },
        {
          id: 'node5',
          name: '性能优化',
          description: '前端性能优化最佳实践',
          status: 'not_started',
          level: 3,
          position: { x: 250, y: 250 },
          prerequisites: ['node3', 'node4'],
          resources: [],
          notes: []
        }
      ]
    },
    {
      id: 'ts2',
      name: '数据结构与算法',
      icon: '📊',
      description: '计算机科学核心基础，大厂面试必备',
      roadmap: [
        {
          id: 'ds1',
          name: '数组与链表',
          description: '线性数据结构基础',
          status: 'completed',
          level: 1,
          position: { x: 50, y: 50 },
          prerequisites: [],
          resources: [],
          notes: []
        },
        {
          id: 'ds2',
          name: '栈与队列',
          description: '受限线性表的应用',
          status: 'completed',
          level: 1,
          position: { x: 250, y: 50 },
          prerequisites: [],
          resources: [],
          notes: []
        },
        {
          id: 'ds3',
          name: '树与二叉树',
          description: '层次化数据结构',
          status: 'in_progress',
          level: 2,
          position: { x: 150, y: 150 },
          prerequisites: ['ds1'],
          resources: [],
          notes: []
        },
        {
          id: 'ds4',
          name: '动态规划',
          description: '最优子结构问题求解',
          status: 'not_started',
          level: 3,
          position: { x: 350, y: 250 },
          prerequisites: ['ds3'],
          resources: [],
          notes: []
        }
      ]
    }
  ],
  projects: [
    {
      id: 'p1',
      name: '在线代码学习平台',
      techStack: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
      description: '一个功能完整的在线代码学习和练习平台，支持代码实时编译、学习路径追踪等功能。',
      features: [
        '支持JavaScript/Python等多语言在线编译',
        '学习路径可视化规划',
        '代码练习自动评测',
        '用户学习进度统计'
      ],
      challenges: '代码编辑器的语法高亮和实时补全实现复杂，需要处理大量的代码解析逻辑；多语言编译环境的安全性隔离是一大挑战。',
      solutions: '采用Monaco Editor作为代码编辑器，利用其强大的语言服务API实现语法高亮和自动补全；使用Docker容器进行编译环境隔离，确保系统安全。',
      sourceCodeUrl: 'https://github.com/username/code-learning-platform',
      demoUrl: 'https://demo.code-learning.com',
      media: [
        {
          id: 'm1',
          type: 'screenshot',
          url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
          description: '代码编辑界面'
        },
        {
          id: 'm2',
          type: 'screenshot',
          url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
          description: '学习路径界面'
        }
      ],
      highlights: [
        '自主设计并实现了基于Docker的多语言代码安全沙箱，支持10+编程语言',
        '优化了代码补全算法，响应速度从500ms降低到150ms',
        '平台累计服务10000+用户，日活达到500+',
        '项目获得学校创新创业大赛一等奖'
      ],
      startDate: '2025-09-01',
      endDate: '2026-03-15'
    },
    {
      id: 'p2',
      name: '智能任务管理系统',
      techStack: ['Vue3', 'Pinia', 'Express', 'PostgreSQL'],
      description: '基于AI的智能任务管理和日程安排系统，支持任务优先级自动排序和智能提醒。',
      features: [
        'AI驱动的任务优先级自动排序',
        '自然语言任务创建',
        '团队协作和任务分配',
        '数据可视化报表'
      ],
      challenges: '如何根据用户行为习惯准确预测任务完成时间，以及多人协作时的实时数据同步问题。',
      solutions: '构建了基于用户历史数据的机器学习模型预测任务完成时间；使用WebSocket实现实时数据同步，确保团队成员看到的状态一致。',
      sourceCodeUrl: 'https://github.com/username/smart-task-manager',
      demoUrl: 'https://demo.smart-task.com',
      media: [
        {
          id: 'm3',
          type: 'screenshot',
          url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800',
          description: '任务看板界面'
        }
      ],
      highlights: [
        '设计了基于LSTM的任务完成时间预测模型，准确率达到85%',
        '实现了OT算法解决多人编辑冲突问题',
        '支持1000+用户同时在线协作'
      ],
      startDate: '2025-03-01',
      endDate: '2025-08-20'
    }
  ],
  codingProblems: [
    {
      id: 'cp1',
      platform: 'leetcode',
      title: '两数之和',
      difficulty: 'easy',
      url: 'https://leetcode.com/problems/two-sum/',
      solution: '使用哈希表存储已遍历的数字及其索引，遍历数组时检查目标值与当前值的差是否在哈希表中。',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      completedDate: '2026-01-10',
      isWrong: false,
      wrongNotes: '',
      retryCount: 1,
      tags: ['数组', '哈希表']
    },
    {
      id: 'cp2',
      platform: 'leetcode',
      title: '最长回文子串',
      difficulty: 'medium',
      url: 'https://leetcode.com/problems/longest-palindromic-substring/',
      solution: '使用中心扩展法，对每个字符和每对相邻字符作为中心，向两边扩展寻找最长回文。',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      completedDate: '2026-01-15',
      isWrong: true,
      wrongNotes: '一开始想用动态规划，但状态转移方程写错了。后来改用中心扩展法更直观。需要注意奇偶长度回文的处理。',
      retryCount: 3,
      tags: ['字符串', '动态规划']
    },
    {
      id: 'cp3',
      platform: 'leetcode',
      title: '合并K个升序链表',
      difficulty: 'hard',
      url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
      solution: '使用最小堆（优先队列）存储每个链表的当前节点，每次取出最小值节点加入结果，然后将该节点的下一个节点加入堆中。',
      timeComplexity: 'O(n log k)',
      spaceComplexity: 'O(k)',
      completedDate: '2026-01-20',
      isWrong: true,
      wrongNotes: '第一次尝试两两合并，时间复杂度较高。使用优先队列可以优化到n log k。要注意堆的比较函数写法。',
      retryCount: 2,
      tags: ['链表', '堆', '分治']
    },
    {
      id: 'cp4',
      platform: 'nowcoder',
      title: '二叉树的层序遍历',
      difficulty: 'medium',
      url: 'https://www.nowcoder.com',
      solution: '使用队列进行BFS，每次处理一层的所有节点，并记录每一层的值。',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      completedDate: '2026-01-25',
      isWrong: false,
      wrongNotes: '',
      retryCount: 1,
      tags: ['树', 'BFS']
    },
    {
      id: 'cp5',
      platform: 'leetcode',
      title: '爬楼梯',
      difficulty: 'easy',
      url: 'https://leetcode.com/problems/climbing-stairs/',
      solution: '动态规划，dp[i] = dp[i-1] + dp[i-2]，本质是斐波那契数列。',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      completedDate: '2026-02-01',
      isWrong: false,
      wrongNotes: '',
      retryCount: 1,
      tags: ['动态规划']
    },
    {
      id: 'cp6',
      platform: 'leetcode',
      title: '接雨水',
      difficulty: 'hard',
      url: 'https://leetcode.com/problems/trapping-rain-water/',
      solution: '使用双指针，左右指针分别从两端向中间移动，记录左右两侧的最大高度，根据两侧最大高度的较小值计算当前位置能接的雨水量。',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      completedDate: '2026-02-05',
      isWrong: true,
      wrongNotes: '一开始想的是暴力解法，对每个位置找左右最大高度，时间O(n²)。双指针方法很巧妙，需要理解为什么可以这样移动指针。',
      retryCount: 4,
      tags: ['数组', '双指针', '单调栈']
    }
  ],
  interviewQuestions: [
    {
      id: 'iq1',
      category: 'JavaScript',
      question: '什么是闭包？闭包的应用场景有哪些？',
      answer: '闭包是指有权访问另一个函数作用域中变量的函数。形成闭包的三个条件：1) 函数嵌套函数；2) 内部函数引用外部函数的变量；3) 内部函数被返回或在外部被调用。\n\n应用场景：\n1. 数据私有化 - 模拟私有变量\n2. 函数柯里化 - 部分应用函数参数\n3. 事件处理器和回调函数\n4. 防抖和节流的实现\n5. 模块化开发',
      mastery: 90,
      lastReviewed: '2026-05-20'
    },
    {
      id: 'iq2',
      category: 'JavaScript',
      question: 'Promise的三种状态是什么？如何实现一个Promise？',
      answer: 'Promise有三种状态：pending（等待态）、fulfilled（成功态）、rejected（失败态）。状态只能从pending变为fulfilled或rejected，且不可逆。\n\n实现Promise的核心要点：\n1. 构造函数接收一个executor函数，该函数接收resolve和reject两个参数\n2. 维护状态、成功值、失败原因三个内部变量\n3. 维护成功回调队列和失败回调队列\n4. then方法支持链式调用，返回新的Promise\n5. 处理异步情况，在resolve/reject时执行回调队列',
      mastery: 85,
      lastReviewed: '2026-05-18'
    },
    {
      id: 'iq3',
      category: 'React',
      question: 'React的生命周期有哪些？在各阶段通常做什么？',
      answer: 'React 16.8之后推荐使用Hooks，但类组件生命周期仍需了解：\n\n挂载阶段：\n- constructor：初始化state、绑定方法\n- static getDerivedStateFromProps：根据props更新state\n- render：渲染UI\n- componentDidMount：发送请求、订阅事件、操作DOM\n\n更新阶段：\n- static getDerivedStateFromProps\n- shouldComponentUpdate：性能优化，判断是否需要更新\n- render\n- getSnapshotBeforeUpdate：获取更新前DOM状态\n- componentDidUpdate：更新后操作，如DOM操作、请求\n\n卸载阶段：\n- componentWillUnmount：清理定时器、取消订阅、取消请求',
      mastery: 80,
      lastReviewed: '2026-05-15'
    },
    {
      id: 'iq4',
      category: '计算机网络',
      question: 'HTTP和HTTPS的区别？HTTPS的握手过程？',
      answer: 'HTTP和HTTPS的区别：\n1. HTTP明文传输，HTTPS加密传输\n2. HTTP默认80端口，HTTPS默认443端口\n3. HTTPS需要CA证书\n4. HTTPS比HTTP更安全但性能略低\n\nHTTPS握手过程（TLS 1.2）：\n1. 客户端发送Client Hello，包含随机数、支持的加密套件\n2. 服务器返回Server Hello，选择加密套件、发送证书、服务器随机数\n3. 客户端验证证书，生成预主密钥，用服务器公钥加密后发送\n4. 双方用三个随机数生成会话密钥\n5. 客户端发送Finished，用会话密钥加密\n6. 服务器发送Finished，用会话密钥加密\n7. 握手完成，开始加密通信',
      mastery: 75,
      lastReviewed: '2026-05-10'
    },
    {
      id: 'iq5',
      category: '算法',
      question: '快速排序的原理和时间复杂度？',
      answer: '快速排序采用分治思想：\n1. 选择一个基准元素（pivot）\n2. 分区：将小于基准的放左边，大于基准的放右边\n3. 递归对左右两部分进行快排\n\n时间复杂度：\n- 最好O(n log n)：每次分区均匀\n- 平均O(n log n)\n- 最坏O(n²)：数组已排序时，可通过随机选择基准优化\n\n空间复杂度：O(log n) ~ O(n)，取决于递归栈深度\n\n优化方式：\n1. 三数取中法选择基准\n2. 小数组用插入排序\n3. 尾递归优化',
      mastery: 95,
      lastReviewed: '2026-05-22'
    }
  ],
  mockInterviews: [
    {
      id: 'mi1',
      date: '2026-05-20',
      company: '字节跳动',
      position: '前端工程师',
      overallScore: 75,
      notes: '整体表现尚可，但算法部分需要加强，React Hooks的原理回答不够深入。',
      questions: [
        {
          question: '解释React Fiber架构',
          answerScore: 7,
          improvement: '需要更详细地解释Fiber的优先级调度和时间切片机制，以及为什么需要Fiber（解决16版本之前Stack Reconciler的问题）。'
        },
        {
          question: '手写实现Promise.all',
          answerScore: 6,
          improvement: '处理边界情况不够完善，比如空数组的处理、错误快速返回的逻辑。需要多练习手写代码。'
        },
        {
          question: '前端性能优化有哪些手段？',
          answerScore: 8,
          improvement: '回答得比较全面，但可以结合具体项目经验，说明优化前后的数据对比。'
        }
      ]
    },
    {
      id: 'mi2',
      date: '2026-05-15',
      company: '阿里巴巴',
      position: '前端工程师',
      overallScore: 82,
      notes: '基础不错，项目经验丰富，但系统设计能力需要提升。',
      questions: [
        {
          question: '介绍一个你最有成就感的项目',
          answerScore: 9,
          improvement: '项目介绍很清晰，亮点突出。可以多强调自己的技术决策和解决的核心难题。'
        },
        {
          question: '如果让你设计一个低代码平台，你会怎么考虑？',
          answerScore: 7,
          improvement: '考虑不够全面，需要从组件模型、编排引擎、状态管理、扩展机制等方面系统性地思考。'
        }
      ]
    }
  ],
  knowledgeGaps: [
    {
      id: 'kg1',
      topic: 'WebAssembly',
      category: '前端进阶',
      description: 'WebAssembly的原理和应用场景，以及如何在React项目中集成WASM模块。',
      status: 'identified',
      priority: 'medium'
    },
    {
      id: 'kg2',
      topic: '微前端架构',
      category: '架构设计',
      description: 'qiankun、micro-app等微前端框架的原理和实现，以及在大型项目中的最佳实践。',
      status: 'learning',
      priority: 'high'
    },
    {
      id: 'kg3',
      topic: 'GraphQL',
      category: '后端/API',
      description: 'GraphQL的核心概念，与REST的对比，以及Apollo/Relay的使用。',
      status: 'identified',
      priority: 'low'
    },
    {
      id: 'kg4',
      topic: 'Rust',
      category: '编程语言',
      description: 'Rust语言基础，所有权系统，以及WebAssembly编译。',
      status: 'identified',
      priority: 'low'
    },
    {
      id: 'kg5',
      topic: 'LRU缓存实现',
      category: '算法',
      description: '使用哈希表+双向链表实现LRU缓存，O(1)时间复杂度的get和put操作。',
      status: 'mastered',
      priority: 'high'
    }
  ],
  jobApplications: [
    {
      id: 'ja1',
      companyName: '字节跳动',
      position: '前端工程师',
      researchNotes: '字节跳动是中国互联网头部公司，技术氛围浓厚，前端技术栈主要是React + TypeScript。重视算法和工程能力，面试轮次多（通常3-4轮技术+1轮HR）。',
      companyCulture: '扁平化管理，强调ByteStyle（追求极致、务实、坦诚清晰、始终创业），工作节奏快，成长机会多。',
      keyProducts: '抖音、今日头条、飞书、TikTok、剪映等',
      status: 'interviewing',
      appliedDate: '2026-05-10',
      contactPerson: '张HR',
      contactEmail: 'hr-zhang@bytedance.com',
      interviewDates: ['2026-05-15', '2026-05-20', '2026-05-25'],
      followUpNotes: '已完成二面，等待三面安排。一面考了算法（三数之和、链表反转），二面考了项目深挖和系统设计。'
    },
    {
      id: 'ja2',
      companyName: '阿里巴巴',
      position: '前端工程师',
      researchNotes: '阿里巴巴是中国最大的电商和云计算公司，前端技术栈以React和Vue为主，内部有大量开源项目。面试重视技术深度和项目经验。',
      companyCulture: '强调六脉神剑价值观（客户第一、团队合作、拥抱变化、诚信、激情、敬业），技术氛围好，有完善的培训体系。',
      keyProducts: '淘宝、天猫、阿里云、钉钉、支付宝等',
      status: 'applied',
      appliedDate: '2026-05-12',
      contactPerson: '李HR',
      contactEmail: 'hr-li@alibaba.com',
      interviewDates: ['2026-05-18'],
      followUpNotes: '已完成一面，问了很多JavaScript基础和React原理，正在等待二面通知。'
    },
    {
      id: 'ja3',
      companyName: '腾讯',
      position: '前端工程师',
      researchNotes: '腾讯社交和游戏领域的巨头，前端技术栈多样，微信小程序是特色。WXG部门技术氛围最好。',
      companyCulture: '瑞雪文化，强调正直、尽责、合作、创新。相对稳定，工作生活平衡较好。',
      keyProducts: '微信、QQ、王者荣耀、腾讯云等',
      status: 'researching',
      appliedDate: '',
      contactPerson: '',
      contactEmail: '',
      interviewDates: [],
      followUpNotes: '正在了解WXG和CDG的岗位机会，准备内推。'
    },
    {
      id: 'ja4',
      companyName: '美团',
      position: '前端工程师',
      researchNotes: '美团在外卖和到店领域市场份额第一，技术务实，重视工程化。前端团队有很多开源贡献。',
      companyCulture: '以客户为中心，长期有耐心，技术氛围浓厚。',
      keyProducts: '美团外卖、大众点评、美团优选等',
      status: 'offer',
      appliedDate: '2026-04-20',
      contactPerson: '王HR',
      contactEmail: 'hr-wang@meituan.com',
      interviewDates: ['2026-04-25', '2026-04-30', '2026-05-05'],
      followUpNotes: '已收到offer，薪资待遇不错，但是需要在5月底前答复。需要和字节的offer对比。'
    },
    {
      id: 'ja5',
      companyName: '京东',
      position: '前端工程师',
      researchNotes: '京东电商和物流实力强，技术栈偏向Vue。零售和云业务发展快。',
      companyCulture: '强调诚信、客户为先、激情、学习、团队精神、追求卓越。',
      keyProducts: '京东商城、京东物流、京东云等',
      status: 'rejected',
      appliedDate: '2026-04-15',
      contactPerson: '赵HR',
      contactEmail: 'hr-zhao@jd.com',
      interviewDates: ['2026-04-20'],
      followUpNotes: '一面后被拒，原因是算法题做得不够好。需要加强算法练习。'
    }
  ]
};
