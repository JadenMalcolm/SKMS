// Import Vue core functionality and the main App component
import { createApp } from 'vue'
import App from './App.vue'
// Import router configuration and global components
import router from './components/index.ts'
import FloatingChat from './components/FloatingChat.vue'
import ContactExpert from './components/ContactExpert.vue'
import SidebarMenu from './components/SidebarMenu.vue'
import Feedback from './components/Feedback.vue'

// Disable all console logging methods for production
// This prevents log messages from appearing in the browser console
console.log = () => {}
console.error = () => {}
console.warn = () => {}
console.info = () => {}
console.debug = () => {}

// Create the Vue application instance
const app = createApp(App)
// Register global components that can be used anywhere in the application
// without needing to import them in individual files
app.component('FloatingChat', FloatingChat)
app.component('ContactExpert', ContactExpert)
app.component('SidebarMenu', SidebarMenu)
app.component('Feedback', Feedback)

// Configure the app with router functionality
app.use(router)
// Mount the app to the DOM element with id 'app'
app.mount('#app')
