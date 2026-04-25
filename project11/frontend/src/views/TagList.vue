<template>
  <div class="tag-list">
    <h1 class="page-title">所有标签</h1>
    
    <div v-if="tags.length > 0" class="tags-container">
      <router-link
        v-for="tag in tags"
        :key="tag.id"
        :to="`/tag/${tag.name}`"
        class="tag-card"
      >
        <span class="tag-name">#{{ tag.name }}</span>
        <span class="tag-count">{{ tag.article_count }} 篇文章</span>
      </router-link>
    </div>

    <div v-else-if="!loading" class="no-tags">
      <p>暂无标签</p>
    </div>

    <div v-else class="loading">
      加载中...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { tagApi } from '../api'

const tags = ref([])
const loading = ref(false)

const fetchTags = async () => {
  loading.value = true
  try {
    const response = await tagApi.getTags()
    tags.value = response.data
  } catch (error) {
    console.error('获取标签列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
.tag-list {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.tags-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.tag-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.tag-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.tag-name {
  font-size: 1.25rem;
  color: #007bff;
  font-weight: 600;
  margin-bottom: 8px;
}

.tag-count {
  color: #999;
  font-size: 14px;
}

.no-tags {
  text-align: center;
  padding: 60px;
  color: #999;
}
</style>
