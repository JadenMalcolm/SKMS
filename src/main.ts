import { createApp } from 'vue'
import App from './App.vue'
import router from './components/index.ts'
import FloatingChat from './components/FloatingChat.vue'
import ContactExpert from './components/ContactExpert.vue'
import SidebarMenu from './components/SidebarMenu.vue'

const app = createApp(App)
app.component('FloatingChat', FloatingChat)
app.component('ContactExpert', ContactExpert)
app.component('SidebarMenu', SidebarMenu)

app.use(router)
app.mount('#app')
