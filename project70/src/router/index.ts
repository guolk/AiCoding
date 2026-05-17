import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/plants',
    name: 'Plants',
    component: () => import('@/views/plants/PlantList.vue')
  },
  {
    path: '/plants/:id',
    name: 'PlantDetail',
    component: () => import('@/views/plants/PlantDetail.vue')
  },
  {
    path: '/plants/add',
    name: 'AddPlant',
    component: () => import('@/views/plants/AddPlant.vue')
  },
  {
    path: '/plants/identify',
    name: 'IdentifyPlant',
    component: () => import('@/views/plants/IdentifyPlant.vue')
  },
  {
    path: '/care',
    name: 'Care',
    component: () => import('@/views/care/CareCalendar.vue')
  },
  {
    path: '/care/tasks',
    name: 'CareTasks',
    component: () => import('@/views/care/CareTasks.vue')
  },
  {
    path: '/records',
    name: 'Records',
    component: () => import('@/views/records/RecordList.vue')
  },
  {
    path: '/records/add',
    name: 'AddRecord',
    component: () => import('@/views/records/AddRecord.vue')
  },
  {
    path: '/environment',
    name: 'Environment',
    component: () => import('@/views/environment/EnvironmentView.vue')
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('@/views/knowledge/KnowledgeBase.vue')
  },
  {
    path: '/knowledge/calendar',
    name: 'GardenCalendar',
    component: () => import('@/views/knowledge/GardenCalendar.vue')
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/views/community/CommunityView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
