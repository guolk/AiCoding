<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Leaf, 
  Plus, 
  Search, 
  Filter,
  Camera,
  MapPin,
  Calendar,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'
import dayjs from 'dayjs'

const store = useGardenStore()
const router = useRouter()

const searchQuery = ref('')
const showMenu = ref<string | null>(null)

const filteredPlants = computed(() => {
  if (!searchQuery.value) return store.plants
  const query = searchQuery.value.toLowerCase()
  return store.plants.filter(p => 
    p.name.toLowerCase().includes(query) ||
    p.location.toLowerCase().includes(query) ||
    (p.family && p.family.toLowerCase().includes(query))
  )
})

const getDaysOwned = (date: string) => {
  return dayjs().diff(dayjs(date), 'day')
}

const deletePlant = (id: string) => {
  if (confirm('确定要删除这株植物吗？相关的养护任务和记录也会被删除。')) {
    store.deletePlant(id)
  }
  showMenu.value = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- 顶部操作栏 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="搜索植物名称、位置..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
        />
      </div>
      <div class="flex items-center space-x-3">
        <button class="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <Filter class="w-4 h-4" />
          <span>筛选</span>
        </button>
        <router-link 
          to="/plants/identify"
          class="flex items-center space-x-2 px-4 py-2.5 border border-garden-200 bg-garden-50 text-garden-600 rounded-xl hover:bg-garden-100 transition-colors"
        >
          <Camera class="w-4 h-4" />
          <span>识别植物</span>
        </router-link>
        <router-link 
          to="/plants/add"
          class="flex items-center space-x-2 px-4 py-2.5 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors"
        >
          <Plus class="w-4 h-4" />
          <span>添加植物</span>
        </router-link>
      </div>
    </div>

    <!-- 植物列表 -->
    <div v-if="filteredPlants.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="plant in filteredPlants" 
        :key="plant.id"
        class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
      >
        <div class="relative">
          <router-link :to="`/plants/${plant.id}`" class="block">
            <div class="aspect-[4/3] bg-gray-100 overflow-hidden">
              <img 
                v-if="plant.photos.length > 0"
                :src="plant.photos[0].url" 
                :alt="plant.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Leaf class="w-16 h-16 text-gray-300" />
              </div>
            </div>
          </router-link>
          <div class="absolute top-3 right-3">
            <div class="relative">
              <button 
                class="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                @click.stop="showMenu = showMenu === plant.id ? null : plant.id"
              >
                <MoreVertical class="w-4 h-4" />
              </button>
              <div 
                v-if="showMenu === plant.id"
                class="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10"
              >
                <button 
                  class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  @click.stop="router.push(`/plants/${plant.id}`)"
                >
                  <Edit class="w-4 h-4" />
                  <span>查看详情</span>
                </button>
                <button 
                  class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  @click.stop="deletePlant(plant.id)"
                >
                  <Trash2 class="w-4 h-4" />
                  <span>删除</span>
                </button>
              </div>
            </div>
          </div>
          <div class="absolute bottom-3 left-3">
            <span class="px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700">
              {{ plant.photos.length }} 张照片
            </span>
          </div>
        </div>
        
        <div class="p-4">
          <router-link :to="`/plants/${plant.id}`">
            <h3 class="font-semibold text-gray-800 mb-1 hover:text-garden-600 transition-colors">{{ plant.name }}</h3>
          </router-link>
          <p v-if="plant.scientificName" class="text-sm text-gray-400 italic mb-3">{{ plant.scientificName }}</p>
          
          <div class="space-y-2">
            <div class="flex items-center text-sm text-gray-500">
              <MapPin class="w-4 h-4 mr-2" />
              <span>{{ plant.location }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-500">
              <Calendar class="w-4 h-4 mr-2" />
              <span>已养护 {{ getDaysOwned(plant.purchaseDate) }} 天</span>
            </div>
            <div v-if="plant.family" class="flex items-center text-sm text-gray-500">
              <Leaf class="w-4 h-4 mr-2" />
              <span>{{ plant.family }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="bg-white rounded-xl p-12 text-center">
      <div class="w-20 h-20 bg-garden-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Leaf class="w-10 h-10 text-garden-500" />
      </div>
      <h3 class="text-lg font-medium text-gray-800 mb-2">
        {{ searchQuery ? '没有找到匹配的植物' : '还没有添加植物' }}
      </h3>
      <p class="text-gray-500 mb-6">
        {{ searchQuery ? '试试其他关键词' : '添加你的第一株植物，开始记录它的成长历程' }}
      </p>
      <router-link 
        to="/plants/add"
        class="inline-flex items-center space-x-2 px-6 py-3 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors"
      >
        <Plus class="w-5 h-5" />
        <span>添加植物</span>
      </router-link>
    </div>
  </div>
</template>
