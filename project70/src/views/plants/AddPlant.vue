<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Plus } from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'
import dayjs from 'dayjs'

const store = useGardenStore()
const router = useRouter()

const form = ref({
  name: '',
  scientificName: '',
  family: '',
  genus: '',
  purchaseDate: dayjs().format('YYYY-MM-DD'),
  purchasePrice: '',
  potInfo: '',
  location: '',
  notes: ''
})

const photoUrl = ref('')

const submit = () => {
  if (!form.value.name) {
    alert('请输入植物名称')
    return
  }
  
  const newPlant = store.addPlant({
    name: form.value.name,
    scientificName: form.value.scientificName || undefined,
    family: form.value.family || undefined,
    genus: form.value.genus || undefined,
    purchaseDate: form.value.purchaseDate,
    purchasePrice: form.value.purchasePrice ? Number(form.value.purchasePrice) : undefined,
    potInfo: form.value.potInfo || undefined,
    location: form.value.location || '未设置',
    notes: form.value.notes || undefined
  })
  
  if (photoUrl.value) {
    store.addPlantPhoto(newPlant.id, {
      url: photoUrl.value,
      date: dayjs().format('YYYY-MM-DD'),
      notes: '初始照片',
      isHealthy: true
    })
  }
  
  router.push(`/plants/${newPlant.id}`)
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <button 
      class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
      @click="router.back()"
    >
      <ArrowLeft class="w-5 h-5" />
      <span>返回</span>
    </button>

    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h1 class="text-xl font-bold text-gray-800 mb-6">添加新植物</h1>
      
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">植物照片</label>
          <input 
            v-model="photoUrl"
            type="text" 
            placeholder="输入照片URL（可选）"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">植物名称 *</label>
            <input 
              v-model="form.name"
              type="text" 
              placeholder="如：绿萝"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">学名</label>
            <input 
              v-model="form.scientificName"
              type="text" 
              placeholder="如：Epipremnum aureum"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">科</label>
            <input 
              v-model="form.family"
              type="text" 
              placeholder="如：天南星科"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">属</label>
            <input 
              v-model="form.genus"
              type="text" 
              placeholder="如：麒麟叶属"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">购入日期</label>
            <input 
              v-model="form.purchaseDate"
              type="date" 
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">购入价格（元）</label>
            <input 
              v-model="form.purchasePrice"
              type="number" 
              placeholder="如：25"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">摆放位置</label>
            <input 
              v-model="form.location"
              type="text" 
              placeholder="如：客厅窗边"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">盆器信息</label>
            <input 
              v-model="form.potInfo"
              type="text" 
              placeholder="如：白色陶瓷盆 直径15cm"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">备注</label>
          <textarea 
            v-model="form.notes"
            placeholder="记录一些养护注意事项..."
            rows="3"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent resize-none"
          />
        </div>

        <div class="flex space-x-4">
          <button 
            type="button"
            class="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            @click="router.back()"
          >
            取消
          </button>
          <button 
            type="button"
            class="flex-1 px-6 py-3 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors font-medium flex items-center justify-center space-x-2"
            @click="submit"
          >
            <Plus class="w-5 h-5" />
            <span>添加植物</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
