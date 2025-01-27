//import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './components/index.ts'

const app = createApp(App)

app.use(router)

app.mount('#app')
