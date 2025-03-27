import { createApp } from 'vue'
import App from './App.vue'
import router from './components/index.ts'
import FloatingChat from './components/FloatingChat.vue'
// @ts-ignore
import ContactExpert from './components/ContactExpert.vue'
import ScheduleMeeting from './components/ScheduleMeeting.vue'

const app = createApp(App)

// Register FloatingChat and ContactExpert globally
app.component('FloatingChat', FloatingChat)
app.component('ContactExpert', ContactExpert)
app.component('ScheduleMeeting', ScheduleMeeting)

app.use(router)
app.mount('#app')
