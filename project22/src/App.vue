<template>
  <div class="app">
    <header class="app-header">
      <h1>Vue3 富文本编辑器 - 中文输入法修复示例</h1>
      <p class="subtitle">演示 compositionstart/compositionupdate/compositionend 事件的正确处理</p>
    </header>

    <main class="app-main">
      <section class="demo-section">
        <h2>编辑器演示</h2>
        
        <div class="editor-demo">
          <RichTextEditor
            v-model="content"
            :placeholder="placeholder"
            :show-toolbar="true"
            :show-word-count="true"
            :show-composing-hint="true"
            :max-length="5000"
            :debounce-time="200"
            @compositionStart="onCompositionStart"
            @compositionUpdate="onCompositionUpdate"
            @compositionEnd="onCompositionEnd"
            @change="onChange"
            @focus="onFocus"
            @blur="onBlur"
          />
        </div>

        <div class="info-panel">
          <h3>当前状态</h3>
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">isComposing:</span>
              <span class="status-value" :class="{ 'is-active': isComposing }">
                {{ isComposing ? '拼音输入中' : '空闲' }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">isFocused:</span>
              <span class="status-value" :class="{ 'is-active': isFocused }">
                {{ isFocused ? '已聚焦' : '未聚焦' }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">字数统计:</span>
              <span class="status-value">{{ wordCount }} / 5000</span>
            </div>
          </div>
        </div>

        <div class="event-log">
          <div class="log-header">
            <h3>事件日志</h3>
            <button class="clear-btn" @click="clearLog">清空日志</button>
          </div>
          <div class="log-content" ref="logContainer">
            <div v-if="eventLogs.length === 0" class="log-empty">
              暂无事件记录，请在编辑器中输入文字...
            </div>
            <div 
              v-for="(log, index) in eventLogs" 
              :key="index" 
              class="log-item"
              :class="log.type"
            >
              <span class="log-time">[{{ log.time }}]</span>
              <span class="log-type">{{ log.type.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="info-section">
        <h2>修复方案说明</h2>
        
        <div class="info-card">
          <h3>🔧 问题根源</h3>
          <p>在中文拼音输入过程中，浏览器的事件触发顺序是：</p>
          <div class="event-flow">
            <code>compositionstart</code>
            <span class="arrow">→</span>
            <code>compositionupdate</code>
            <span class="arrow">→</span>
            <code class="highlight">input</code>
            <span class="arrow">→</span>
            <code>compositionend</code>
          </div>
          <p class="problem-text">
            ⚠️ <strong>问题</strong>：<code>input</code> 事件在 <code>compositionend</code> 之前触发，
            导致拼音中间状态被错误地当作最终内容处理。
          </p>
        </div>

        <div class="info-card">
          <h3>✅ 解决方案</h3>
          <div class="solution-steps">
            <div class="step">
              <span class="step-num">1</span>
              <div class="step-content">
                <strong>compositionstart</strong> 时设置 <code>isComposing = true</code>
              </div>
            </div>
            <div class="step">
              <span class="step-num">2</span>
              <div class="step-content">
                <strong>input</strong> 事件中检查 <code>isComposing</code>，为 <code>true</code> 则<strong>跳过</strong>处理
              </div>
            </div>
            <div class="step">
              <span class="step-num">3</span>
              <div class="step-content">
                <strong>compositionend</strong> 时：
                <ul>
                  <li>设置 <code>isComposing = false</code></li>
                  <li><strong>手动触发</strong>一次内容处理</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="info-card">
          <h3>📋 测试场景</h3>
          <div class="test-scenarios">
            <div class="scenario">
              <h4>场景 1：英文输入</h4>
              <p>输入 "Hello World"</p>
              <p class="expected">预期：每次输入后立即触发格式化</p>
            </div>
            <div class="scenario">
              <h4>场景 2：中文拼音输入</h4>
              <p>输入拼音 "zhongguo" → 选择 "中国"</p>
              <p class="expected">预期：拼音输入时不处理，选词后处理一次</p>
            </div>
            <div class="scenario">
              <h4>场景 3：粘贴操作</h4>
              <p>粘贴 "Hello 你好 World"</p>
              <p class="expected">预期：粘贴后立即处理</p>
            </div>
            <div class="scenario">
              <h4>场景 4：中英混合输入</h4>
              <p>输入 "I love 中国 very much"</p>
              <p class="expected">预期：无缝切换，正确处理</p>
            </div>
          </div>
        </div>

        <div class="info-card">
          <h3>💻 核心代码</h3>
          <pre class="code-block"><code>// 状态管理
const isComposing = ref(false)

// 开始组合输入
const onCompositionStart = () => {
  isComposing.value = true
}

// 输入事件处理
const onInput = () => {
  if (isComposing.value) return // 关键：组合输入中跳过
  processContent()
}

// 组合输入结束
const onCompositionEnd = () => {
  isComposing.value = false
  processContent() // 关键：手动触发处理
}

// 粘贴处理
const onPaste = () => {
  nextTick(() => {
    processContent()
  })
}</code></pre>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p>Vue3 富文本编辑器 - 中文输入法问题修复演示</p>
      <p class="version">基于 Composition Events API | Vue 3 + TypeScript</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import RichTextEditor from './components/RichTextEditor.vue'

// ============ 状态管理 ============
const content = ref('')
const placeholder = ref('请在此输入内容...\n\n提示：\n- 尝试输入英文，观察事件日志\n- 切换到中文拼音输入法，输入拼音后观察\n- 尝试粘贴一些文本\n\n查看左侧事件日志，了解 composition 事件的工作原理！')
const isComposing = ref(false)
const isFocused = ref(false)
const logContainer = ref<HTMLElement | null>(null)

interface EventLog {
  time: string
  type: string
  message: string
}

const eventLogs = ref<EventLog[]>([])

// ============ 计算属性 ============
const wordCount = computed(() => {
  return (content.value || '').replace(/\s/g, '').length
})

// ============ 方法 ============
const formatTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const addLog = (type: string, message: string) => {
  eventLogs.value.push({
    time: formatTime(),
    type,
    message
  })
  
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
  
  if (eventLogs.value.length > 100) {
    eventLogs.value = eventLogs.value.slice(-50)
  }
}

const clearLog = () => {
  eventLogs.value = []
  addLog('system', '日志已清空')
}

// ============ 事件处理 ============
const onCompositionStart = (event: CompositionEvent) => {
  isComposing.value = true
  addLog('composition-start', `开始拼音输入 | data: "${event.data || '(空)'}"`)
}

const onCompositionUpdate = (event: CompositionEvent) => {
  addLog('composition-update', `输入更新 | data: "${event.data}"`)
}

const onCompositionEnd = (event: CompositionEvent) => {
  isComposing.value = false
  addLog('composition-end', `输入结束 | 最终内容: "${event.data}"`)
  addLog('process', '手动触发内容处理...')
}

const onChange = (value: string) => {
  const preview = value.length > 50 ? value.substring(0, 50) + '...' : value
  addLog('change', `内容已更新 | 预览: "${preview.replace(/<[^>]*>/g, '')}"`)
}

const onFocus = () => {
  isFocused.value = true
  addLog('focus', '编辑器获得焦点')
}

const onBlur = () => {
  isFocused.value = false
  addLog('blur', '编辑器失去焦点')
}

// ============ 初始化 ============
addLog('system', '编辑器已初始化')
addLog('info', '请在编辑器中输入内容，观察事件日志')
addLog('info', '提示：切换到中文拼音输入法可以看到完整的 composition 事件流程')
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* ============ 头部 ============ */
.app-header {
  padding: 32px 24px;
  text-align: center;
  color: #fff;
}

.app-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
}

/* ============ 主内容区 ============ */
.app-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 48px;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
}

@media (max-width: 1200px) {
  .app-main {
    grid-template-columns: 1fr;
  }
}

/* ============ 演示区域 ============ */
.demo-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.demo-section h2,
.info-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.editor-demo {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* ============ 状态面板 ============ */
.info-panel {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.info-panel h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.status-grid {
  display: grid;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 6px;
}

.status-label {
  font-size: 14px;
  color: #606266;
  font-family: 'Monaco', 'Menlo', monospace;
}

.status-value {
  font-size: 14px;
  font-weight: 500;
  color: #909399;
}

.status-value.is-active {
  color: #409eff;
}

/* ============ 事件日志 ============ */
.event-log {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.log-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.clear-btn {
  padding: 6px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.log-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  background: #1e1e1e;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
}

.log-empty {
  color: #6e7681;
  text-align: center;
  padding: 20px;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #2d2d2d;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #6e7681;
  flex-shrink: 0;
}

.log-type {
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
}

.log-item.composition-start .log-type {
  background: #e6a23c;
  color: #fff;
}

.log-item.composition-update .log-type {
  background: #409eff;
  color: #fff;
}

.log-item.composition-end .log-type {
  background: #67c23a;
  color: #fff;
}

.log-item.change .log-type {
  background: #909399;
  color: #fff;
}

.log-item.focus .log-type,
.log-item.blur .log-type {
  background: #764ba2;
  color: #fff;
}

.log-item.system .log-type,
.log-item.info .log-type {
  background: #303133;
  color: #fff;
}

.log-item.process .log-type {
  background: #f56c6c;
  color: #fff;
}

.log-message {
  color: #d4d4d4;
  word-break: break-all;
}

/* ============ 信息区域 ============ */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.info-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-card p {
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  margin-bottom: 12px;
}

/* 事件流程 */
.event-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 12px;
}

.event-flow code {
  padding: 6px 12px;
  background: #303133;
  color: #409eff;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

.event-flow code.highlight {
  background: #f56c6c;
  color: #fff;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.event-flow .arrow {
  color: #909399;
  font-weight: bold;
}

.problem-text {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 12px;
}

.problem-text strong {
  color: #f56c6c;
}

/* 解决方案步骤 */
.solution-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: #f5f7fa;
  border-radius: 6px;
}

.step-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.8;
}

.step-content code {
  padding: 2px 6px;
  background: #e6f7ff;
  color: #409eff;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

.step-content ul {
  margin-top: 8px;
  padding-left: 20px;
}

.step-content li {
  color: #606266;
  margin: 4px 0;
}

/* 测试场景 */
.test-scenarios {
  display: grid;
  gap: 16px;
}

.scenario {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.scenario h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.scenario p {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.scenario .expected {
  color: #67c23a;
  font-weight: 500;
}

/* 代码块 */
.code-block {
  background: #1e1e1e;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 0;
}

.code-block code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', Consolas, monospace;
  font-size: 13px;
  line-height: 1.8;
  color: #d4d4d4;
}

/* ============ 底部 ============ */
.app-footer {
  padding: 24px;
  text-align: center;
  color: #fff;
  opacity: 0.8;
}

.app-footer p {
  font-size: 14px;
}

.version {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.7;
}
</style>
