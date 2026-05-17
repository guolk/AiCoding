<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Leaf, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Tag,
  Camera,
  Plus,
  Droplets,
  TrendingUp,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  ClipboardList
} from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'
import { TASK_TYPE_LABELS, TASK_TYPE_COLORS } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const store = useGardenStore()

const plantId = computed(() => route.params.id as string)
const plant = computed(() => store.getPlantById(plantId.value))
const tasks = computed(() => store.getTasksByPlantId(plantId.value))
const records = computed(() => store.getRecordsByPlantId(plantId.value))
const healthObservations = computed(() => store.getHealthObservationsByPlantId(plantId.value))

const activeTab = ref<'info' | 'photos' | 'tasks' | 'records' | 'health'>('info')
const showPhotoModal = ref(false)
const selectedPhoto = ref<string | null>(null)
const showAddPhoto = ref(false)
const newPhotoUrl = ref('')
const newPhotoNotes = ref('')
const isHealthyPhoto = ref(true)

const showAddHealth = ref(false)
const healthForm = ref({
  date: dayjs().format('YYYY-MM-DD'),
  leafColor: '正常绿色',
  soilCondition: '湿润适中',
  hasPests: false,
  pestDetails: '',
  notes: ''
})

const getDaysOwned = (date: string) => {
  return dayjs().diff(dayjs(date), 'day')
}

const openPhotoViewer = (url: string) => {
  selectedPhoto.value = url
  showPhotoModal.value = true
}

const addPhoto = () => {
  if (newPhotoUrl.value) {
    store.addPlantPhoto(plantId.value, {
      url: newPhotoUrl.value,
      date: dayjs().format('YYYY-MM-DD'),
      notes: newPhotoNotes.value,
      isHealthy: isHealthyPhoto.value
    })
    newPhotoUrl.value = ''
    newPhotoNotes.value = ''
    showAddPhoto.value = false
  }
}

const addHealthObservation = () => {
  store.addHealthObservation({
    plantId: plantId.value,
    date: healthForm.value.date,
    leafColor: healthForm.value.leafColor,
    soilCondition: healthForm.value.soilCondition,
    hasPests: healthForm.value.hasPests,
    pestDetails: healthForm.value.pestDetails || undefined,
    notes: healthForm.value.notes || undefined
  })
  showAddHealth.value = false
  healthForm.value = {
    date: dayjs().format('YYYY-MM-DD'),
    leafColor: '正常绿色',
    soilCondition: '湿润适中',
    hasPests: false,
    pestDetails: '',
    notes: ''
  }
}

const sortedPhotos = computed(() => {
  return [...(plant.value?.photos || [])].sort((a, b) => 
    dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
  )
})

const healthyPhotos = computed(() => sortedPhotos.value.filter(p => p.isHealthy !== false))
const unhealthyPhotos = computed(() => sortedPhotos.value.filter(p => p.isHealthy === false))

onMounted(() => {
  if (!plant.value) {
    router.push('/plants')
  }
})
</script>

<template>
  <div v-if="plant" class="space-y-6">
    <!-- 返回按钮 -->
    <button 
      class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
      @click="router.back()"
    >
      <ArrowLeft class="w-5 h-5" />
      <span>返回</span>
    </button>

    <!-- 植物头部信息 -->
    <div class="bg-white rounded-xl overflow-hidden shadow-sm">
      <div class="md:flex">
        <div class="md:w-1/3 aspect-square md:aspect-auto bg-gray-100">
          <img 
            v-if="plant.photos.length > 0"
            :src="plant.photos[0].url" 
            :alt="plant.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Leaf class="w-24 h-24 text-gray-300" />
          </div>
        </div>
        <div class="md:w-2/3 p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 mb-1">{{ plant.name }}</h1>
              <p v-if="plant.scientificName" class="text-gray-500 italic">{{ plant.scientificName }}</p>
            </div>
            <span class="px-3 py-1 bg-garden-100 text-garden-700 rounded-full text-sm font-medium">
              已养护 {{ getDaysOwned(plant.purchaseDate) }} 天
            </span>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div v-if="plant.family" class="flex items-center space-x-2">
              <Leaf class="w-5 h-5 text-gray-400" />
              <div>
                <p class="text-xs text-gray-500">科属</p>
                <p class="text-sm font-medium">{{ plant.family }} {{ plant.genus }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <MapPin class="w-5 h-5 text-gray-400" />
              <div>
                <p class="text-xs text-gray-500">位置</p>
                <p class="text-sm font-medium">{{ plant.location }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Calendar class="w-5 h-5 text-gray-400" />
              <div>
                <p class="text-xs text-gray-500">购入日期</p>
                <p class="text-sm font-medium">{{ plant.purchaseDate }}</p>
              </div>
            </div>
            <div v-if="plant.purchasePrice" class="flex items-center space-x-2">
              <Tag class="w-5 h-5 text-gray-400" />
              <div>
                <p class="text-xs text-gray-500">购入价格</p>
                <p class="text-sm font-medium">¥{{ plant.purchasePrice }}</p>
              </div>
            </div>
            <div v-if="plant.potInfo" class="col-span-2 flex items-center space-x-2">
              <ImageIcon class="w-5 h-5 text-gray-400" />
              <div>
                <p class="text-xs text-gray-500">盆器信息</p>
                <p class="text-sm font-medium">{{ plant.potInfo }}</p>
              </div>
            </div>
          </div>
          
          <div v-if="plant.notes" class="p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600">{{ plant.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
        <button 
          v-for="tab in [
            { key: 'info', label: '基本信息' },
            { key: 'photos', label: '成长相册' },
            { key: 'tasks', label: '养护任务' },
            { key: 'records', label: '养护记录' },
            { key: 'health', label: '健康观察' }
          ]"
          :key="tab.key"
          class="px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors"
          :class="activeTab === tab.key ? 'text-garden-600 border-b-2 border-garden-500' : 'text-gray-500 hover:text-gray-700'"
          @click="activeTab = tab.key as any"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="p-6">
        <!-- 成长相册 -->
        <div v-if="activeTab === 'photos'" class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">成长相册</h3>
            <button 
              class="flex items-center space-x-2 px-4 py-2 bg-garden-500 text-white rounded-lg hover:bg-garden-600 transition-colors text-sm"
              @click="showAddPhoto = true"
            >
              <Plus class="w-4 h-4" />
              <span>添加照片</span>
            </button>
          </div>
          
          <div v-if="unhealthyPhotos.length > 0" class="mb-8">
            <h4 class="text-sm font-medium text-gray-500 mb-3 flex items-center">
              <AlertCircle class="w-4 h-4 mr-2 text-red-500" />
              问题记录 ({{ unhealthyPhotos.length }})
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div 
                v-for="photo in unhealthyPhotos" 
                :key="photo.id"
                class="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-red-200"
                @click="openPhotoViewer(photo.url)"
              >
                <img :src="photo.url" :alt="photo.notes" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                  <div class="p-2 text-white text-xs w-full bg-gradient-to-t from-black/60 to-transparent">
                    <p>{{ photo.date }}</p>
                    <p v-if="photo.notes" class="truncate">{{ photo.notes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 class="text-sm font-medium text-gray-500 mb-3 flex items-center">
              <CheckCircle class="w-4 h-4 mr-2 text-green-500" />
              健康成长记录 ({{ healthyPhotos.length }})
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div 
                v-for="photo in healthyPhotos" 
                :key="photo.id"
                class="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                @click="openPhotoViewer(photo.url)"
              >
                <img :src="photo.url" :alt="photo.notes" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                  <div class="p-2 text-white text-xs w-full bg-gradient-to-t from-black/60 to-transparent">
                    <p>{{ photo.date }}</p>
                    <p v-if="photo.notes" class="truncate">{{ photo.notes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="sortedPhotos.length === 0" class="text-center py-8">
            <Camera class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500">还没有照片，记录植物的成长历程吧</p>
          </div>
        </div>

        <!-- 养护任务 -->
        <div v-if="activeTab === 'tasks'" class="space-y-4">
          <div v-if="tasks.length > 0" class="space-y-3">
            <div 
              v-for="task in tasks" 
              :key="task.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div :class="[TASK_TYPE_COLORS[task.type], 'w-10 h-10 rounded-lg flex items-center justify-center text-white']">
                  <Droplets v-if="task.type === 'water'" class="w-5 h-5" />
                  <TrendingUp v-else class="w-5 h-5" />
                </div>
                <div>
                  <p class="font-medium text-gray-800">{{ TASK_TYPE_LABELS[task.type] }}</p>
                  <p class="text-sm text-gray-500">每 {{ task.frequencyDays }} 天一次</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">下次：{{ task.nextDueDate }}</p>
                <p v-if="task.lastDoneDate" class="text-xs text-gray-400">上次：{{ task.lastDoneDate }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <Calendar class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500">还没有设置养护任务</p>
          </div>
        </div>

        <!-- 养护记录 -->
        <div v-if="activeTab === 'records'" class="space-y-4">
          <div v-if="records.length > 0" class="space-y-3">
            <div 
              v-for="record in records" 
              :key="record.id"
              class="p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span :class="[TASK_TYPE_COLORS[record.type], 'px-2 py-0.5 rounded text-xs text-white']">
                    {{ TASK_TYPE_LABELS[record.type] }}
                  </span>
                  <span class="text-sm text-gray-500">{{ record.date }}</span>
                </div>
              </div>
              <div v-if="record.amount" class="text-sm text-gray-600 mb-1">用量：{{ record.amount }}</div>
              <div v-if="record.result" class="text-sm text-gray-600 mb-1">结果：{{ record.result }}</div>
              <div v-if="record.notes" class="text-sm text-gray-500">{{ record.notes }}</div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <ClipboardList class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500">还没有养护记录</p>
          </div>
        </div>

        <!-- 健康观察 -->
        <div v-if="activeTab === 'health'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">健康观察记录</h3>
            <button 
              class="flex items-center space-x-2 px-4 py-2 bg-garden-500 text-white rounded-lg hover:bg-garden-600 transition-colors text-sm"
              @click="showAddHealth = true"
            >
              <Plus class="w-4 h-4" />
              <span>添加记录</span>
            </button>
          </div>
          
          <div v-if="healthObservations.length > 0" class="space-y-3">
            <div 
              v-for="obs in healthObservations" 
              :key="obs.id"
              class="p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-800">{{ obs.date }}</span>
                <span v-if="obs.hasPests" class="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">有病虫害</span>
                <span v-else class="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">健康</span>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-gray-500">叶片颜色：</span>
                  <span class="text-gray-800">{{ obs.leafColor }}</span>
                </div>
                <div>
                  <span class="text-gray-500">土壤状况：</span>
                  <span class="text-gray-800">{{ obs.soilCondition }}</span>
                </div>
              </div>
              <div v-if="obs.pestDetails" class="mt-2 text-sm text-red-600">
                病虫害：{{ obs.pestDetails }}
              </div>
              <div v-if="obs.notes" class="mt-2 text-sm text-gray-600">{{ obs.notes }}</div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <CheckCircle class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500">还没有健康观察记录</p>
          </div>
        </div>

        <!-- 基本信息 -->
        <div v-if="activeTab === 'info'" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="font-medium text-gray-800 mb-3">植物信息</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">植物名称</span>
                  <span class="text-gray-800">{{ plant.name }}</span>
                </div>
                <div v-if="plant.scientificName" class="flex justify-between">
                  <span class="text-gray-500">学名</span>
                  <span class="text-gray-800 italic">{{ plant.scientificName }}</span>
                </div>
                <div v-if="plant.family" class="flex justify-between">
                  <span class="text-gray-500">科</span>
                  <span class="text-gray-800">{{ plant.family }}</span>
                </div>
                <div v-if="plant.genus" class="flex justify-between">
                  <span class="text-gray-500">属</span>
                  <span class="text-gray-800">{{ plant.genus }}</span>
                </div>
              </div>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="font-medium text-gray-800 mb-3">养护信息</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">摆放位置</span>
                  <span class="text-gray-800">{{ plant.location }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">购入日期</span>
                  <span class="text-gray-800">{{ plant.purchaseDate }}</span>
                </div>
                <div v-if="plant.purchasePrice" class="flex justify-between">
                  <span class="text-gray-500">购入价格</span>
                  <span class="text-gray-800">¥{{ plant.purchasePrice }}</span>
                </div>
                <div v-if="plant.potInfo" class="flex justify-between">
                  <span class="text-gray-500">盆器信息</span>
                  <span class="text-gray-800">{{ plant.potInfo }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="plant.notes" class="p-4 bg-gray-50 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">备注</h4>
            <p class="text-sm text-gray-600">{{ plant.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 照片查看器 -->
    <div 
      v-if="showPhotoModal" 
      class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      @click.self="showPhotoModal = false"
    >
      <button 
        class="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
        @click="showPhotoModal = false"
      >
        <X class="w-6 h-6" />
      </button>
      <img 
        v-if="selectedPhoto"
        :src="selectedPhoto" 
        alt="预览"
        class="max-w-full max-h-full object-contain"
      />
    </div>

    <!-- 添加照片弹窗 -->
    <div 
      v-if="showAddPhoto" 
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      @click.self="showAddPhoto = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">添加照片</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">照片链接</label>
            <input 
              v-model="newPhotoUrl"
              type="text" 
              placeholder="输入图片URL"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea 
              v-model="newPhotoNotes"
              placeholder="记录这一刻..."
              rows="2"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500"
            />
          </div>
          <div class="flex items-center space-x-2">
            <input 
              id="isHealthy" 
              v-model="isHealthyPhoto" 
              type="checkbox" 
              class="w-4 h-4 text-garden-500 rounded"
            />
            <label for="isHealthy" class="text-sm text-gray-700">这是健康状态的照片</label>
          </div>
          <div class="flex space-x-3">
            <button 
              class="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              @click="showAddPhoto = false"
            >
              取消
            </button>
            <button 
              class="flex-1 px-4 py-2 bg-garden-500 text-white rounded-lg hover:bg-garden-600 transition-colors"
              @click="addPhoto"
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加健康观察弹窗 -->
    <div 
      v-if="showAddHealth" 
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      @click.self="showAddHealth = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">添加健康观察记录</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">观察日期</label>
            <input 
              v-model="healthForm.date"
              type="date" 
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">叶片颜色</label>
            <select 
              v-model="healthForm.leafColor"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500"
            >
              <option value="正常绿色">正常绿色</option>
              <option value="嫩绿">嫩绿</option>
              <option value="深绿">深绿</option>
              <option value="发黄">发黄</option>
              <option value="发枯">发枯</option>
              <option value="有斑点">有斑点</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">土壤状况</label>
            <select 
              v-model="healthForm.soilCondition"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500"
            >
              <option value="湿润适中">湿润适中</option>
              <option value="干燥">干燥</option>
              <option value="过湿">过湿</option>
              <option value="板结">板结</option>
              <option value="疏松">疏松</option>
            </select>
          </div>
          <div class="flex items-center space-x-2">
            <input 
              id="hasPests" 
              v-model="healthForm.hasPests" 
              type="checkbox" 
              class="w-4 h-4 text-garden-500 rounded"
            />
            <label for="hasPests" class="text-sm text-gray-700">发现病虫害</label>
          </div>
          <div v-if="healthForm.hasPests">
            <label class="block text-sm font-medium text-gray-700 mb-1">病虫害详情</label>
            <input 
              v-model="healthForm.pestDetails"
              type="text" 
              placeholder="如：蚜虫、红蜘蛛等"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea 
              v-model="healthForm.notes"
              placeholder="记录其他观察..."
              rows="2"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500"
            />
          </div>
          <div class="flex space-x-3">
            <button 
              class="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              @click="showAddHealth = false"
            >
              取消
            </button>
            <button 
              class="flex-1 px-4 py-2 bg-garden-500 text-white rounded-lg hover:bg-garden-600 transition-colors"
              @click="addHealthObservation"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
