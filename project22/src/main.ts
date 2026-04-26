import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.mount('#app')

console.log('Vue3 富文本编辑器已启动')
console.log('提示：')
console.log('  - 尝试在编辑器中输入英文')
console.log('  - 切换到中文拼音输入法，观察 composition 事件')
console.log('  - 查看事件日志了解事件触发顺序')
