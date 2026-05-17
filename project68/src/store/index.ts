import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Idea, Project, Tag, AppSettings, IdeaSource, IdeaEmotion, IdeaStatus, ProjectStatus, IncubationEntry, FeasibilityAssessment, FermentReminder, PoqEntry, Milestone, ResourceRequirement, MediaAttachment } from '@/types';
import { generateId } from '@/lib/utils';

interface AppState {
  ideas: Idea[];
  projects: Project[];
  tags: Tag[];
  settings: AppSettings;
  
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'incubationEntries' | 'fermentReminders' | 'status' | 'media'> & { media?: MediaAttachment[] }) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  getIdea: (id: string) => Idea | undefined;
  
  addIncubationEntry: (ideaId: string, entry: Omit<IncubationEntry, 'id' | 'date'>) => void;
  updateFeasibility: (ideaId: string, assessment: Omit<FeasibilityAssessment, 'date'>) => void;
  addFermentReminder: (ideaId: string, days: number) => void;
  
  convertToProject: (ideaId: string, projectData: Omit<Project, 'id' | 'ideaId' | 'createdAt' | 'updatedAt' | 'milestones' | 'resources' | 'poqEntries' | 'status'> & { milestones?: Omit<Milestone, 'id' | 'completed'>[], resources?: Omit<ResourceRequirement, 'id' | 'secured'>[] }) => void;
  
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'milestones' | 'resources' | 'poqEntries'> & { milestones?: Omit<Milestone, 'id'>[], resources?: Omit<ResourceRequirement, 'id'>[], poqEntries?: PoqEntry[] }) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  
  addMilestone: (projectId: string, milestone: Omit<Milestone, 'id' | 'completed'>) => void;
  updateMilestone: (projectId: string, milestoneId: string, updates: Partial<Milestone>) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;
  
  addResource: (projectId: string, resource: Omit<ResourceRequirement, 'id' | 'secured'>) => void;
  
  addPoqEntry: (projectId: string, entry: Omit<PoqEntry, 'id'>) => void;
  
  abandonProject: (projectId: string, reason: string, restartPotential: 'low' | 'medium' | 'high') => void;
  
  addTag: (name: string, color?: string) => void;
  getOrCreateTag: (name: string) => string;
  
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  getActiveFermentReminders: () => (FermentReminder & { idea: Idea })[];
}

const createInitialIdea = (): Idea[] => [
  {
    id: 'idea-1',
    title: '基于AI的学习助手',
    description: '一个能够根据用户学习习惯和进度自适应调整教学内容的AI助手应用',
    source: 'reading',
    emotion: 'excited',
    tags: ['AI', '教育', '应用'],
    media: [],
    status: 'incubating',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    incubationEntries: [
      {
        id: 'inc-1',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        content: '可以考虑使用大语言模型API作为后端，前端使用React Native实现跨平台',
        mood: '乐观'
      },
      {
        id: 'inc-2',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        content: '需要考虑数据隐私问题，用户学习数据应该本地存储为主',
        mood: '谨慎'
      }
    ],
    feasibility: {
      market: 8,
      technical: 6,
      timeline: 5,
      notes: '市场需求大，但技术实现有一定门槛，需要3-6个月开发',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    fermentReminders: []
  },
  {
    id: 'idea-2',
    title: '城市微农业社区平台',
    description: '连接城市中的闲置空间与想要种植的人群，打造城市微农业社区',
    source: 'walk',
    emotion: 'curious',
    tags: ['社区', '环保', '平台'],
    media: [],
    status: 'captured',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    incubationEntries: [],
    fermentReminders: [
      {
        id: 'ferment-1',
        ideaId: 'idea-2',
        remindAfterDays: 7,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      }
    ]
  },
  {
    id: 'idea-3',
    title: '极简时间追踪器',
    description: '一个无干扰的时间追踪应用，帮助用户了解自己的时间都花在哪里',
    source: 'shower',
    emotion: 'inspired',
    tags: ['效率', '工具', '极简'],
    media: [],
    status: 'project',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    incubationEntries: [],
    fermentReminders: [],
    projectId: 'project-1'
  },
  {
    id: 'idea-4',
    title: '声音记忆胶囊',
    description: '记录生活中的声音片段，结合地理位置和时间，创造可回放的声音记忆',
    source: 'dream',
    emotion: 'unsure',
    tags: ['声音', '记忆', '移动应用'],
    media: [],
    status: 'captured',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    incubationEntries: [],
    fermentReminders: []
  },
  {
    id: 'idea-5',
    title: '代码可视化教学工具',
    description: '通过动画和交互式方式展示代码执行过程，帮助初学者理解编程概念',
    source: 'conversation',
    emotion: 'excited',
    tags: ['教育', '编程', '可视化'],
    media: [],
    status: 'evaluating',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    incubationEntries: [
      {
        id: 'inc-3',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        content: '可以先从简单的循环和条件判断开始做可视化演示',
        mood: '兴奋'
      }
    ],
    feasibility: {
      market: 7,
      technical: 8,
      timeline: 6,
      notes: '技术上可行，但需要大量教育内容的设计',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    fermentReminders: []
  },
  {
    id: 'idea-6',
    title: '情绪饮食日记',
    description: '记录饮食和情绪的关联，帮助用户发现饮食习惯对心情的影响',
    source: 'observation',
    emotion: 'needs_verification',
    tags: ['健康', '数据', '自我追踪'],
    media: [],
    status: 'captured',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    incubationEntries: [],
    fermentReminders: []
  }
];

const createInitialProjects = (): Project[] => [
  {
    id: 'project-1',
    ideaId: 'idea-3',
    title: 'TimeFlow - 极简时间追踪',
    description: '一个优雅、无干扰的时间追踪应用，帮助你专注于真正重要的事情',
    goal: '打造一款让用户乐于使用的时间追踪工具，帮助1000+用户提升效率',
    status: 'in_progress',
    tags: ['效率', '工具', '极简'],
    coverImage: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800',
    milestones: [
      { id: 'milestone-1', title: '完成UI设计', deadline: '2024-02-15', completed: true, completedAt: '2024-02-10T00:00:00Z' },
      { id: 'milestone-2', title: '核心功能开发', deadline: '2024-03-01', completed: true, completedAt: '2024-02-28T00:00:00Z' },
      { id: 'milestone-3', title: '数据可视化模块', deadline: '2024-03-15', completed: false },
      { id: 'milestone-4', title: 'Beta测试与反馈', deadline: '2024-04-01', completed: false }
    ],
    resources: [
      { id: 'resource-1', name: '设计时间', type: 'time', quantity: '40小时', secured: true },
      { id: 'resource-2', name: '开发时间', type: 'time', quantity: '120小时', secured: true },
      { id: 'resource-3', name: '服务器费用', type: 'money', quantity: '¥500/月', secured: false }
    ],
    poqEntries: [
      {
        id: 'poq-1',
        date: '2024-02-20T00:00:00Z',
        hypothesis: '用户需要极简的一键开始/停止计时功能',
        method: '制作原型邀请10位用户测试，观察使用行为',
        result: '8/10用户偏好一键操作，不需要过多设置选项',
        learned: '核心功能要足够简单，高级功能可隐藏',
        success: true
      }
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'project-2',
    title: '个人作品集网站',
    description: '展示个人创意项目和技术能力的个人网站',
    goal: '在两周内完成一个专业的个人作品集网站',
    status: 'completed',
    tags: ['网站', '作品集', '前端'],
    coverImage: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800',
    milestones: [
      { id: 'milestone-5', title: '设计网站结构', completed: true, completedAt: '2024-01-10T00:00:00Z' },
      { id: 'milestone-6', title: '开发前端页面', completed: true, completedAt: '2024-01-20T00:00:00Z' },
      { id: 'milestone-7', title: '部署上线', completed: true, completedAt: '2024-01-25T00:00:00Z' }
    ],
    resources: [
      { id: 'resource-4', name: '域名', type: 'money', quantity: '¥100/年', secured: true },
      { id: 'resource-5', name: '服务器', type: 'money', quantity: '¥300/年', secured: true }
    ],
    poqEntries: [],
    portfolioUrl: 'https://example.com',
    completionDate: '2024-01-25T00:00:00Z',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'project-3',
    title: 'AR室内设计应用',
    description: '使用增强现实技术帮助用户在真实环境中预览家具摆放效果',
    goal: '开发一款AR室内设计应用的MVP版本',
    status: 'abandoned',
    tags: ['AR', '设计', '移动应用'],
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    milestones: [
      { id: 'milestone-8', title: '技术调研', completed: true, completedAt: '2023-12-01T00:00:00Z' }
    ],
    resources: [
      { id: 'resource-6', name: 'AR开发技能', type: 'skill', quantity: 'Unity/ARKit', secured: false }
    ],
    poqEntries: [],
    abandonReason: 'AR技术门槛较高，个人开发难以达到理想效果，且市场已有成熟竞品',
    abandonDate: '2023-12-15T00:00:00Z',
    restartPotential: 'medium',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const createInitialTags = (): Tag[] => [
  { id: 'tag-1', name: 'AI', color: 'purple', usageCount: 1 },
  { id: 'tag-2', name: '教育', color: 'blue', usageCount: 2 },
  { id: 'tag-3', name: '应用', color: 'green', usageCount: 1 },
  { id: 'tag-4', name: '社区', color: 'orange', usageCount: 1 },
  { id: 'tag-5', name: '环保', color: 'green', usageCount: 1 },
  { id: 'tag-6', name: '平台', color: 'purple', usageCount: 1 },
  { id: 'tag-7', name: '效率', color: 'yellow', usageCount: 2 },
  { id: 'tag-8', name: '工具', color: 'blue', usageCount: 2 },
  { id: 'tag-9', name: '极简', color: 'gray', usageCount: 2 },
  { id: 'tag-10', name: '声音', color: 'pink', usageCount: 1 },
  { id: 'tag-11', name: '记忆', color: 'purple', usageCount: 1 },
  { id: 'tag-12', name: '移动应用', color: 'blue', usageCount: 1 },
  { id: 'tag-13', name: '编程', color: 'green', usageCount: 1 },
  { id: 'tag-14', name: '可视化', color: 'orange', usageCount: 1 },
  { id: 'tag-15', name: '健康', color: 'green', usageCount: 1 },
  { id: 'tag-16', name: '数据', color: 'blue', usageCount: 1 },
  { id: 'tag-17', name: '自我追踪', color: 'purple', usageCount: 1 },
  { id: 'tag-18', name: '网站', color: 'blue', usageCount: 1 },
  { id: 'tag-19', name: '作品集', color: 'purple', usageCount: 1 },
  { id: 'tag-20', name: '前端', color: 'yellow', usageCount: 1 },
  { id: 'tag-21', name: 'AR', color: 'pink', usageCount: 1 },
  { id: 'tag-22', name: '设计', color: 'orange', usageCount: 1 },
];

const TAG_COLORS = ['purple', 'blue', 'green', 'yellow', 'orange', 'pink', 'red', 'teal'];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ideas: createInitialIdea(),
      projects: createInitialProjects(),
      tags: createInitialTags(),
      settings: {
        fermentDefaultDays: 7,
        weeklyReviewDay: 0,
        theme: 'light'
      },

      addIdea: (ideaData) => set((state) => {
        const newIdea: Idea = {
          ...ideaData,
          id: `idea-${generateId()}`,
          media: ideaData.media || [],
          status: 'captured',
          incubationEntries: [],
          fermentReminders: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        ideaData.tags.forEach(tagName => get().getOrCreateTag(tagName));
        return { ideas: [newIdea, ...state.ideas] };
      }),

      updateIdea: (id, updates) => set((state) => ({
        ideas: state.ideas.map(idea =>
          idea.id === id ? { ...idea, ...updates, updatedAt: new Date().toISOString() } : idea
        )
      })),

      deleteIdea: (id) => set((state) => ({
        ideas: state.ideas.filter(idea => idea.id !== id)
      })),

      getIdea: (id) => get().ideas.find(idea => idea.id === id),

      addIncubationEntry: (ideaId, entry) => set((state) => ({
        ideas: state.ideas.map(idea =>
          idea.id === ideaId
            ? {
                ...idea,
                incubationEntries: [
                  ...idea.incubationEntries,
                  { ...entry, id: `inc-${generateId()}`, date: new Date().toISOString() }
                ],
                updatedAt: new Date().toISOString()
              }
            : idea
        )
      })),

      updateFeasibility: (ideaId, assessment) => set((state) => ({
        ideas: state.ideas.map(idea =>
          idea.id === ideaId
            ? {
                ...idea,
                feasibility: { ...assessment, date: new Date().toISOString() },
                status: 'evaluating',
                updatedAt: new Date().toISOString()
              }
            : idea
        )
      })),

      addFermentReminder: (ideaId, days) => set((state) => ({
        ideas: state.ideas.map(idea =>
          idea.id === ideaId
            ? {
                ...idea,
                fermentReminders: [
                  ...idea.fermentReminders,
                  {
                    id: `ferment-${generateId()}`,
                    ideaId,
                    remindAfterDays: days,
                    createdAt: new Date().toISOString(),
                    isActive: true
                  }
                ],
                updatedAt: new Date().toISOString()
              }
            : idea
        )
      })),

      convertToProject: (ideaId, projectData) => {
        const idea = get().getIdea(ideaId);
        if (!idea) return;

        const newProject: Project = {
          id: `project-${generateId()}`,
          ideaId,
          ...projectData,
          status: 'concept',
          milestones: (projectData.milestones || []).map(m => ({
            ...m,
            id: `milestone-${generateId()}`,
            completed: false
          })),
          resources: (projectData.resources || []).map(r => ({
            ...r,
            id: `resource-${generateId()}`,
            secured: false
          })),
          poqEntries: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          projects: [newProject, ...state.projects],
          ideas: state.ideas.map(i =>
            i.id === ideaId
              ? { ...i, status: 'project' as IdeaStatus, projectId: newProject.id, updatedAt: new Date().toISOString() }
              : i
          )
        }));
      },

      addProject: (projectData) => set((state) => {
        const newProject: Project = {
          ...projectData,
          id: `project-${generateId()}`,
          milestones: (projectData.milestones || []).map(m => ({
            ...m,
            id: `milestone-${generateId()}`
          })),
          resources: (projectData.resources || []).map(r => ({
            ...r,
            id: `resource-${generateId()}`
          })),
          poqEntries: (projectData.poqEntries || []).map(p => ({
            ...p,
            id: `poq-${generateId()}`
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { projects: [newProject, ...state.projects] };
      }),

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === id ? { ...project, ...updates, updatedAt: new Date().toISOString() } : project
        )
      })),

      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(project => project.id !== id)
      })),

      getProject: (id) => get().projects.find(project => project.id === id),

      addMilestone: (projectId, milestone) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                milestones: [
                  ...project.milestones,
                  { ...milestone, id: `milestone-${generateId()}`, completed: false }
                ],
                updatedAt: new Date().toISOString()
              }
            : project
        )
      })),

      updateMilestone: (projectId, milestoneId, updates) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                milestones: project.milestones.map(m =>
                  m.id === milestoneId ? { ...m, ...updates } : m
                ),
                updatedAt: new Date().toISOString()
              }
            : project
        )
      })),

      toggleMilestone: (projectId, milestoneId) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                milestones: project.milestones.map(m =>
                  m.id === milestoneId
                    ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined }
                    : m
                ),
                updatedAt: new Date().toISOString()
              }
            : project
        )
      })),

      addResource: (projectId, resource) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                resources: [
                  ...project.resources,
                  { ...resource, id: `resource-${generateId()}`, secured: false }
                ],
                updatedAt: new Date().toISOString()
              }
            : project
        )
      })),

      addPoqEntry: (projectId, entry) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                poqEntries: [
                  ...project.poqEntries,
                  { ...entry, id: `poq-${generateId()}` }
                ],
                updatedAt: new Date().toISOString()
              }
            : project
        )
      })),

      abandonProject: (projectId, reason, restartPotential) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                status: 'abandoned' as ProjectStatus,
                abandonReason: reason,
                abandonDate: new Date().toISOString(),
                restartPotential,
                updatedAt: new Date().toISOString()
              }
            : project
        )
      })),

      addTag: (name, color) => set((state) => {
        const existing = state.tags.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (existing) return state;
        const newTag: Tag = {
          id: `tag-${generateId()}`,
          name,
          color: color || TAG_COLORS[state.tags.length % TAG_COLORS.length],
          usageCount: 0
        };
        return { tags: [...state.tags, newTag] };
      }),

      getOrCreateTag: (name) => {
        const state = get();
        const existing = state.tags.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          set({
            tags: state.tags.map(t =>
              t.id === existing.id ? { ...t, usageCount: t.usageCount + 1 } : t
            )
          });
          return existing.id;
        }
        const newTag: Tag = {
          id: `tag-${generateId()}`,
          name,
          color: TAG_COLORS[state.tags.length % TAG_COLORS.length],
          usageCount: 1
        };
        set({ tags: [...state.tags, newTag] });
        return newTag.id;
      },

      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),

      getActiveFermentReminders: () => {
        const state = get();
        const now = new Date();
        const reminders: (FermentReminder & { idea: Idea })[] = [];
        
        state.ideas.forEach(idea => {
          idea.fermentReminders.forEach(reminder => {
            if (!reminder.isActive) return;
            const remindDate = new Date(reminder.createdAt);
            remindDate.setDate(remindDate.getDate() + reminder.remindAfterDays);
            if (remindDate <= now) {
              reminders.push({ ...reminder, idea });
            }
          });
        });
        
        return reminders;
      }
    }),
    {
      name: 'idea-forge-storage'
    }
  )
);
