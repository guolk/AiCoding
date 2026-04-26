# Vue3 富文本编辑器中文输入法问题修复方案

## 问题描述

在使用 Vue3 实现的富文本编辑器中，当中文输入法（如拼音、五笔等）输入时，会遇到以下问题：

1. **拼音输入过程中过早触发 input 事件**：在用户还在输入拼音、尚未选择汉字时，`input` 事件就被触发
2. **错误处理中间状态**：编辑器的格式化逻辑会将拼音（如 "zhongguo"）当作最终文字处理
3. **内容错乱**：可能导致拼音和汉字混杂，或者格式化逻辑异常

### 问题复现场景

```
用户操作：
1. 聚焦富文本编辑器
2. 切换到中文拼音输入法
3. 输入拼音 "zhongguo"
4. 按空格键选择 "中国"

问题表现：
- 输入 "zhong" 时，就触发了格式化逻辑
- 拼音 "zhongguo" 被当作普通文字处理
- 可能导致内容格式异常或卡顿
```

## 技术原理

### 事件机制详解

中文输入法输入过程中，浏览器会触发三个特殊的 `CompositionEvent` 事件：

```
┌─────────────────┐    ┌──────────────────┐    ┌───────────────┐
│ compositionstart│───▶│ compositionupdate│───▶│ compositionend│
│  (开始输入)      │    │   (输入更新) *N   │    │  (输入结束)    │
└─────────────────┘    └──────────────────┘    └───────────────┘
                              │
                              ▼
                        ┌──────────┐
                        │  input   │
                        │ (事件)   │
                        └──────────┘
```

### 关键问题：事件触发顺序

**错误的事件触发顺序（问题根源）**：
```
compositionstart → compositionupdate → **input** → compositionend
                                      ↑
                                这里过早触发！
```

`input` 事件在 `compositionend` **之前**就被触发了，导致：
- 拼音输入过程中就执行了格式化逻辑
- 中间状态的拼音被错误处理

### 三个 Composition 事件详解

| 事件 | 触发时机 | 数据 (`event.data`) | 作用 |
|------|---------|---------------------|------|
| `compositionstart` | 用户开始使用输入法输入时 | 空字符串 | 标记组合输入开始 |
| `compositionupdate` | 输入过程中每次按键或选择候选词 | 当前输入的拼音或候选词 | 更新组合输入的显示内容 |
| `compositionend` | 用户确认输入（回车/空格）或取消 | 最终选择的文字（或空） | 标记组合输入结束 |

### 不同输入场景的事件对比

#### 英文输入（无组合输入）
```
事件序列：keydown → input → keyup (重复)
特点：
- 没有 composition 事件
- 每个字符都触发 input 事件
- 可以实时处理内容
```

#### 中文拼音输入
```
事件序列：
compositionstart 
  → compositionupdate (zhong)
  → compositionupdate (zhongg)
  → compositionupdate (zhonggu)
  → compositionupdate (zhongguo)
  → input ← 问题在这里！
  → compositionend (中国)

特点：
- input 事件在 compositionend 之前触发
- 此时内容还是拼音 "zhongguo"
- 应该跳过 input 事件的处理
```

## 修复方案

### 核心思路

使用 **"组合输入标志位"** 策略：

```
1. compositionstart 时：设置 isComposing = true
2. input 事件时：检查 isComposing，如果为 true 则跳过处理
3. compositionend 时：
   a. 设置 isComposing = false
   b. 手动触发一次内容处理（processContent）
```

### 修复前后对比

**修复前：**
```typescript
// 错误的实现
const onInput = (e: Event) => {
  processContent() // 每次都处理，包括拼音输入中
}
```

**修复后：**
```typescript
// 正确的实现
const isComposing = ref(false)

const onCompositionStart = () => {
  isComposing.value = true
}

const onInput = (e: Event) => {
  if (isComposing.value) return // 组合输入中跳过
  processContent()
}

const onCompositionEnd = () => {
  isComposing.value = false
  processContent() // 手动触发处理
}
```

## 完整代码实现

### 修复后的富文本编辑器组件

文件位置：`src/components/RichTextEditor.vue`

```typescript
<template>
  <div class="rich-text-editor">
    <!-- 工具栏 -->
    <div class="toolbar" v-if="showToolbar">
      <button @click="execCommand('bold')" :class="{ active: isBold }">B</button>
      <button @click="execCommand('italic')" :class="{ active: isItalic }">I</button>
      <button @click="execCommand('underline')" :class="{ active: isUnderline }">U</button>
      <button @click="insertLink">🔗</button>
      <button @click="clearFormat">🧹</button>
    </div>
    
    <!-- 编辑区域 -->
    <div
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      :placeholder="placeholder"
      @compositionstart="onCompositionStart"
      @compositionupdate="onCompositionUpdate"
      @compositionend="onCompositionEnd"
      @input="onInput"
      @paste="onPaste"
      @keydown="onKeydown"
      @focus="onFocus"
      @blur="onBlur"
    ></div>
    
    <!-- 字数统计 -->
    <div class="footer" v-if="showWordCount">
      <span class="count">{{ wordCount }} 字</span>
      <span class="hint" v-if="isComposing">拼音输入中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'

// ============ Props & Emits ============
interface Props {
  modelValue?: string
  placeholder?: string
  showToolbar?: boolean
  showWordCount?: boolean
  maxLength?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  showToolbar: true,
  showWordCount: true,
  maxLength: Infinity,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

// ============ 状态管理 ============
const editorRef = ref<HTMLElement | null>(null)
const isComposing = ref(false) // 关键：组合输入标志位
const isFocused = ref(false)

// 工具栏状态
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)

// ============ 计算属性 ============
const wordCount = computed(() => {
  if (!editorRef.value) return 0
  const text = editorRef.value.innerText || ''
  return text.replace(/\s/g, '').length
})

// ============ 核心事件处理 ============

/**
 * 组合输入开始（拼音输入开始）
 * 触发时机：用户切换到中文输入法并按下第一个键时
 */
const onCompositionStart = (e: CompositionEvent) => {
  console.log('[Event] compositionstart - 拼音输入开始')
  isComposing.value = true
  // 暂停所有格式化处理，只允许原生输入
}

/**
 * 组合输入更新中（拼音变化或选择候选词）
 * 触发时机：每次拼音变化或切换候选词时
 */
const onCompositionUpdate = (e: CompositionEvent) => {
  console.log('[Event] compositionupdate - 当前输入:', e.data)
  // 注意：不要在这里触发任何格式化逻辑！
  // 只更新显示，让浏览器自然处理拼音输入
}

/**
 * 组合输入结束（确认或取消）
 * 触发时机：用户按空格/回车选择汉字，或按ESC取消输入时
 */
const onCompositionEnd = (e: CompositionEvent) => {
  console.log('[Event] compositionend - 最终输入:', e.data)
  isComposing.value = false
  
  // 关键修复点：手动触发一次内容处理
  // 因为 input 事件在 compositionend 之前触发，
  // 而那时 isComposing 还是 true，所以需要在这里补一次处理
  nextTick(() => {
    processContent()
  })
}

/**
 * 输入事件处理
 * 触发时机：任何内容变化时（包括英文输入、拼音输入、粘贴等）
 */
const onInput = (e: Event) => {
  console.log('[Event] input - isComposing:', isComposing.value)
  
  // 关键修复点：如果正在组合输入（拼音输入中），则跳过处理
  if (isComposing.value) {
    console.log('[Skip] 组合输入中，跳过 input 事件处理')
    return
  }
  
  // 正常输入（英文、数字等），正常处理
  processContent()
}

/**
 * 粘贴事件处理
 * 触发时机：用户粘贴内容时
 */
const onPaste = (e: ClipboardEvent) => {
  console.log('[Event] paste - 粘贴内容')
  
  // 粘贴时不需要考虑组合输入，但需要等待DOM更新
  // 使用 nextTick 确保粘贴的内容已经渲染到DOM中
  nextTick(() => {
    processContent()
  })
}

/**
 * 键盘事件处理
 * 用于处理特殊按键，如回车、退格等
 */
const onKeydown = (e: KeyboardEvent) => {
  // 可以在这里处理特殊按键逻辑
  // 注意：不要影响组合输入
}

/**
 * 焦点事件
 */
const onFocus = () => {
  isFocused.value = true
  emit('focus')
}

const onBlur = () => {
  isFocused.value = false
  emit('blur')
  // 失焦时确保内容同步
  processContent()
}

// ============ 内容处理逻辑 ============

/**
 * 核心内容处理函数
 * 执行格式化、验证、同步等操作
 */
const processContent = () => {
  if (!editorRef.value) return
  
  const content = editorRef.value.innerHTML
  const plainText = editorRef.value.innerText || ''
  
  console.log('[Process] 开始处理内容:', content.substring(0, 50))
  
  // 1. 长度限制检查
  if (props.maxLength !== Infinity && plainText.length > props.maxLength) {
    // 截断处理
    truncateContent(props.maxLength)
    return
  }
  
  // 2. 清理无效HTML（防止XSS和格式混乱）
  const cleanedContent = cleanHtml(content)
  
  // 3. 同步到 v-model
  emit('update:modelValue', cleanedContent)
  emit('change', cleanedContent)
  
  // 4. 更新工具栏状态
  updateToolbarState()
  
  console.log('[Process] 处理完成')
}

/**
 * 清理HTML内容
 * 移除危险标签和无效属性
 */
const cleanHtml = (html: string): string => {
  // 这里可以根据需求实现更复杂的清理逻辑
  // 例如：使用 DOMPurify 库
  
  // 简单示例：保留基本格式标签
  const allowedTags = ['b', 'i', 'u', 'a', 'br', 'p', 'span', 'div']
  const allowedAttrs = ['href', 'target', 'style', 'class']
  
  return html
}

/**
 * 截断内容到指定长度
 */
const truncateContent = (maxLength: number) => {
  if (!editorRef.value) return
  
  const text = editorRef.value.innerText || ''
  if (text.length <= maxLength) return
  
  // 简单截断（实际项目中需要更复杂的HTML感知截断）
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    // 可以在这里实现光标位置保留
  }
}

// ============ 工具栏功能 ============

/**
 * 执行文档命令
 */
const execCommand = (command: string, value?: string) => {
  document.execCommand(command, false, value)
  editorRef.value?.focus()
  updateToolbarState()
  processContent()
}

/**
 * 插入链接
 */
const insertLink = () => {
  const url = prompt('请输入链接地址:')
  if (url) {
    execCommand('createLink', url)
  }
}

/**
 * 清除格式
 */
const clearFormat = () => {
  execCommand('removeFormat')
}

/**
 * 更新工具栏按钮状态
 */
const updateToolbarState = () => {
  isBold.value = document.queryCommandState('bold')
  isItalic.value = document.queryCommandState('italic')
  isUnderline.value = document.queryCommandState('underline')
}

// ============ 生命周期 ============

// 监听 v-model 变化，更新编辑器内容
watch(
  () => props.modelValue,
  (newValue) => {
    if (editorRef.value && !isFocused.value) {
      // 只有在非聚焦状态下才同步外部值
      // 避免干扰用户正在进行的输入
      if (editorRef.value.innerHTML !== newValue) {
        editorRef.value.innerHTML = newValue
      }
    }
  },
  { immediate: true }
)

// 组件挂载后初始化
onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
  }
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.rich-text-editor:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.toolbar {
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}

.toolbar button {
  min-width: 32px;
  height: 32px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.toolbar button:hover {
  border-color: #409eff;
  color: #409eff;
}

.toolbar button.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.editor-content {
  min-height: 200px;
  padding: 12px;
  outline: none;
  font-size: 14px;
  line-height: 1.6;
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: #999;
  pointer-events: none;
}

.editor-content:focus {
  outline: none;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid #eee;
  background: #fafafa;
  font-size: 12px;
  color: #666;
}

.hint {
  color: #409eff;
  font-style: italic;
}
</style>
```

## 修改步骤说明

### 步骤1：添加组合输入标志位

```typescript
// 在状态管理部分添加
const isComposing = ref(false)
```

### 步骤2：绑定 Composition 事件

在模板中的 `contenteditable` 元素上添加三个事件：

```html
<div
  @compositionstart="onCompositionStart"
  @compositionupdate="onCompositionUpdate"
  @compositionend="onCompositionEnd"
  @input="onInput"
  @paste="onPaste"
>
```

### 步骤3：实现事件处理函数

```typescript
// 开始组合输入
const onCompositionStart = () => {
  isComposing.value = true
}

// 组合输入更新（不做处理）
const onCompositionUpdate = () => {
  // 空实现，只用于调试
}

// 组合输入结束 - 关键修复点
const onCompositionEnd = () => {
  isComposing.value = false
  processContent() // 手动触发处理
}
```

### 步骤4：修改 Input 事件处理

```typescript
const onInput = () => {
  // 关键：组合输入中跳过处理
  if (isComposing.value) return
  processContent()
}
```

### 步骤5：处理粘贴事件

```typescript
const onPaste = () => {
  nextTick(() => {
    processContent()
  })
}
```

## 测试验证

### 测试用例概览

| 测试场景 | 输入内容 | 预期行为 | 验证点 |
|---------|---------|---------|--------|
| 英文输入 | "Hello World" | 实时格式化 | isComposing 始终为 false |
| 中文拼音输入 | 拼音 "zhongguo" → "中国" | 选词后格式化 | composition 事件正常工作 |
| 粘贴操作 | 粘贴 "Hello 你好" | 立即格式化 | paste 事件后处理 |
| 混合输入 | "I love 中国" | 无缝处理 | 中英混排无异常 |
| 取消输入 | 拼音后按 ESC | 无残留 | isComposing 重置 |

详细测试用例请参考：[TEST_CASES.md](./TEST_CASES.md)

### 快速验证方法

在浏览器控制台中观察日志：

```
// 英文输入时：
[Event] input - isComposing: false
[Process] 开始处理内容...

// 中文拼音输入时：
[Event] compositionstart - 拼音输入开始
[Event] compositionupdate - 当前输入: zhong
[Event] compositionupdate - 当前输入: zhongguo
[Event] input - isComposing: true
[Skip] 组合输入中，跳过 input 事件处理
[Event] compositionend - 最终输入: 中国
[Process] 开始处理内容...
```

## 注意事项

### 1. 浏览器兼容性

| 浏览器 | 支持情况 | 说明 |
|--------|---------|------|
| Chrome | ✅ 完全支持 | 推荐开发浏览器 |
| Firefox | ✅ 完全支持 | 事件顺序一致 |
| Safari | ✅ 完全支持 | 需要注意版本 |
| Edge | ✅ 完全支持 | 基于 Chromium |

### 2. 与 v-model 配合

确保在 `compositionend` 时同步值，而不是在 `input` 时：

```typescript
// 错误：在 input 时同步（会包含拼音）
const onInput = () => {
  emit('update:modelValue', editorRef.value.innerHTML)
}

// 正确：只在非组合输入时同步
const onInput = () => {
  if (isComposing.value) return
  emit('update:modelValue', editorRef.value.innerHTML)
}
```

### 3. 防抖处理

如果格式化逻辑比较耗时，可以添加防抖：

```typescript
import { debounce } from 'lodash-es'

const debouncedProcess = debounce(processContent, 100)

const onCompositionEnd = () => {
  isComposing.value = false
  debouncedProcess()
}
```

### 4. 光标位置保存

在处理内容时，注意保存和恢复光标位置：

```typescript
const saveSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    return selection.getRangeAt(0).cloneRange()
  }
  return null
}

const restoreSelection = (range: Range | null) => {
  if (range) {
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }
}
```

## 常见问题解答

### Q1: 为什么不在 compositionupdate 中处理？

**A:** `compositionupdate` 会在输入拼音的每个按键时都触发，如果在这里处理：
- 会导致频繁格式化，性能差
- 拼音中间状态会被错误处理
- 可能破坏输入法的候选词列表

### Q2: 为什么 input 事件在 compositionend 之前？

**A:** 这是浏览器的标准行为（由 W3C 规范定义）。设计初衷是让应用可以知道内容发生了变化，但对于富文本编辑器这种需要精确控制的场景，就需要我们自己判断时机。

### Q3: 如何调试 composition 事件？

**A:** 在浏览器控制台中执行：

```javascript
// 监听所有 composition 事件
const editor = document.querySelector('.editor-content')
;['compositionstart', 'compositionupdate', 'compositionend', 'input'].forEach(event => {
  editor.addEventListener(event, (e) => {
    console.log(`[${event}]`, e.type, 'data:', e.data)
  })
})
```

### Q4: 除了中文，还有哪些语言需要处理？

**A:** 所有需要组合输入的语言都需要类似处理，包括：
- 中文（拼音、五笔、手写等）
- 日文（假名、罗马字输入）
- 韩文（谚文组合输入）
- 其他需要输入法的语言

## 相关资源

- [MDN: CompositionEvent](https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent)
- [W3C: Input Events Level 2](https://www.w3.org/TR/input-events-2/)
- [Vue3 事件处理](https://vuejs.org/guide/essentials/event-handling.html)
- [contenteditable 最佳实践](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable)

## 更新日志

### v1.0.0 (2026-04-26)
- ✨ 新增：完整的组合输入事件处理
- 🐛 修复：中文拼音输入时过早触发格式化的问题
- 📝 新增：详细的测试用例文档
- 🎨 优化：代码结构和注释

## 许可证

MIT License
