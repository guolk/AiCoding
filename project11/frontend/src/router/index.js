import { createRouter, createWebHistory } from 'vue-router'
import ArticleList from '../views/ArticleList.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import TagList from '../views/TagList.vue'
import ArticleEditor from '../views/ArticleEditor.vue'
import Admin from '../views/Admin.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ArticleList
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail,
    props: true
  },
  {
    path: '/tags',
    name: 'TagList',
    component: TagList
  },
  {
    path: '/tag/:tagName',
    name: 'TagArticles',
    component: ArticleList,
    props: true
  },
  {
    path: '/editor',
    name: 'ArticleEditor',
    component: ArticleEditor
  },
  {
    path: '/editor/:id',
    name: 'ArticleEditorEdit',
    component: ArticleEditor,
    props: true
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
