import { createApp } from 'vue'
import App from './App.vue'
import router from './components/index.ts'
import FloatingChat from './components/FloatingChat.vue'

const app = createApp(App)

// Register FloatingChat globally
app.component('FloatingChat', FloatingChat)

app.use(router)
app.mount('#app')
