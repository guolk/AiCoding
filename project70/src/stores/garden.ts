import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Plant,
  CareTask,
  CareRecord,
  HealthObservation,
  EnvironmentRecord,
  KnowledgeEntry,
  GardenCalendarEntry,
  Post,
  PlantIdentification,
  TaskType
} from '@/types'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const generateId = () => Math.random().toString(36).substring(2, 11)

const SAMPLE_PLANT_IMAGE = 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop'
const SAMPLE_PLANT_IMAGE2 = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop'
const SAMPLE_PLANT_IMAGE3 = 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=400&h=400&fit=crop'

export const useGardenStore = defineStore('garden', () => {
  const plants = ref<Plant[]>([
    {
      id: '1',
      name: '绿萝',
      scientificName: 'Epipremnum aureum',
      family: '天南星科',
      genus: '麒麟叶属',
      purchaseDate: '2024-03-15',
      purchasePrice: 25,
      potInfo: '白色陶瓷盆 直径15cm',
      location: '客厅窗边',
      notes: '喜欢散射光，耐阴',
      photos: [
        { id: 'p1', url: SAMPLE_PLANT_IMAGE, date: '2024-03-15', notes: '刚买回来时', isHealthy: true },
        { id: 'p2', url: SAMPLE_PLANT_IMAGE2, date: '2024-04-15', notes: '一个月后', isHealthy: true }
      ],
      createdAt: '2024-03-15',
      updatedAt: '2024-04-15'
    },
    {
      id: '2',
      name: '多肉组合',
      scientificName: 'Succulent',
      family: '景天科',
      genus: '多种属',
      purchaseDate: '2024-02-20',
      purchasePrice: 68,
      potInfo: '方形水泥盆 20x20cm',
      location: '阳台',
      notes: '需要充足阳光，少浇水',
      photos: [
        { id: 'p3', url: SAMPLE_PLANT_IMAGE3, date: '2024-02-20', notes: '刚种上', isHealthy: true }
      ],
      createdAt: '2024-02-20',
      updatedAt: '2024-02-20'
    }
  ])

  const careTasks = ref<CareTask[]>([
    {
      id: 't1',
      plantId: '1',
      type: 'water',
      frequencyDays: 7,
      lastDoneDate: '2024-05-10',
      nextDueDate: '2024-05-17',
      notes: '浇透直到底部漏水',
      enabled: true
    },
    {
      id: 't2',
      plantId: '1',
      type: 'fertilize',
      frequencyDays: 30,
      lastDoneDate: '2024-04-20',
      nextDueDate: '2024-05-20',
      notes: '使用稀释的液体肥',
      enabled: true
    },
    {
      id: 't3',
      plantId: '2',
      type: 'water',
      frequencyDays: 14,
      lastDoneDate: '2024-05-05',
      nextDueDate: '2024-05-19',
      notes: '少量浇水，避免烂根',
      enabled: true
    }
  ])

  const careRecords = ref<CareRecord[]>([
    {
      id: 'r1',
      plantId: '1',
      type: 'water',
      date: '2024-05-10',
      amount: '500ml',
      result: '生长良好',
      notes: '土壤干透后浇水'
    },
    {
      id: 'r2',
      plantId: '1',
      type: 'fertilize',
      date: '2024-04-20',
      amount: '稀释1000倍',
      result: '叶片更绿了',
      notes: '使用通用营养液'
    }
  ])

  const healthObservations = ref<HealthObservation[]>([
    {
      id: 'h1',
      plantId: '1',
      date: '2024-05-01',
      leafColor: '翠绿',
      soilCondition: '微湿',
      hasPests: false,
      notes: '生长旺盛，有新叶长出'
    }
  ])

  const environmentRecords = ref<EnvironmentRecord[]>([
    {
      id: 'e1',
      location: '客厅窗边',
      date: '2024-05-15',
      lightLevel: 70,
      humidity: 55,
      temperature: 24,
      notes: '下午有阳光直射'
    },
    {
      id: 'e2',
      location: '阳台',
      date: '2024-05-15',
      lightLevel: 90,
      humidity: 45,
      temperature: 28,
      notes: '全天阳光充足'
    }
  ])

  const knowledgeBase = ref<KnowledgeEntry[]>([
    {
      id: 'k1',
      name: '绿萝',
      scientificName: 'Epipremnum aureum',
      category: '观叶植物',
      wateringFrequency: '7-10天一次，土壤干透后浇透',
      lightRequirement: '散射光，耐阴，避免阳光直射',
      fertilizerRequirement: '生长季每月施一次稀释液肥',
      pestControl: '注意防治红蜘蛛，保持通风',
      description: '绿萝是非常常见的室内观叶植物，具有很强的空气净化能力，能吸收甲醛等有害气体。',
      imageUrl: SAMPLE_PLANT_IMAGE
    },
    {
      id: 'k2',
      name: '多肉植物',
      scientificName: 'Succulent',
      category: '多肉植物',
      wateringFrequency: '10-15天一次，宁干勿湿',
      lightRequirement: '充足阳光，每天至少4小时直射光',
      fertilizerRequirement: '生长季每月施一次稀薄多肉专用肥',
      pestControl: '注意防治介壳虫和黑腐病',
      description: '多肉植物种类繁多，形态各异，非常适合懒人养护。',
      imageUrl: SAMPLE_PLANT_IMAGE3
    },
    {
      id: 'k3',
      name: '发财树',
      scientificName: 'Pachira aquatica',
      category: '观叶植物',
      wateringFrequency: '15-20天一次，怕积水',
      lightRequirement: '散射光，可耐阴',
      fertilizerRequirement: '春秋季每月施一次复合肥',
      pestControl: '注意防治叶斑病和介壳虫',
      description: '寓意招财进宝，是常见的办公室和家庭绿植。',
      imageUrl: SAMPLE_PLANT_IMAGE2
    }
  ])

  const gardenCalendar = ref<GardenCalendarEntry[]>([
    { id: 'gc1', month: 1, title: '冬季养护', description: '减少浇水，注意保温，避免冻伤', plantTypes: ['观叶植物', '多肉植物'] },
    { id: 'gc2', month: 2, title: '准备春播', description: '准备种子和育苗土，开始室内育苗', plantTypes: ['草本花卉', '蔬菜'] },
    { id: 'gc3', month: 3, title: '春季换盆', description: '适合换盆的最佳时期，检查根系', plantTypes: ['所有植物'] },
    { id: 'gc4', month: 4, title: '生长季开始', description: '增加浇水和施肥频率', plantTypes: ['所有植物'] },
    { id: 'gc5', month: 5, title: '病虫害预防', description: '温度升高，注意预防病虫害', plantTypes: ['所有植物'] },
    { id: 'gc6', month: 6, title: '夏季遮阳', description: '避免阳光直射，注意通风降温', plantTypes: ['观叶植物', '兰花'] },
    { id: 'gc7', month: 7, title: '防暑降温', description: '增加喷雾降温，避免正午浇水', plantTypes: ['所有植物'] },
    { id: 'gc8', month: 8, title: '继续防暑', description: '注意通风，防止闷热潮湿', plantTypes: ['所有植物'] },
    { id: 'gc9', month: 9, title: '秋季管理', description: '天气转凉，恢复正常养护', plantTypes: ['所有植物'] },
    { id: 'gc10', month: 10, title: '秋花盛开', description: '适合种植秋花和球根植物', plantTypes: ['球根花卉', '秋花植物'] },
    { id: 'gc11', month: 11, title: '入冬准备', description: '减少浇水，准备移入室内', plantTypes: ['不耐寒植物'] },
    { id: 'gc12', month: 12, title: '冬季休眠', description: '控制浇水，停止施肥', plantTypes: ['休眠植物'] }
  ])

  const posts = ref<Post[]>([
    {
      id: 'post1',
      type: 'experience',
      title: '我的绿萝爆盆秘诀',
      content: '养了两年的绿萝终于爆盆了！分享一下我的养护心得：1. 散射光养护，避免阳光直射；2. 每周浇水一次，浇透；3. 每月施一次稀释的营养液；4. 经常用湿布擦拭叶片。希望对大家有帮助！',
      author: '园艺爱好者',
      createdAt: '2024-05-10',
      plantType: '绿萝',
      photos: [SAMPLE_PLANT_IMAGE, SAMPLE_PLANT_IMAGE2],
      comments: [
        { id: 'c1', author: '新手小花', content: '太棒了！我的绿萝总是黄叶子', createdAt: '2024-05-11' },
        { id: 'c2', author: '多肉控', content: '学到了，回去试试', createdAt: '2024-05-12' }
      ],
      likes: 28
    },
    {
      id: 'post2',
      type: 'exchange',
      title: '【以盆换盆】求换玉露',
      content: '我有一盆状态很好的姬胧月，想换一盆玉露，有兴趣的朋友可以联系我。',
      author: '多肉达人',
      createdAt: '2024-05-08',
      plantType: '多肉',
      photos: [SAMPLE_PLANT_IMAGE3],
      comments: [
        { id: 'c3', author: '玉露爱好者', content: '我有玉露可以换！', createdAt: '2024-05-09' }
      ],
      likes: 5
    } as any
  ])

  const identifications = ref<PlantIdentification[]>([])

  const todayTasks = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return careTasks.value.filter(task => 
      task.enabled && dayjs(task.nextDueDate).isSameOrBefore(today)
    )
  })

  const getPlantById = (id: string) => plants.value.find(p => p.id === id)
  const getTasksByPlantId = (plantId: string) => careTasks.value.filter(t => t.plantId === plantId)
  const getRecordsByPlantId = (plantId: string) => careRecords.value.filter(r => r.plantId === plantId).sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
  const getHealthObservationsByPlantId = (plantId: string) => healthObservations.value.filter(h => h.plantId === plantId).sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())

  const addPlant = (plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt' | 'photos'>) => {
    const now = dayjs().format('YYYY-MM-DD')
    const newPlant: Plant = {
      ...plant,
      id: generateId(),
      photos: [],
      createdAt: now,
      updatedAt: now
    }
    plants.value.push(newPlant)
    return newPlant
  }

  const updatePlant = (id: string, updates: Partial<Plant>) => {
    const index = plants.value.findIndex(p => p.id === id)
    if (index !== -1) {
      plants.value[index] = {
        ...plants.value[index],
        ...updates,
        updatedAt: dayjs().format('YYYY-MM-DD')
      }
    }
  }

  const deletePlant = (id: string) => {
    plants.value = plants.value.filter(p => p.id !== id)
    careTasks.value = careTasks.value.filter(t => t.plantId !== id)
    careRecords.value = careRecords.value.filter(r => r.plantId !== id)
    healthObservations.value = healthObservations.value.filter(h => h.plantId !== id)
  }

  const addPlantPhoto = (plantId: string, photo: Omit<PlantPhoto, 'id'>) => {
    const plant = getPlantById(plantId)
    if (plant) {
      plant.photos.push({
        ...photo,
        id: generateId()
      })
      plant.updatedAt = dayjs().format('YYYY-MM-DD')
    }
  }

  const addCareTask = (task: Omit<CareTask, 'id'>) => {
    const newTask: CareTask = {
      ...task,
      id: generateId()
    }
    careTasks.value.push(newTask)
    return newTask
  }

  const updateCareTask = (id: string, updates: Partial<CareTask>) => {
    const index = careTasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      careTasks.value[index] = { ...careTasks.value[index], ...updates }
    }
  }

  const deleteCareTask = (id: string) => {
    careTasks.value = careTasks.value.filter(t => t.id !== id)
  }

  const completeTask = (taskId: string) => {
    const task = careTasks.value.find(t => t.id === taskId)
    if (task) {
      const today = dayjs()
      task.lastDoneDate = today.format('YYYY-MM-DD')
      task.nextDueDate = today.add(task.frequencyDays, 'day').format('YYYY-MM-DD')
    }
  }

  const addCareRecord = (record: Omit<CareRecord, 'id'>) => {
    const newRecord: CareRecord = {
      ...record,
      id: generateId()
    }
    careRecords.value.push(newRecord)
    return newRecord
  }

  const addHealthObservation = (observation: Omit<HealthObservation, 'id'>) => {
    const newObservation: HealthObservation = {
      ...observation,
      id: generateId()
    }
    healthObservations.value.push(newObservation)
    return newObservation
  }

  const addEnvironmentRecord = (record: Omit<EnvironmentRecord, 'id'>) => {
    const newRecord: EnvironmentRecord = {
      ...record,
      id: generateId()
    }
    environmentRecords.value.push(newRecord)
    return newRecord
  }

  const identifyPlant = (photoUrl: string): PlantIdentification => {
    const suggestions = [
      { name: '绿萝', scientificName: 'Epipremnum aureum', probability: 0.85, family: '天南星科', genus: '麒麟叶属' },
      { name: '龟背竹', scientificName: 'Monstera deliciosa', probability: 0.65, family: '天南星科', genus: '龟背竹属' },
      { name: '喜林芋', scientificName: 'Philodendron', probability: 0.45, family: '天南星科', genus: '喜林芋属' }
    ]
    
    const identification: PlantIdentification = {
      id: generateId(),
      photoUrl,
      suggestions,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    identifications.value.push(identification)
    return identification
  }

  const addPost = (post: Omit<Post, 'id' | 'createdAt' | 'comments' | 'likes'>) => {
    const newPost: Post = {
      ...post,
      id: generateId(),
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      comments: [],
      likes: 0
    }
    posts.value.unshift(newPost)
    return newPost
  }

  const addComment = (postId: string, content: string, author: string) => {
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.comments.push({
        id: generateId(),
        author,
        content,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      })
    }
  }

  const likePost = (postId: string) => {
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.likes++
    }
  }

  const deletePost = (postId: string) => {
    posts.value = posts.value.filter(p => p.id !== postId)
  }

  const getTasksForDate = (date: string) => {
    return careTasks.value.filter(task => 
      task.enabled && dayjs(task.nextDueDate).isSame(date, 'day')
    )
  }

  return {
    plants,
    careTasks,
    careRecords,
    healthObservations,
    environmentRecords,
    knowledgeBase,
    gardenCalendar,
    posts,
    identifications,
    todayTasks,
    getPlantById,
    getTasksByPlantId,
    getRecordsByPlantId,
    getHealthObservationsByPlantId,
    addPlant,
    updatePlant,
    deletePlant,
    addPlantPhoto,
    addCareTask,
    updateCareTask,
    deleteCareTask,
    completeTask,
    addCareRecord,
    addHealthObservation,
    addEnvironmentRecord,
    identifyPlant,
    addPost,
    addComment,
    likePost,
    deletePost,
    getTasksForDate
  }
})
