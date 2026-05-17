<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { 
  Home, 
  Leaf, 
  CalendarDays, 
  ClipboardList, 
  ThermometerSun, 
  BookOpen, 
  Users,
  Menu,
  X,
  Bell
} from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'

const store = useGardenStore()
const route = useRoute()
const sidebarOpen = ref(false)

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/plants', label: '植物档案', icon: Leaf },
  { path: '/care', label: '养护计划', icon: CalendarDays },
  { path: '/records', label: '养护记录', icon: ClipboardList },
  { path: '/environment', label: '环境追踪', icon: ThermometerSun },
  { path: '/knowledge', label: '知识库', icon: BookOpen },
  { path: '/community', label: '社群', icon: Users }
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- 侧边栏 -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="h-16 flex items-center justify-between px-6 border-b border-gray-100">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-garden-500 rounded-lg flex items-center justify-center">
            <Leaf class="w-5 h-5 text-white" />
          </div>
          <span class="text-lg font-bold text-gray-800">园艺日志</span>
        </div>
        <button 
          class="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          @click="sidebarOpen = false"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <nav class="p-4 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
          :class="isActive(item.path) ? 'bg-garden-50 text-garden-600' : 'text-gray-600 hover:bg-gray-50'"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="font-medium">{{ item.label }}</span>
          <span 
            v-if="item.path === '/care' && store.todayTasks.length > 0"
            class="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
          >
            {{ store.todayTasks.length }}
          </span>
        </router-link>
      </nav>
    </aside>

    <!-- 遮罩层 -->
    <div 
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 顶部栏 -->
      <header class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6">
        <div class="flex items-center space-x-4">
          <button 
            class="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            @click="sidebarOpen = true"
          >
            <Menu class="w-5 h-5" />
          </button>
          <h1 class="text-xl font-semibold text-gray-800 hidden sm:block">
            {{ navItems.find(item => isActive(item.path))?.label || '园艺日志' }}
          </h1>
        </div>
        
        <div class="flex items-center space-x-3">
          <button class="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell class="w-5 h-5 text-gray-600" />
            <span 
              v-if="store.todayTasks.length > 0"
              class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
            />
          </button>
          <div class="w-8 h-8 bg-garden-100 rounded-full flex items-center justify-center">
            <span class="text-sm font-medium text-garden-600">园</span>
          </div>
        </div>
      </header>

      <!-- 主内容 -->
      <main class="flex-1 overflow-auto p-4 lg:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
