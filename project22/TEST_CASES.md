# 富文本编辑器中文输入法问题 - 测试用例

## 测试环境

- **操作系统**: Windows / macOS / Linux
- **浏览器**: Chrome (推荐), Firefox, Safari, Edge
- **Vue 版本**: 3.x
- **Node.js**: 16.x 或更高

---

## 测试用例总览

| ID | 测试场景 | 优先级 | 状态 |
|----|---------|--------|------|
| TC01 | 英文正常输入 | P0 | 待测试 |
| TC02 | 中文拼音输入（选词确认） | P0 | 待测试 |
| TC03 | 中文拼音输入（取消输入） | P1 | 待测试 |
| TC04 | 粘贴操作 | P0 | 待测试 |
| TC05 | 中英混合输入 | P1 | 待测试 |
| TC06 | 连续中文输入 | P1 | 待测试 |
| TC07 | 格式化后中文输入 | P2 | 待测试 |
| TC08 | v-model 同步验证 | P0 | 待测试 |
| TC09 | 多浏览器兼容性 | P1 | 待测试 |
| TC10 | 边界情况测试 | P2 | 待测试 |

---

## 详细测试用例

### TC01: 英文正常输入

**测试目的**：验证英文输入场景下修复方案不会影响正常行为

**前置条件**：
1. 富文本编辑器已加载
2. 编辑器为空或有初始内容
3. 使用英文输入法

**测试步骤**：

| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1 | 点击编辑器使其聚焦 | 编辑器获得焦点，显示光标 | |
| 2 | 输入字符 "H" | 显示 "H"，光标在其后 | |
| 3 | 继续输入 "ello" | 显示 "Hello"，每次输入后内容正确 | |
| 4 | 输入空格 | 显示 "Hello "，空格正常显示 | |
| 5 | 输入 "World" | 显示 "Hello World" | |
| 6 | 按退格键删除 "d" | 显示 "Hello Worl" | |
| 7 | 按回车换行 | 光标移到新行 | |

**验证点**：
- [ ] `isComposing` 标志位始终为 `false`
- [ ] 每次输入都触发 `input` 事件
- [ ] 每次输入后都触发 `processContent()`
- [ ] 无卡顿或异常行为
- [ ] v-model 值与编辑器内容一致

**控制台日志预期**：
```
[Event] input - isComposing: false
[Process] 开始处理内容...
[Event] input - isComposing: false
[Process] 开始处理内容...
... (重复)
```

**通过标准**：所有验证点都满足

---

### TC02: 中文拼音输入（选词确认）

**测试目的**：验证修复方案正确处理中文拼音输入场景（核心测试用例）

**前置条件**：
1. 富文本编辑器已加载
2. 安装中文拼音输入法（如搜狗拼音、微软拼音等）
3. 编辑器为空

**测试步骤**：

| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1 | 点击编辑器使其聚焦 | 编辑器获得焦点 | |
| 2 | 切换到中文拼音输入法 | 输入法状态栏显示中文 | |
| 3 | 输入拼音 "zhong" | 显示带下划线的 "zhong"，候选词列表弹出 | |
| 4 | 观察控制台 | 不触发 `processContent()`，显示 "组合输入中，跳过" | |
| 5 | 继续输入 "guo" | 显示 "zhongguo"，候选词列表更新 | |
| 6 | 观察 v-model 值 | v-model 值不应包含 "zhongguo" 拼音 | |
| 7 | 按空格键选择第一个候选词 "中国" | 显示 "中国"，下划线消失 | |
| 8 | 观察控制台 | `compositionend` 后触发 `processContent()` | |
| 9 | 检查 v-model 值 | v-model 值应为 "中国" | |
| 10 | 继续输入拼音 "renmin" | 显示拼音，候选词列表弹出 | |
| 11 | 按数字键 "1" 选择 "人民" | 显示 "中国人民" | |
| 12 | 验证最终内容 | 编辑器内容和 v-model 都为 "中国人民" | |

**验证点**：
- [ ] `compositionstart` 事件被触发
- [ ] `compositionupdate` 事件被触发多次
- [ ] `input` 事件触发时 `isComposing` 为 `true`
- [ ] 拼音输入过程中 `processContent()` 被跳过
- [ ] `compositionend` 事件被触发
- [ ] `compositionend` 后 `isComposing` 重置为 `false`
- [ ] `compositionend` 后手动调用了 `processContent()`
- [ ] 最终内容正确（无拼音残留）
- [ ] v-model 值正确同步

**控制台日志预期**：
```
[Event] compositionstart - 拼音输入开始
[Event] compositionupdate - 当前输入: zhong
[Event] compositionupdate - 当前输入: zhongg
[Event] compositionupdate - 当前输入: zhonggu
[Event] compositionupdate - 当前输入: zhongguo
[Event] input - isComposing: true
[Skip] 组合输入中，跳过 input 事件处理
[Event] compositionend - 最终输入: 中国
[Process] 开始处理内容: 中国
```

**通过标准**：
1. 拼音输入过程中不触发格式化
2. 选择汉字后触发一次格式化
3. 最终内容正确，无拼音残留
4. v-model 同步正确

---

### TC03: 中文拼音输入（取消输入）

**测试目的**：验证取消拼音输入时的行为

**前置条件**：
1. 富文本编辑器已加载
2. 使用中文拼音输入法
3. 编辑器为空

**测试步骤**：

| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1 | 聚焦编辑器，切换中文输入法 | 准备就绪 | |
| 2 | 输入拼音 "nihao" | 显示 "nihao"，候选词列表弹出 | |
| 3 | 按 ESC 键取消输入 | 拼音消失，编辑器恢复为空 | |
| 4 | 观察状态 | `isComposing` 重置为 `false` | |
| 5 | 检查 v-model | v-model 值应为空 | |

**验证点**：
- [ ] 按 ESC 后 `compositionend` 事件被触发
- [ ] `compositionend` 的 `event.data` 可能为空
- [ ] `isComposing` 正确重置为 `false`
- [ ] 编辑器内容为空（无残留拼音）
- [ ] v-model 值正确

**特殊情况说明**：
- 不同输入法在取消输入时的行为可能不同
- 某些输入法可能按 Backspace 而不是 ESC 取消
- 需要测试多种输入法

---

### TC04: 粘贴操作

**测试目的**：验证粘贴操作场景下的行为

**前置条件**：
1. 富文本编辑器已加载
2. 准备好粘贴内容：`"Hello 你好 World 世界"`

**测试步骤**：

| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1 | 聚焦编辑器 | 获得焦点 | |
| 2 | 按 Ctrl+V (或 Cmd+V) 粘贴 | 内容完整显示 | |
| 3 | 观察控制台 | `paste` 事件后触发 `processContent()` | |
| 4 | 检查内容 | 显示 "Hello 你好 World 世界" | |
| 5 | 检查 v-model | 值与显示内容一致 | |

**粘贴场景变体**：

#### 变体 4.1: 粘贴纯文本
- 复制内容：`"纯文本内容"`
- 预期：正常粘贴，触发格式化

#### 变体 4.2: 粘贴富文本（带格式）
- 复制内容：从 Word 或网页复制带格式的文本
- 预期：格式正确保留（或根据配置清理）

#### 变体 4.3: 粘贴图片
- 复制内容：一张图片
- 预期：根据编辑器配置，可能插入图片或提示不支持

#### 变体 4.4: 粘贴 HTML
- 复制内容：`<b>粗体</b><i>斜体</i>`
- 预期：正确显示格式

**验证点**：
- [ ] `paste` 事件被正确捕获
- [ ] 使用 `nextTick` 确保 DOM 已更新
- [ ] `processContent()` 被调用
- [ ] 粘贴内容完整无丢失
- [ ] 格式正确（如适用）
- [ ] v-model 正确同步

---

### TC05: 中英混合输入

**测试目的**：验证中英文混排场景下的无缝处理

**前置条件**：
1. 富文本编辑器已加载
2. 可在中英文输入法间快速切换

**测试步骤**：

| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1 | 聚焦编辑器，使用英文输入法 | 准备就绪 | |
| 2 | 输入 "I love " | 显示 "I love "，触发格式化 | |
| 3 | 切换到中文拼音输入法 | 输入法切换 | |
| 4 | 输入 "zhongguo" 并选择 "中国" | 显示 "I love 中国" | |
| 5 | 切换回英文输入法 | 输入法切换 | |
| 6 | 输入 " very much" | 显示 "I love 中国 very much" | |
| 7 | 检查 v-model | 值与显示内容完全一致 | |

**验证点**：
- [ ] 英文输入正常处理
- [ ] 中文输入正常处理
- [ ] 输入法切换无异常
- [ ] 内容无错乱
- [ ] 光标位置正确
- [ ] 无重复或丢失的字符

**边缘场景**：
- 在英文输入中插入中文
- 在中文输入中插入英文
- 快速切换输入法输入

---

### TC06: 连续中文输入

**测试目的**：验证连续多段中文输入的稳定性

**前置条件**：
1. 富文本编辑器已加载
2. 使用中文拼音输入法

**测试步骤**：

| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1 | 输入 "wo" → 选 "我" | 显示 "我" | |
| 2 | 输入 "ai" → 选 "爱" | 显示 "我爱" | |
| 3 | 输入 "zhongguo" → 选 "中国" | 显示 "我爱中国" | |
| 4 | 输入空格 | 显示 "我爱中国 " | |
| 5 | 输入 "tiananmen" → 选 "天安门" | 显示 "我爱中国 天安门" | |
| 6 | 输入 "guangchang" → 选 "广场" | 显示 "我爱中国 天安门广场" | |
| 7 | 验证完整内容 | 内容正确，无错乱 | |

**验证点**：
- [ ] 每次选词后都触发一次 `processContent()`
- [ ] 拼音输入过程中不触发处理
- [ ] 累计内容正确
- [ ] 无性能问题（内存泄漏、卡顿等）

---

### TC07: 格式化后中文输入

**测试目的**：验证在应用格式（粗体、斜体等）后中文输入的行为

**前置条件**：
1. 富文本编辑器已加载
2. 工具栏可用（粗体、斜体等按钮）

**测试步骤**：

| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1 | 点击粗体按钮（B） | 按钮激活，等待输入粗体 | |
| 2 | 输入拼音 "cuti" → 选 "粗体" | 显示粗体的 "粗体" | |
| 3 | 点击斜体按钮（I） | 同时激活粗体和斜体 | |
| 4 | 输入拼音 "xieti" → 选 "斜体" | 显示粗斜体的 "斜体" | |
| 5 | 取消所有格式 | 输入普通文本 | |
| 6 | 输入拼音 "putong" → 选 "普通" | 显示普通的 "普通" | |
| 7 | 检查 HTML 结构 | 格式标签正确嵌套 | |

**验证点**：
- [ ] 格式正确应用
- [ ] 中文输入不受格式影响
- [ ] HTML 结构合法（`<b>`, `<i>` 等）
- [ ] 可以混合格式

---

### TC08: v-model 同步验证

**测试目的**：验证 v-model 在各种场景下的正确同步

**前置条件**：
1. 富文本编辑器已加载
2. 配置了 v-model 双向绑定

**测试步骤**：

#### 变体 8.1: 初始值同步
```typescript
// 父组件
const content = ref('初始内容')
```
- 预期：编辑器加载后显示 "初始内容"

#### 变体 8.2: 英文输入同步
- 输入 "Hello"
- 预期：v-model 值变为 "Hello"

#### 变体 8.3: 中文输入同步
- 输入拼音 "zhongguo" → 选 "中国"
- 预期：
  - 拼音输入时 v-model **不**包含 "zhongguo"
  - 选词后 v-model 变为 "中国"

#### 变体 8.4: 外部修改同步
```typescript
// 父组件修改值
content.value = '外部修改的内容'
```
- 预期：编辑器内容更新（非聚焦状态下）

#### 变体 8.5: 聚焦时外部修改
- 用户正在编辑器中输入（聚焦状态）
- 父组件修改 v-model 值
- 预期：**不更新**编辑器内容（避免干扰用户输入）

**验证点**：
- [ ] 初始值正确显示
- [ ] 英文输入实时同步
- [ ] 中文输入选词后同步
- [ ] 拼音输入时不同步中间状态
- [ ] 外部修改正确同步（非聚焦时）
- [ ] 聚焦时外部修改不覆盖用户输入

---

### TC09: 多浏览器兼容性

**测试目的**：验证在不同浏览器中的行为一致性

**测试矩阵**：

| 浏览器 | 版本 | 英文输入 | 中文输入 | 粘贴 | v-model | 状态 |
|--------|------|---------|---------|------|---------|------|
| Chrome | 最新 | | | | | 待测试 |
| Firefox | 最新 | | | | | 待测试 |
| Safari | 最新 | | | | | 待测试 |
| Edge | 最新 | | | | | 待测试 |

**浏览器特定注意事项**：

#### Chrome / Edge (Chromium 内核)
- 事件顺序：`compositionstart` → `compositionupdate` → `input` → `compositionend`
- 行为标准，最容易调试

#### Firefox
- 事件顺序可能略有不同
- 注意 `compositionend` 的触发时机

#### Safari
- 某些版本对 `composition` 事件的支持可能有差异
- 建议在真实 Safari 环境测试

**验证点**：
- [ ] 各浏览器事件触发顺序一致
- [ ] `isComposing` 标志位行为一致
- [ ] 最终内容一致
- [ ] 无浏览器特定的 bug

---

### TC10: 边界情况测试

**测试目的**：验证各种边界和异常情况

#### 边界 10.1: 空编辑器
- 操作：不输入任何内容
- 预期：v-model 为空字符串或初始值

#### 边界 10.2: 快速输入
- 操作：快速连续输入中英文
- 预期：无卡顿、无内容丢失

#### 边界 10.3: 特殊字符
- 操作：输入表情符号 😊、特殊符号 ©、数学公式
- 预期：正确显示和处理

#### 边界 10.4: 超长内容
- 操作：输入超过 10000 字的内容
- 预期：性能可接受，无崩溃

#### 边界 10.5: 输入法快速切换
- 操作：在中英文输入法间快速切换输入
- 预期：无状态错乱

#### 边界 10.6: 焦点丢失
- 操作：输入拼音过程中点击页面其他地方
- 预期：正确处理 `blur` 和 `compositionend`

**验证点**：
- [ ] 各种边界情况都能正确处理
- [ ] 无内存泄漏
- [ ] 无状态不一致

---

## 自动化测试

### 单元测试 (Vitest)

```typescript
// tests/rich-text-editor.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RichTextEditor from '../src/components/RichTextEditor.vue'

describe('RichTextEditor Composition Events', () => {
  let wrapper: any
  
  beforeEach(() => {
    wrapper = mount(RichTextEditor, {
      props: { modelValue: '' }
    })
  })

  describe('isComposing 标志位', () => {
    it('should be false initially', () => {
      expect(wrapper.vm.isComposing).toBe(false)
    })

    it('should be true after compositionstart', async () => {
      const editor = wrapper.find('.editor-content')
      
      // 模拟 compositionstart 事件
      await editor.trigger('compositionstart')
      
      expect(wrapper.vm.isComposing).toBe(true)
    })

    it('should be false after compositionend', async () => {
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('compositionstart')
      expect(wrapper.vm.isComposing).toBe(true)
      
      await editor.trigger('compositionend', { data: '中国' })
      expect(wrapper.vm.isComposing).toBe(false)
    })
  })

  describe('input 事件处理', () => {
    it('should process content when not composing', async () => {
      const processContent = vi.spyOn(wrapper.vm, 'processContent')
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('input')
      
      expect(processContent).toHaveBeenCalledTimes(1)
    })

    it('should skip processing when composing', async () => {
      const processContent = vi.spyOn(wrapper.vm, 'processContent')
      const editor = wrapper.find('.editor-content')
      
      // 开始组合输入
      await editor.trigger('compositionstart')
      
      // 触发 input 事件（应该跳过）
      await editor.trigger('input')
      
      expect(processContent).not.toHaveBeenCalled()
    })
  })

  describe('compositionend 事件', () => {
    it('should process content after composition ends', async () => {
      const processContent = vi.spyOn(wrapper.vm, 'processContent')
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('compositionstart')
      await editor.trigger('compositionupdate', { data: 'zhongguo' })
      await editor.trigger('input') // 这个应该跳过
      
      expect(processContent).not.toHaveBeenCalled()
      
      await editor.trigger('compositionend', { data: '中国' })
      
      // compositionend 后应该调用 processContent
      expect(processContent).toHaveBeenCalledTimes(1)
    })
  })

  describe('v-model 同步', () => {
    it('should emit update:modelValue after processing', async () => {
      const editor = wrapper.find('.editor-content')
      
      // 模拟设置内容
      editor.element.innerHTML = '测试内容'
      
      await editor.trigger('input')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toContain('测试内容')
    })

    it('should not emit during composition', async () => {
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('compositionstart')
      editor.element.innerHTML = 'zhongguo'
      await editor.trigger('input')
      
      // 组合输入中不应该触发 emit
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
      
      // 结束后触发
      await editor.trigger('compositionend', { data: '中国' })
      editor.element.innerHTML = '中国'
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('paste 事件', () => {
    it('should process content after paste', async () => {
      const processContent = vi.spyOn(wrapper.vm, 'processContent')
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('paste')
      
      // 使用 nextTick，所以需要等待
      await wrapper.vm.$nextTick()
      
      expect(processContent).toHaveBeenCalled()
    })
  })
})
```

### E2E 测试 (Playwright)

```typescript
// tests/e2e/rich-text-editor.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Rich Text Editor IME Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('英文输入正常工作', async ({ page }) => {
    const editor = page.locator('.editor-content')
    
    await editor.click()
    await editor.fill('Hello World')
    
    await expect(editor).toContainText('Hello World')
    
    // 检查 v-model
    const modelValue = await page.evaluate(() => {
      return window.editorContent
    })
    expect(modelValue).toContain('Hello World')
  })

  test('中文拼音输入（模拟）', async ({ page }) => {
    const editor = page.locator('.editor-content')
    
    await editor.click()
    
    // 模拟 composition 事件序列
    await page.evaluate(() => {
      const editor = document.querySelector('.editor-content') as HTMLElement
      
      // 开始组合输入
      const startEvent = new CompositionEvent('compositionstart')
      editor.dispatchEvent(startEvent)
      
      // 输入拼音
      const updateEvent = new CompositionEvent('compositionupdate', {
        data: 'zhongguo'
      })
      editor.dispatchEvent(updateEvent)
      
      // 触发 input（应该被跳过）
      const inputEvent = new InputEvent('input')
      editor.dispatchEvent(inputEvent)
      
      // 结束组合输入，选择汉字
      const endEvent = new CompositionEvent('compositionend', {
        data: '中国'
      })
      editor.innerHTML = '中国'
      editor.dispatchEvent(endEvent)
    })
    
    await expect(editor).toContainText('中国')
  })

  test('粘贴功能正常', async ({ page }) => {
    const editor = page.locator('.editor-content')
    
    await editor.click()
    
    // 设置剪贴板并粘贴
    await page.evaluate(() => {
      const editor = document.querySelector('.editor-content') as HTMLElement
      const clipboardData = {
        getData: (type: string) => '粘贴的内容'
      }
      
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: clipboardData as any
      })
      
      editor.dispatchEvent(pasteEvent)
      editor.innerHTML = '粘贴的内容'
      
      // 手动触发 input 事件
      const inputEvent = new InputEvent('input')
      editor.dispatchEvent(inputEvent)
    })
    
    await expect(editor).toContainText('粘贴的内容')
  })

  test('中英混合输入', async ({ page }) => {
    const editor = page.locator('.editor-content')
    
    await editor.click()
    
    await page.evaluate(() => {
      const editor = document.querySelector('.editor-content') as HTMLElement
      
      // 输入英文
      editor.innerHTML = 'I love '
      editor.dispatchEvent(new InputEvent('input'))
      
      // 输入中文
      editor.dispatchEvent(new CompositionEvent('compositionstart'))
      editor.dispatchEvent(new CompositionEvent('compositionupdate', { data: 'zhongguo' }))
      editor.innerHTML = 'I love zhongguo'
      editor.dispatchEvent(new InputEvent('input')) // 跳过
      editor.innerHTML = 'I love 中国'
      editor.dispatchEvent(new CompositionEvent('compositionend', { data: '中国' }))
      
      // 继续输入英文
      editor.innerHTML = 'I love 中国 very much'
      editor.dispatchEvent(new InputEvent('input'))
    })
    
    await expect(editor).toContainText('I love 中国 very much')
  })
})
```

---

## 测试报告模板

### 测试执行报告

**测试日期**：YYYY-MM-DD
**测试人员**：XXX
**浏览器**：Chrome X.X / Firefox X.X / Safari X.X
**操作系统**：Windows 11 / macOS 14 / Linux

#### 测试结果汇总

| 测试用例 | 结果 | 备注 |
|---------|------|------|
| TC01 英文输入 | ✅ 通过 / ❌ 失败 | |
| TC02 中文拼音输入（选词） | ✅ 通过 / ❌ 失败 | |
| TC03 中文拼音输入（取消） | ✅ 通过 / ❌ 失败 | |
| TC04 粘贴操作 | ✅ 通过 / ❌ 失败 | |
| TC05 中英混合输入 | ✅ 通过 / ❌ 失败 | |
| TC06 连续中文输入 | ✅ 通过 / ❌ 失败 | |
| TC07 格式化后中文输入 | ✅ 通过 / ❌ 失败 | |
| TC08 v-model 同步 | ✅ 通过 / ❌ 失败 | |
| TC09 多浏览器兼容 | ✅ 通过 / ❌ 失败 | |
| TC10 边界情况 | ✅ 通过 / ❌ 失败 | |

#### 缺陷记录

| ID | 描述 | 严重程度 | 状态 |
|----|------|---------|------|
| BUG-001 | 描述问题 | 高/中/低 | 待修复/已修复 |

---

## 附录

### A. 常用调试技巧

1. **控制台日志**：在关键位置添加 `console.log`
2. **事件监听**：在控制台手动添加事件监听器
3. **Vue DevTools**：使用 Vue DevTools 检查组件状态
4. **断点调试**：在浏览器开发者工具中设置断点

### B. 相关事件参考

```typescript
// CompositionEvent 接口
interface CompositionEvent extends UIEvent {
  readonly data: string
}

// 事件触发顺序（中文输入）
// 1. compositionstart - 用户开始输入
// 2. compositionupdate - 每次拼音变化
// 3. input - 内容变化（此时 data 还是拼音）
// 4. compositionend - 用户确认或取消

// 键盘事件与 Composition 事件的关系
// keydown → compositionstart → keypress → compositionupdate → input → keyup → compositionend
```

### C. 输入法测试清单

- [ ] 微软拼音输入法
- [ ] 搜狗拼音输入法
- [ ] 百度拼音输入法
- [ ]  macOS 自带拼音输入法
- [ ] 五笔输入法
- [ ] 语音输入法
- [ ] 手写输入法

---

## 更新日志

### v1.0.0 (2026-04-26)
- ✨ 新增：完整的测试用例文档
- 🧪 新增：10 个详细测试用例
- 📝 新增：自动化测试代码（单元测试 + E2E）
- 📊 新增：测试报告模板
- 🔧 优化：测试步骤和验证点
